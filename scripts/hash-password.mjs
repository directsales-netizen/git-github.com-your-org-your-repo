#!/usr/bin/env node
// Zero-dependency CLI to produce an ADMIN_PASSWORD_HASH value.
// Usage: node scripts/hash-password.mjs 'your-password'
import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs <password>');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
const value = `${salt}:${hash}`;

console.log('\nAdd this to .env.local:\n');
console.log(`ADMIN_PASSWORD_HASH=${value}`);
console.log('');
