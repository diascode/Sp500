'use strict';
const https = require('https');

module.exports = function createTelegramBot(ENV) {
  const BOT_TOKEN      = ENV.TELEGRAM_BOT_TOKEN || '';
  const ADMIN_CHAT_ID  = ENV.TELEGRAM_ADMIN_CHAT_ID || '';
  const ANTHROPIC_KEY  = ENV.ANTHROPIC_API_KEY || '';

  if (!BOT_TOKEN) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN not set — bot disabled');
    return null;
  }
  if (!ANTHROPIC_KEY) {
    console.warn('[telegram] ANTHROPIC_API_KEY not set — bot disabled');
    return null;
  }

  // ─── Conversation history per chat ──────────────────────────────────────
  const _history = new Map(); // chatId → [{role, content}]
  const MAX_TURNS = 10;       // keep last 10 exchanges

  function getHistory(chatId) { return _history.get(String(chatId)) || []; }
  function saveHistory(chatId, userMsg, assistantMsg) {
    const id = String(chatId);
    const h  = getHistory(id);
    h.push({ role: 'user',      content: userMsg      });
    h.push({ role: 'assistant', content: assistantMsg });
    if (h.length > MAX_TURNS * 2) h.splice(0, 2);
    _history.set(id, h);
  }
  function clearHistory(chatId) { _history.delete(String(chatId)); }

  // ─── HTTP helpers ────────────────────────────────────────────────────────
  function httpsPost(hostname, path, headers, body) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req  = https.request(
        { hostname, path, method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
        res => { let raw = ''; res.on('data', c => raw += c); res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } }); }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // ─── Telegram API ────────────────────────────────────────────────────────
  function tgPost(method, body) {
    return httpsPost('api.telegram.org', `/bot${BOT_TOKEN}/${method}`, {}, body);
  }

  async function sendMessage(chatId, text, extra = {}) {
    return tgPost('sendMessage', { chat_id: chatId, text, parse_mode: 'Markdown', ...extra });
  }

  async function sendTyping(chatId) {
    return tgPost('sendChatAction', { chat_id: chatId, action: 'typing' });
  }

  async function registerWebhook(appUrl) {
    const url = `${appUrl}/api/telegram/webhook`;
    const res = await tgPost('setWebhook', { url, allowed_updates: ['message'] });
    if (res.ok) console.log(`[telegram] Webhook registered → ${url}`);
    else        console.error('[telegram] Webhook registration failed:', res);
    return res;
  }

  // ─── Claude API ──────────────────────────────────────────────────────────
  const SYSTEM_PROMPT = `Você é o assistente de suporte do Craquei (www.craquei.com.br).

O Craquei é um screener de análise técnica para ações da B3 e mercados globais. É uma ferramenta educacional de simulação — não é corretora, não dá recomendações de investimento.

SOBRE O PRODUTO:
- Plano Grátis: 5 ações por mercado, 5 picks rastreados
- Plano Pro: ações ilimitadas, carteira completa, relatório DARF
- Mercados: Brasil (B3), EUA, Europa, Mercados Emergentes
- Indicadores: RSI, MACD, ADX, Bollinger Bands, SMA, ATR, Padrões de Candle
- Cadastro em www.craquei.com.br — gratuito, apenas email confirmado

SUPORTE:
- Email: suporte@craquei.com.br
- Problemas com acesso: orientar a usar "Esqueceu a senha?" no login
- Problemas com email de verificação: orientar a clicar em "Reenviar email"

REGRAS:
- Responda APENAS sobre o Craquei e investimentos em geral
- Seja objetivo e amigável, em português brasileiro
- Nunca invente preços, datas ou funcionalidades que não existem
- Limite respostas a 3 parágrafos curtos — Telegram não é email
- Se não souber responder, diga exatamente: "ESCALAR_HUMANO"
- Se o usuário pedir para falar com humano, diga exatamente: "ESCALAR_HUMANO"`;

  async function askClaude(userMessage, chatId) {
    const history = getHistory(chatId);
    const body = {
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system:     SYSTEM_PROMPT,
      messages:   [...history, { role: 'user', content: userMessage }],
    };

    const res = await httpsPost('api.anthropic.com', '/v1/messages', {
      'x-api-key':         ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    }, body);

    if (!res?.content?.[0]?.text) {
      console.error('[telegram] Claude error:', JSON.stringify(res));
      return null;
    }
    return res.content[0].text.trim();
  }

  // ─── Escalation ──────────────────────────────────────────────────────────
  async function escalateToHuman(chatId, userName, lastMessage) {
    if (ADMIN_CHAT_ID) {
      const history = getHistory(chatId).slice(-6);
      const transcript = history
        .map(m => `${m.role === 'user' ? '👤' : '🤖'} ${m.content}`)
        .join('\n');

      await sendMessage(ADMIN_CHAT_ID,
        `⚠️ *Escalada para suporte humano*\n` +
        `👤 Usuário: ${userName || 'desconhecido'} (chat \`${chatId}\`)\n\n` +
        `*Última mensagem:*\n${lastMessage}\n\n` +
        `*Histórico:*\n${transcript || '(vazio)'}\n\n` +
        `Para responder, abra o chat com o usuário ou use o ID acima.`
      );
    }
    await sendMessage(chatId,
      '🙂 Encaminhei para nossa equipe de suporte. Um atendente entrará em contato em breve!\n\n' +
      'Enquanto isso, você também pode escrever para *suporte@craquei.com.br*.'
    );
  }

  // ─── Message handler ─────────────────────────────────────────────────────
  async function handleUpdate(update) {
    const msg = update?.message;
    if (!msg?.text) return;

    const chatId   = msg.chat.id;
    const text     = msg.text.trim();
    const userName = msg.from?.first_name || msg.from?.username || '';

    // Commands
    if (text === '/start') {
      clearHistory(chatId);
      await sendMessage(chatId,
        `👋 Olá${userName ? ', ' + userName : ''}! Sou o assistente do *Craquei*.\n\n` +
        `Posso te ajudar com dúvidas sobre o app, como usar os indicadores, ou seu cadastro.\n\n` +
        `Como posso te ajudar? 😊`
      );
      return;
    }

    if (text === '/limpar') {
      clearHistory(chatId);
      await sendMessage(chatId, '✅ Conversa reiniciada. Como posso ajudar?');
      return;
    }

    if (text === '/ajuda') {
      await sendMessage(chatId,
        `*Comandos disponíveis:*\n\n` +
        `/start — Iniciar conversa\n` +
        `/limpar — Reiniciar histórico\n` +
        `/humano — Falar com atendente\n\n` +
        `Ou simplesmente me escreva sua dúvida! 💬`
      );
      return;
    }

    if (text === '/humano') {
      await escalateToHuman(chatId, userName, text);
      return;
    }

    // AI response
    await sendTyping(chatId);
    const reply = await askClaude(text, chatId);

    if (!reply) {
      await sendMessage(chatId, '😕 Tive um problema técnico. Tente novamente em instantes.');
      return;
    }

    if (reply.includes('ESCALAR_HUMANO')) {
      await escalateToHuman(chatId, userName, text);
      return;
    }

    saveHistory(chatId, text, reply);
    await sendMessage(chatId, reply);
  }

  return { handleUpdate, registerWebhook, sendMessage };
};
