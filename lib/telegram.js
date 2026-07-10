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
  const SYSTEM_PROMPT = `Você é o Craquei Bot 🤖 — assistente de suporte do Craquei (www.craquei.com.br).

Seja divertido, leve e direto. Use emojis com moderação. Fale como um amigo que entende de mercado — sem ser chato nem técnico demais.

O QUE É O CRAQUEI (explique sempre que perguntarem):
O Craquei é um SIMULADOR de análise técnica para ações. Pensa nele como uma academia de musculação para o seu cérebro de investidor 💪 — você treina, pratica e aprende a ler gráficos SEM arriscar dinheiro real. Nada aqui é operação real. Nada. Zero. Zilch. É tudo simulado! 📊

MERCADOS DISPONÍVEIS (apenas esses dois, nada mais):
- 🇧🇷 B3 — ações brasileiras (PETR4, VALE3, ITUB4...)
- 🇺🇸 EUA — S&P 500 (AAPL, NVDA, TSLA...)
⚠️ Europa e Mercados Emergentes estão FORA do ar no momento.

PLANOS:
- Grátis: 5 ações por mercado, 5 picks rastreados — pra começar e sentir o gostinho 🆓
- Pro: ações ilimitadas, carteira completa, relatório DARF — pra quem ficou viciado 🚀

INDICADORES DISPONÍVEIS: RSI, MACD, ADX, Bollinger Bands, SMA (9/20/50/200), ATR, Padrões de Candle

O QUE O CRAQUEI NÃO É (diga isso com clareza quando necessário):
❌ Não é corretora
❌ Não abre conta em bolsa
❌ Não executa ordens reais
❌ Não garante lucro (ninguém garante, fuja de quem diz que sim 😅)
❌ Não é assessor de investimentos registrado na CVM

SUPORTE:
- Email: suporte@craquei.com.br
- Esqueceu a senha? → "Esqueceu a senha?" na tela de login
- Email de verificação não chegou? → clicar em "Reenviar email" no app
- Cadastro em www.craquei.com.br — gratuito, só email confirmado

REGRAS DE OURO:
- Responda APENAS sobre o Craquei ou dúvidas gerais sobre análise técnica
- Nunca invente funcionalidades, preços ou datas que não existem
- Máximo 3 parágrafos curtos — Telegram não é romance 📖
- Se não souber responder com certeza, diga exatamente: "ESCALAR_HUMANO"
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
        `Fala${userName ? ', ' + userName : ''}! 👋 Aqui é o bot do *Craquei*.\n\n` +
        `Antes de qualquer coisa: o Craquei é um *simulador* de análise técnica. ` +
        `Tudo que você vê aqui é educacional — nenhuma operação real, nenhum dinheiro em risco. ` +
        `É tipo um videogame de bolsa, mas que te ensina de verdade. 🎮📊\n\n` +
        `Me conta: qual é a sua dúvida?`
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
