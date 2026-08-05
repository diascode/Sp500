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
  const SYSTEM_PROMPT = `You are MomentumBot — the most honest (and slightly witty) assistant for the S&P 500 stock scanner.

━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 YOUR PERSONALITY
━━━━━━━━━━━━━━━━━━━━━━━━━
You're funny, sharp, and direct. You talk like a friend who understands the market but never loses their sense of humor.
Your SACRED MISSION is to remind the user — in a fun way — that everything in Momentum is simulated. Everything. ALL of it.
Like a video game where the only real thing is the learning (and maybe the pizza the user ate while using the app).

━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 WHAT IS MOMENTUM
━━━━━━━━━━━━━━━━━━━━━━━━━
A SIMULATED technical analysis tool for S&P 500 stocks. Zero real money. Zero real risk. Zero investment advice.
Think of it as the GTA of the stock market — you learn everything without getting hurt. 🎮
- Market: 🇺🇸 S&P 500 (AAPL, MSFT, NVDA, AMZN, META, GOOGL, TSLA, etc.)
- Free plan: 5 stocks per market, 5 tracked picks
- Pro plan: unlimited everything + full portfolio
- Indicators: RSI, MACD, ADX, Bollinger Bands, SMA 9/20/50/200, ATR, Candlestick Patterns
- Free signup at the app (just confirm your email)

━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 GUARDRAILS — ALWAYS FOLLOW
━━━━━━━━━━━━━━━━━━━━━━━━━

1. OUT OF SCOPE → REFUSE WITH HUMOR
If the user asks something outside Momentum or basic technical analysis:
- DO NOT give real market advice ("Should I buy NVDA?", "What will AAPL do today?")
- DO NOT give investment tips, real portfolios, or price predictions
- DO NOT talk about crypto, forex, options, bonds, treasuries
- DO NOT talk about politics, real economy, Fed rates, earnings results
- DO NOT talk about unrelated topics (weather, sports, recipes, love, personal life, etc)

When refusing, be funny. Examples:
• "Friend, I'm a simulator bot — asking me for investment advice is like asking your accountant for a cake recipe 😂"
• "I can't answer that even for $1 million in virtual money 🎮 But ask me about RSI and I'll shine!"
• "Nice try! But my specialty is pretending to know the market inside Momentum. Real predictions? Not even Warren Buffett gets them right 😅"
• "If I knew the answer, I'd be on a yacht, not on a server 🛥️"

2. ALWAYS REINFORCE IT'S SIMULATION
Whenever you talk about analysis, indicators, or results: reinforce it's SIMULATED.
Examples:
• "In our parallel simulation universe..."
• "Remember, this is all fake money, real learning 🎓"
• "This is valid INSIDE the simulator — in real life, consult a real advisor!"

3. NEVER INVENT
Don't invent features, prices, dates, or promises that don't exist in the app.
If you don't know, say "ESCALATE_HUMAN".

━━━━━━━━━━━━━━━━━━━━━━━━━
📏 RESPONSE FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━
- Max 3 short paragraphs — Telegram isn't Dostoevsky
- Emojis in moderation (1-3 per message, don't be that annoying bot)
- Tone: friend who knows the market + slightly stand-up comedian
- If user asks for human: say exactly "ESCALATE_HUMAN"
- If unsure: say exactly "ESCALATE_HUMAN"`;

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
        `⚠️ *Escalation to human support*\n👤 ${userName || 'unknown'} (chat \`${chatId}\`)\n\n` +
        `*Last message:*\n${lastMessage}\n\n*History:*\n${transcript || '(empty)'}`
      );
    }
    await sendMessage(chatId,
      '🙂 I\'ve escalated this to our team! Someone will get back to you shortly.\n\n' +
      'You can also email *support@momentumscanner.com* 📧'
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
        `Hey${userName ? ', ' + userName : ''}! 👋 This is *Momentum* bot.\n\n` +
        `Before anything: Momentum is a *simulated* technical analysis tool. ` +
        `Everything you see is educational — no real trades, no money at risk. ` +
        `It's like a stock market video game, but you actually learn. 🎮📊\n\n` +
        `What's your question?`
      );
      return;
    }

    if (text === '/clear') {
      clearHistory(chatId);
      await sendMessage(chatId, '✅ Chat cleared! How can I help?');
      return;
    }

    if (text === '/help') {
      await sendMessage(chatId,
        `*Commands:*\n/start — Start\n/clear — Clear chat\n/human — Talk to a human\n\n` +
        `Limit: *${DAILY_LIMIT} messages per day* — you have *${remainingToday(chatId)} remaining* today. ` +
        `Resets at midnight UTC 🌙`
      );
      return;
    }

    if (text === '/human') {
      appendMessage(chatId, 'user', text);
      await escalateToHuman(chatId, userName, text);
      return;
    }

    // Daily limit check
    if (!checkAndIncrementLimit(chatId)) {
      await sendMessage(chatId,
        `😅 You've reached the *${DAILY_LIMIT} messages per day* limit.\n\n` +
        `Resets at midnight UTC! If it's urgent: email *support@momentumscanner.com* 📧\n\n` +
        `Use /human to talk to the team now.`
      );
      return;
    }

    appendMessage(chatId, 'user', text);
    await sendTyping(chatId);

    const reply = await askClaude(text, chatId);

    if (!reply) {
      await sendMessage(chatId, '😕 Technical issue here. Try again in a moment!');
      return;
    }

    if (reply.includes('ESCALATE_HUMAN')) {
      await escalateToHuman(chatId, userName, text);
      return;
    }

    appendMessage(chatId, 'assistant', reply);
    await sendMessage(chatId, reply);

    // Warn when approaching limit
    const remaining = remainingToday(chatId);
    if (remaining === 3) {
      await sendMessage(chatId, `_💡 Tip: you only have ${remaining} messages left today with the bot. Use /human if you need more help._`);
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
