'use strict';
// One-time migration: rename subscriptionId → stripeCustomerId and add missing Stripe fields.
// Run with: node scripts/migrate-stripe-fields.js
// Safe to run multiple times (idempotent).

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

if (!fs.existsSync(DB_PATH)) {
  console.log('No users.json found — nothing to migrate.');
  process.exit(0);
}

const users = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
let changed = 0;

for (const u of users) {
  let dirty = false;

  // Rename subscriptionId → stripeCustomerId
  if ('subscriptionId' in u) {
    u.stripeCustomerId = u.stripeCustomerId || u.subscriptionId;
    delete u.subscriptionId;
    dirty = true;
  }

  // Add missing fields with safe defaults
  const defaults = {
    stripeCustomerId: null,
    stripeSubId: null,
    subStatus: null,
    paymentMethodLast4: null,
    failedPaymentCount: 0,
    paymentHistory: [],
  };
  for (const [k, v] of Object.entries(defaults)) {
    if (!(k in u)) { u[k] = v; dirty = true; }
  }

  if (dirty) changed++;
}

if (changed === 0) {
  console.log('All users already up to date — nothing to do.');
  process.exit(0);
}

const tmp = DB_PATH + '.tmp.' + Date.now();
fs.writeFileSync(tmp, JSON.stringify(users, null, 2));
fs.renameSync(tmp, DB_PATH);
console.log(`Migrated ${changed} of ${users.length} users.`);
