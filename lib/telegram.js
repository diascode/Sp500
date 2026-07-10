'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const DAILY_LIMIT = 20;  // max messages per user per day
const MAX_TURNS   = 10;  // conversation history depth (exchanges)

module.exports = function createTelegramBot(ENV, DIR) {
  const BOT_TOKEN     = ENV.TELEGRAM_BOT_TOKEN || '';
  const ADMIN_CHAT_ID = ENV.TELEGRAM_ADMIN_CHAT_ID || '';
  const ANTHROPIC_KEY = ENV.ANTHROPIC_API_KEY || '';

  if (!BOT_TOKEN)     { console.warn('[telegram] TELEGRAM_BOT_TOKEN not set — bot disabled'); return null; }
  if (!ANTHROPIC_KEY) { console.warn('[telegram] ANTHROPIC_API_KEY not set — bot disabled');  return null; }

  const DATA_PATH = path.join(DIR, 'data', 'telegram-conversations.json');

  // ─── Persistence ────────────────────────────────────────────────────────
  // Structure: { [chatId]: { userName, messages:[{role,content,ts}], dailyCount, dailyDate, lastActivity } }
  function loadConversations() {
    try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); } catch { return {}; }
  }
  function saveConversations() {
    try {
      fs.mkdirSync(path.join(DIR, 'data'), { recursive: true });
      const tmp = DATA_PATH + '.tmp.' + Date.now();
      fs.writeFileSync(tmp, JSON.stringify(_convos, null, 2));
      fs.renameSync(tmp, DATA_PATH);
    } catch (e) { console.error('[telegram] saveConversations error:', e.message); }
  }

  const _convos = loadConversations();

  function getConvo(chatId) {
    const id = String(chatId);
    if (!_convos[id]) _convos[id] = { userName: '', messages: [], dailyCount: 0, dailyDate: '', lastActivity: '' };
    return _convos[id];
  }

  // ─── Daily limit ────────────────────────────────────────────────────────
  function todayStr() { return new Date().toISOString().slice(0, 10); }

  function checkAndIncrementLimit(chatId) {
    const c = getConvo(chatId);
    const today = todayStr();
    if (c.dailyDate !== today) { c.dailyCount = 0; c.dailyDate = today; }
    if (c.dailyCount >= DAILY_LIMIT) return false;
    c.dailyCount++;
    return true;
  }

  function remainingToday(chatId) {
    const c = getConvo(chatId);
    if (c.dailyDate !== todayStr()) return DAILY_LIMIT;
    return Math.max(0, DAILY_LIMIT - c.dailyCount);
  }

  // ─── History helpers ────────────────────────────────────────────────────
  function getHistory(chatId) {
    return getConvo(chatId).messages
      .filter(m => m.role !== 'system')
      .slice(-(MAX_TURNS * 2))
      .map(m => ({ role: m.role, content: m.content }));
  }

  function appendMessage(chatId, role, content) {
    const c = getConvo(chatId);
    c.messages.push({ role, content, ts: new Date().toISOString() });
    if (c.messages.length > 100) c.messages.splice(0, c.messages.length - 100);
    c.lastActivity = new Date().toISOString();
    saveConversations();
  }

  function clearHistory(chatId) {
    const c = getConvo(chatId);
    c.messages = [];
    c.dailyCount = 0;
    c.dailyDate = '';
    saveConversations();
  }

  // ─── HTTP helpers ────────────────────────────────────────────────────────
  function httpsPost(hostname, p, headers, body) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req = https.request(
        { hostname, path: p, method: 'POST',
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
    else        console.error('[telegram] Webhook registration failed:', JSON.stringify(res));
    return res;
  }

  // ─── Claude Haiku ────────────────────────────────────────────────────────
  const SYSTEM_PROMPT = `Você é o CraqueiBot — o assistente mais honesto (e levemente sem noção) do mercado financeiro brasileiro.

━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 SUA PERSONALIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━
Você é engraçado, atrevido e direto. Fala como um amigo que entende de mercado mas nunca perde o senso de humor.
Sua MISSÃO SAGRADA é lembrar o usuário — de forma divertida — que tudo no Craquei é simulado. Tudo. TUDO.
Como se fosse um videogame onde a única coisa real é o aprendizado (e talvez a pizza que o usuário comeu enquanto usava o app).

━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 O QUE É O CRAQUEI
━━━━━━━━━━━━━━━━━━━━━━━━━
Um SIMULADOR de análise técnica para ações. Zero dinheiro real. Zero risco real. Zero recomendação de investimento.
Pensa assim: é o GTA do mercado financeiro — você aprende tudo sem se machucar de verdade. 🎮
- Mercado disponível: 🇧🇷 B3 — ações brasileiras (PETR4, VALE3, ITUB4, WEGE3...)
- ⚠️ EUA, Europa e Emergentes: FORA do ar por enquanto. Se perguntarem, avise com bom humor e redirecione para a B3.
- Plano Grátis: 5 ações por mercado, 5 picks rastreados
- Plano Pro: tudo ilimitado + DARF + carteira completa
- Indicadores: RSI, MACD, ADX, Bollinger Bands, SMA 9/20/50/200, ATR, Padrões de Candle
- Cadastro grátis em www.craquei.com.br (só confirmar o email)
- Suporte: suporte@craquei.com.br

━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 GUARDRAILS — SEGUIR SEMPRE SEM EXCEÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━

1. FORA DO ESCOPO → RECUSE COM HUMOR
Se o usuário perguntar algo fora do Craquei ou análise técnica básica:
- NÃO responda com informações reais de mercado ("PETR4 vai subir hoje?", "devo comprar NVDA?")
- NÃO dê dicas de investimento, carteiras reais ou previsões de preço
- NÃO fale sobre criptomoedas, forex, opções, renda fixa, Tesouro Direto, fundos
- NÃO fale sobre política, economia real, Selic, inflação, resultados de empresas
- NÃO fale sobre temas não relacionados (clima, futebol, receitas, amor, vida pessoal, etc)

Ao recusar, seja engraçado. Exemplos de como recusar:
• "Amigo, eu sou um bot de simulador — pedir conselho de investimento pra mim é como pedir receita de bolo pro seu contador 😂"
• "Isso eu não respondo nem por R$ 1 milhão em dinheiro virtual 🎮 Mas me pergunta sobre RSI que aí eu brilho!"
• "Boa tentativa! Mas minha especialidade é fingir que sei de mercado dentro do Craquei. Previsão real? Nem Warren Buffett acerta sempre 😅"
• "Se eu soubesse responder isso, estaria num iate, não num servidor do Railway 🛥️"

2. SEMPRE REFORCE QUE É SIMULAÇÃO
Sempre que falar de análise, indicadores ou resultados: reforce que é SIMULADO.
Exemplos:
• "No nosso universo paralelo de simulação..."
• "Lembrando que aqui é tudo fake money, real learning 🎓"
• "Isso é válido DENTRO do simulador — na vida real, consulte um assessor de verdade!"

3. NUNCA INVENTE
Não invente funcionalidades, preços, datas, ou promessas que não existem no app.
Se não souber, diga "ESCALAR_HUMANO".

━━━━━━━━━━━━━━━━━━━━━━━━━
📏 FORMATO DAS RESPOSTAS
━━━━━━━━━━━━━━━━━━━━━━━━━
- Máximo 3 parágrafos curtos — Telegram não é Dostoiévski
- Emojis com moderação (1-3 por mensagem, não seja aquele bot irritante)
- Tom: amigo que entende de mercado + levemente stand-up comedian
- Se o usuário pedir humano: diga exatamente "ESCALAR_HUMANO"
- Se não souber responder com certeza: diga exatamente "ESCALAR_HUMANO"`;

  async function askClaude(userMessage, chatId) {
    const res = await httpsPost('api.anthropic.com', '/v1/messages', {
      'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01',
    }, {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [...getHistory(chatId), { role: 'user', content: userMessage }],
    });
    if (!res?.content?.[0]?.text) { console.error('[telegram] Claude error:', JSON.stringify(res)); return null; }
    return res.content[0].text.trim();
  }

  // ─── Escalation ──────────────────────────────────────────────────────────
  async function escalateToHuman(chatId, userName, lastMessage) {
    if (ADMIN_CHAT_ID) {
      const transcript = getConvo(chatId).messages.slice(-6)
        .map(m => `${m.role === 'user' ? '👤' : '🤖'} ${m.content}`).join('\n');
      await sendMessage(ADMIN_CHAT_ID,
        `⚠️ *Escalada para suporte humano*\n👤 ${userName || 'desconhecido'} (chat \`${chatId}\`)\n\n` +
        `*Última mensagem:*\n${lastMessage}\n\n*Histórico:*\n${transcript || '(vazio)'}`
      );
    }
    await sendMessage(chatId,
      '🙂 Encaminhei para nossa equipe! Um atendente entra em contato em breve.\n\n' +
      'Também pode escrever para *suporte@craquei.com.br* 📧'
    );
  }

  // ─── Message handler ─────────────────────────────────────────────────────
  async function handleUpdate(update) {
    const msg = update?.message;
    if (!msg?.text) return;

    const chatId   = msg.chat.id;
    const text     = msg.text.trim();
    const userName = msg.from?.first_name || msg.from?.username || '';

    // Update stored username
    const c = getConvo(chatId);
    if (userName && c.userName !== userName) { c.userName = userName; saveConversations(); }

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
      await sendMessage(chatId, '✅ Conversa zerada! Como posso ajudar?');
      return;
    }

    if (text === '/ajuda') {
      await sendMessage(chatId,
        `*Comandos:*\n/start — Iniciar\n/limpar — Zerar conversa\n/humano — Falar com atendente\n\n` +
        `Limite: *${DAILY_LIMIT} mensagens por dia* — você tem *${remainingToday(chatId)} restantes* hoje. ` +
        `Renova à meia-noite UTC 🌙`
      );
      return;
    }

    if (text === '/humano') {
      appendMessage(chatId, 'user', text);
      await escalateToHuman(chatId, userName, text);
      return;
    }

    // Daily limit check
    if (!checkAndIncrementLimit(chatId)) {
      await sendMessage(chatId,
        `😅 Você atingiu o limite de *${DAILY_LIMIT} mensagens* por dia.\n\n` +
        `Renova à meia-noite UTC! Enquanto isso, se for urgente: *suporte@craquei.com.br* 📧\n\n` +
        `Use /humano para falar com a equipe agora.`
      );
      return;
    }

    appendMessage(chatId, 'user', text);
    await sendTyping(chatId);

    const reply = await askClaude(text, chatId);

    if (!reply) {
      await sendMessage(chatId, '😕 Problema técnico aqui. Tenta de novo em instantes!');
      return;
    }

    if (reply.includes('ESCALAR_HUMANO')) {
      await escalateToHuman(chatId, userName, text);
      return;
    }

    appendMessage(chatId, 'assistant', reply);
    await sendMessage(chatId, reply);

    // Warn when approaching limit
    const remaining = remainingToday(chatId);
    if (remaining === 3) {
      await sendMessage(chatId, `_💡 Dica: você tem apenas ${remaining} mensagens restantes hoje com o bot. Use /humano se precisar de mais ajuda._`);
    }
  }

  // ─── Admin: get all conversations ────────────────────────────────────────
  function getConversations() {
    return Object.entries(_convos)
      .map(([chatId, c]) => ({
        chatId,
        userName:     c.userName || '—',
        messageCount: c.messages.length,
        dailyCount:   c.dailyDate === todayStr() ? c.dailyCount : 0,
        lastActivity: c.lastActivity || '',
        messages:     c.messages.slice(-20),
      }))
      .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
  }

  return { handleUpdate, registerWebhook, sendMessage, getConversations };
};
