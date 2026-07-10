#!/usr/bin/env node
// Zero-dependency admin CLI for managing product inventory over the app's
// existing /api/admin/inventory HTTP API (there is no database — this talks
// to whatever server process is running, same as the admin dashboard).
//
// Usage:
//   node scripts/inventory-cli.mjs list [--category MacBooks] [--grade A]
//   node scripts/inventory-cli.mjs create --title "MacBook Air M2" --category MacBooks --grade B --price 899 --stock 4
//   node scripts/inventory-cli.mjs update <id> --price 849 --stock 3
//   node scripts/inventory-cli.mjs delete <id> [--yes]
//
// Auth: prompts for admin email/password (or set PTN_ADMIN_EMAIL /
// PTN_ADMIN_PASSWORD env vars), then completes the SMS OTP step if the
// server has OTP configured. Target server defaults to http://localhost:3000
// — override with --url or PTN_CLI_BASE_URL.

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

async function prompt(question) {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

function extractSessionCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  const parts = setCookieHeader.split(/,(?=\s*[a-zA-Z0-9_]+=)/);
  for (const part of parts) {
    const match = part.match(/ptn_admin_session=[^;]+/);
    if (match) return match[0];
  }
  return null;
}

class InventoryClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.cookie = null;
  }

  async request(method, path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const setCookie = res.headers.get('set-cookie');
    const sessionCookie = extractSessionCookie(setCookie);
    if (sessionCookie) this.cookie = sessionCookie;

    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    return { status: res.status, json };
  }

  async login(email, password) {
    const { status, json } = await this.request('POST', '/api/admin/auth/login', { email, password });
    if (status !== 200) throw new Error(json.error ?? `Login failed (HTTP ${status}).`);
  }

  async ensureOtp() {
    const probe = await this.request('GET', '/api/admin/inventory');
    if (probe.status !== 401 || !probe.json.otpRequired) return;

    console.log('\nAdmin PIN required — requesting SMS code...');
    const send = await this.request('POST', '/api/admin/otp/send');
    if (send.status !== 200) {
      throw new Error(send.json.error ?? 'Could not send OTP (requires a SuperAdmin session).');
    }

    const code = await prompt('Enter the 6-digit PIN sent via SMS: ');
    const verify = await this.request('POST', '/api/admin/otp/verify', { code });
    if (verify.status !== 200) throw new Error(verify.json.error ?? 'OTP verification failed.');
  }

  list() {
    return this.request('GET', '/api/admin/inventory');
  }

  create(input) {
    return this.request('POST', '/api/admin/inventory', input);
  }

  update(id, patch) {
    return this.request('PATCH', `/api/admin/inventory/${encodeURIComponent(id)}`, patch);
  }

  delete(id) {
    return this.request('DELETE', `/api/admin/inventory/${encodeURIComponent(id)}`);
  }
}

function printTable(products) {
  if (products.length === 0) {
    console.log('No products found.');
    return;
  }
  const rows = products.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    grade: p.grade,
    price: `$${p.price}`,
    stock: p.stock,
  }));
  console.table(rows);
}

function buildProductInput(flags) {
  const input = {};
  if (flags.title) input.title = String(flags.title);
  if (flags.category) input.category = String(flags.category);
  if (flags.grade) input.grade = String(flags.grade);
  if (flags.price !== undefined) input.price = Number(flags.price);
  if (flags.originalPrice !== undefined) input.originalPrice = Number(flags.originalPrice);
  if (flags.stock !== undefined) input.stock = Number(flags.stock);
  if (flags.lowStockThreshold !== undefined) input.lowStockThreshold = Number(flags.lowStockThreshold);
  return input;
}

function printHelp() {
  console.log(`Premium TechNoir inventory CLI

Usage:
  node scripts/inventory-cli.mjs list [--category <name>] [--grade A|B|C|D]
  node scripts/inventory-cli.mjs create --title <t> --category <c> --grade <g> --price <n> --stock <n> [--originalPrice <n>] [--lowStockThreshold <n>]
  node scripts/inventory-cli.mjs update <id> [--title <t>] [--category <c>] [--grade <g>] [--price <n>] [--originalPrice <n>] [--stock <n>] [--lowStockThreshold <n>]
  node scripts/inventory-cli.mjs delete <id> [--yes]

Options:
  --url <base>   Target server (default: http://localhost:3000, or PTN_CLI_BASE_URL)

Credentials: set PTN_ADMIN_EMAIL / PTN_ADMIN_PASSWORD, or you'll be prompted.
`);
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const command = positional[0];

  if (!command || command === 'help' || flags.help) {
    printHelp();
    return;
  }

  const baseUrl = flags.url ?? process.env.PTN_CLI_BASE_URL ?? 'http://localhost:3000';
  const client = new InventoryClient(baseUrl);

  const email = process.env.PTN_ADMIN_EMAIL ?? (await prompt('Admin email: '));
  const password = process.env.PTN_ADMIN_PASSWORD ?? (await prompt('Admin password: '));
  await client.login(email, password);

  await client.ensureOtp();

  if (command === 'list') {
    const { status, json } = await client.list();
    if (status !== 200) throw new Error(json.error ?? `List failed (HTTP ${status}).`);
    const filtered = json.filter(
      (p) => (!flags.category || p.category === flags.category) && (!flags.grade || p.grade === flags.grade)
    );
    printTable(filtered);
    return;
  }

  if (command === 'create') {
    const input = buildProductInput(flags);
    if (!input.title || !input.category || !input.grade || input.price === undefined || input.stock === undefined) {
      throw new Error('create requires --title, --category, --grade, --price, and --stock.');
    }
    const { status, json } = await client.create(input);
    if (status !== 201) throw new Error(json.error ?? `Create failed (HTTP ${status}).`);
    console.log('Created product:');
    printTable([json]);
    return;
  }

  if (command === 'update') {
    const id = positional[1];
    if (!id) throw new Error('update requires a product id: update <id> [--flags]');
    const patch = buildProductInput(flags);
    if (Object.keys(patch).length === 0) throw new Error('update requires at least one field to change.');
    const { status, json } = await client.update(id, patch);
    if (status !== 200) throw new Error(json.error ?? `Update failed (HTTP ${status}).`);
    console.log('Updated product:');
    printTable([json]);
    return;
  }

  if (command === 'delete') {
    const id = positional[1];
    if (!id) throw new Error('delete requires a product id: delete <id>');
    if (!flags.yes) {
      const confirm = await prompt(`Delete product ${id}? Type "yes" to confirm: `);
      if (confirm.toLowerCase() !== 'yes') {
        console.log('Aborted.');
        return;
      }
    }
    const { status, json } = await client.delete(id);
    if (status !== 200) throw new Error(json.error ?? `Delete failed (HTTP ${status}).`);
    console.log(`Deleted product ${id}.`);
    return;
  }

  throw new Error(`Unknown command "${command}". Run with --help for usage.`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
