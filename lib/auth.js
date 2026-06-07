'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

module.exports = function createAuth(ENV, DIR) {
  let jwt;
  try { jwt = require('jsonwebtoken'); } catch { console.error('❌ jsonwebtoken not installed. Run: npm install'); process.exit(1); }

  const JWT_SECRET = ENV.JWT_SECRET || 'dev-secret-change-me';
  if (ENV.NODE_ENV === 'production' && (!ENV.JWT_SECRET || JWT_SECRET === 'dev-secret-change-me')) {
    console.error('❌ FATAL: JWT_SECRET is not set or is using the default dev value in production. Set the JWT_SECRET environment variable.');
    process.exit(1);
  }

  function signToken(user) { return jwt.sign({ id: user.id, email: user.email, tier: user.tier }, JWT_SECRET, { expiresIn: '30d' }); }
  function verifyToken(token) { try { return jwt.verify(token, JWT_SECRET); } catch { return null; } }

  // ─── EMAIL ─────────────────────────────────────────────────────────────
  const RESEND_API_KEY = ENV.RESEND_API_KEY || '';
  const RESEND_FROM = ENV.RESEND_FROM_EMAIL || 'Craquei <noreply@craquei.com.br>';
  const APP_URL_BASE = ENV.APP_URL || 'http://localhost:8080';

  function sendEmail(to, subject, html) {
    if (!RESEND_API_KEY) { console.warn('[email] RESEND_API_KEY not set — skipping'); return Promise.resolve(); }
    return new Promise((resolve) => {
      const body = JSON.stringify({ from: RESEND_FROM, to: [to], subject, html });
      const https = require('https');
      const req = https.request({
        hostname: 'api.resend.com', path: '/emails', method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      }, res => {
        let raw = '';
        res.on('data', d => raw += d);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[email] sent to ${to} — status ${res.statusCode}`);
          } else {
            console.error(`[email] failed to ${to} — status ${res.statusCode}: ${raw}`);
          }
          resolve(res.statusCode);
        });
      });
      req.on('error', e => { console.error('[email] send error:', e.message); resolve(null); });
      req.write(body); req.end();
    });
  }

  // ─── TOKEN STORES ───────────────────────────────────────────────────────
  const _resetTokens = new Map();   // token → { email, expiresAt }
  const _verifyTokens = new Map();  // token → { email, expiresAt }
  const _verifyCooldown = new Map();// email → lastSentAt (ms)

  function makeToken() { return crypto.randomBytes(32).toString('hex'); }
  function validateCPF(cpf) {
    const d = cpf.replace(/\D/g, '');
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    let s = 0; for (let i = 0; i < 9; i++) s += +d[i] * (10 - i);
    let r = (s * 10) % 11; if (r >= 10) r = 0; if (r !== +d[9]) return false;
    s = 0; for (let i = 0; i < 10; i++) s += +d[i] * (11 - i);
    r = (s * 10) % 11; if (r >= 10) r = 0; return r === +d[10];
  }

  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of _resetTokens) if (v.expiresAt < now) _resetTokens.delete(k);
    for (const [k, v] of _verifyTokens) if (v.expiresAt < now) _verifyTokens.delete(k);
  }, 60_000);

  // ─── USER DB ────────────────────────────────────────────────────────────
  const DB_PATH = path.join(DIR, 'data', 'users.json');

  function loadUsers() {
    try {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (e) {
      if (e.code === 'ENOENT') return []; // first run — file missing
      console.error('[FATAL] users.json is corrupt — refusing to start. Restore from backup.');
      process.exit(1);
    }
  }

  let _saveLock = Promise.resolve();

  function saveUsers(usersArr) {
    _saveLock = _saveLock.then(() => {
      fs.mkdirSync(path.join(DIR, 'data'), { recursive: true });
      const tmp = DB_PATH + '.tmp.' + Date.now();
      fs.writeFileSync(tmp, JSON.stringify(usersArr, null, 2));
      let attempts = 0;
      while (attempts < 3) {
        try {
          fs.renameSync(tmp, DB_PATH);
          return;
        } catch (err) {
          attempts++;
          if (attempts >= 3) throw err;
          // busy-wait ~50 ms between attempts
          const until = Date.now() + 50;
          while (Date.now() < until) {}
        }
      }
    }).catch(err => {
      console.error('[saveUsers error]', err);
    });
    return _saveLock;
  }

  const ADMIN_EMAIL = (ENV.ADMIN_EMAIL || '').toLowerCase();
  const users = loadUsers();
  let needsSave = false;
  if (ADMIN_EMAIL) {
    users.forEach(u => {
      if (u.email === ADMIN_EMAIL && u.tier !== 'admin') { u.tier = 'admin'; needsSave = true; }
      if (u.email !== ADMIN_EMAIL && u.tier === 'admin') { u.tier = 'free'; needsSave = true; }
    });
  }
  if (needsSave) saveUsers(users);

  function hashPassword(pw) {
    const salt = crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) =>
      crypto.scrypt(pw, salt, 64, (err, hash) =>
        err ? reject(err) : resolve(salt + ':' + hash.toString('hex'))
      )
    );
  }
  function verifyPassword(pw, stored) {
    const [salt, hash] = stored.split(':');
    return new Promise((resolve, reject) =>
      crypto.scrypt(pw, salt, 64, (err, derived) =>
        err ? reject(err) : resolve(crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derived))
      )
    );
  }
  function findUser(email) { return users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  function nextId() {
    return users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  }

  // ─── SUBSCRIPTION TIERS ─────────────────────────────────────────────────
  const TIERS = {
    free:  { scansPerDay: 999999, maxTrackedPicks: 5,    maxStocksPerMarket: 5,    scanIntervalMs: 80, name: 'Free' },
    pro:   { scansPerDay: 999999, maxTrackedPicks: 9999,  maxStocksPerMarket: 9999, scanIntervalMs: 80, name: 'Pro' },
    admin: { scansPerDay: 999999, maxTrackedPicks: 9999,  maxStocksPerMarket: 9999, scanIntervalMs: 80, name: 'Admin' },
  };

  // ─── AUTH RATE LIMITER ──────────────────────────────────────────────────
  const _authAttempts = new Map();
  const AUTH_MAX = 10;
  const AUTH_WINDOW_MS = 15 * 60 * 1000;

  function checkAuthRateLimit(ip) {
    const now = Date.now();
    const entry = _authAttempts.get(ip);
    if (!entry || now > entry.resetAt) {
      _authAttempts.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
      return true;
    }
    if (entry.count >= AUTH_MAX) return false;
    entry.count++;
    return true;
  }

  function getAuthUser(req) {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const decoded = verifyToken(token);
    if (!decoded) return null;
    // US-97: reject tokens issued before password change
    const user = findUser(decoded.email);
    if (user && user.passwordChangedAt) {
      const changedAtSec = new Date(user.passwordChangedAt).getTime() / 1000;
      if (decoded.iat < changedAtSec) return null;
    }
    return decoded;
  }

  return {
    signToken, verifyToken, sendEmail,
    _resetTokens, _verifyTokens, _verifyCooldown,
    makeToken, validateCPF,
    DB_PATH, saveUsers,
    ADMIN_EMAIL, users,
    hashPassword, verifyPassword, findUser, nextId,
    TIERS,
    AUTH_MAX, AUTH_WINDOW_MS,
    checkAuthRateLimit, getAuthUser,
    APP_URL_BASE,
  };
};
