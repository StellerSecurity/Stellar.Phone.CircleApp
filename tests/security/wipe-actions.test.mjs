// Node 24 built-in test runner; synthetic identities and in-memory transports only.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verify} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {WipeActions, tokenKind} from '../../src/app/security/wipe-actions.ts';
import {prepare, canonical} from '../../src/app/security/wipe-signer.js';
import {identity} from './fixtures.mjs';

function fixture(overrides = {}) {
  const saved = new Map(), sent = [], legacy = [];
  const dependencies = {
    checkLegacy: async token => { legacy.push(['check', token]); return {response_code: 200}; },
    wipeLegacy: async token => { legacy.push(['wipe', token]); return {response_code: 200}; },
    sendSigned: async command => { sent.push(structuredClone(command)); return {accepted: true}; },
    readCommand: async token => saved.get(token),
    saveCommand: async (token, command) => { saved.set(token, structuredClone(command)); },
    ...overrides,
  };
  return {saved, sent, legacy, dependencies, actions: new WipeActions(dependencies)};
}

test('construction, loading and adding a signed token never send or create an order', async () => {
  const f = fixture();
  assert.equal((await f.actions.check(identity().token)).response_code, 200);
  assert.deepEqual(f.sent, []); assert.deepEqual(f.legacy, []); assert.equal(f.saved.size, 0);
});

test('legacy tokens use only the original operations and preserve the response', async () => {
  assert.equal(tokenKind('spw-legacy-token'), 'legacy');
  assert.equal(tokenKind('spw2LegacyTokenWithoutDot'), 'legacy');
  const receipt = {id: 'old-device', status: 2};
  const f = fixture({wipeLegacy: async token => { assert.equal(token, 'old-token'); return receipt; }});
  await f.actions.check('old-token');
  assert.equal(await f.actions.wipe('old-token'), receipt);
  assert.deepEqual(f.legacy, [['check', 'old-token']]);
  assert.equal(f.saved.size, 0); assert.deepEqual(f.sent, []);
});

test('old API application errors are not presented as success', async () => {
  for (const response of [null, {response_code: 400}, {response_code: 500}]) {
    const f = fixture({wipeLegacy: async () => response});
    await assert.rejects(f.actions.wipe('old-token'));
    assert.deepEqual(f.sent, []);
  }
});

test('new command is v3, valid P-256, exactly eight public fields and no expiry/token', async () => {
  const id = identity(), f = fixture();
  await f.actions.wipe(id.token);
  const command = f.sent[0];
  assert.equal(command.protocol, 3);
  assert.equal(command.registration_id, id.id);
  assert.deepEqual(Object.keys(command).sort(), ['action','command_id','issued_at','key_id','key_version','protocol','registration_id','signature']);
  assert.ok(verify('sha256', canonical(command), {key: id.pair.publicKey, dsaEncoding: 'ieee-p1363'}, Buffer.from(command.signature, 'base64url')));
  assert.equal(JSON.stringify(command).includes(id.token), false);
  assert.deepEqual(f.saved.get(id.token), command);
  assert.deepEqual(f.legacy, []);
});

test('twenty simultaneous clicks create and send only one order', async () => {
  const f = fixture(), id = identity();
  await Promise.all(Array.from({length: 20}, () => f.actions.wipe(id.token)));
  assert.equal(f.sent.length, 1); assert.equal(f.saved.size, 1);
});

test('timeout and restart preserve the exact command, even after ten years', async () => {
  const f = fixture(), id = identity();
  f.dependencies.sendSigned = async command => { f.sent.push(structuredClone(command)); throw new Error('Timeout after acceptance'); };
  await assert.rejects(f.actions.wipe(id.token));
  const first = structuredClone(f.sent[0]);
  f.dependencies.sendSigned = async command => { f.sent.push(structuredClone(command)); return {accepted: true}; };
  const restarted = new WipeActions(f.dependencies);
  assert.equal(f.sent.length, 1); // No automatic retry on construction.
  const now = Date.now;
  try {
    Date.now = () => now() + 315360000000;
    await restarted.wipe(id.token);
  } finally { Date.now = now; }
  assert.deepEqual(f.sent[1], first);
});

test('even after success, another explicit attempt resends the same command', async () => {
  const f = fixture(), id = identity();
  await f.actions.wipe(id.token); await f.actions.wipe(id.token);
  assert.deepEqual(f.sent[0], f.sent[1]);
});

test('failed durable storage prevents all sending', async () => {
  const f = fixture({saveCommand: async () => { throw new Error('Storage full'); }});
  await assert.rejects(f.actions.wipe(identity().token));
  assert.deepEqual(f.sent, []); assert.deepEqual(f.legacy, []);
});

test('a rejected new request never falls back to the legacy wipe API', async () => {
  for (const accepted of [false, undefined, 'true', 1]) {
    const f = fixture({sendSigned: async () => ({accepted})});
    await assert.rejects(f.actions.wipe(identity().token));
    assert.deepEqual(f.legacy, []);
  }
});

test('malformed/reserved tokens are never sent to any API', async () => {
  const good = identity();
  const tokens = ['', 'spw2.bad', 'SPW2.bad', 'spw3.bad', 'x'.repeat(513), good.token + '=', good.token.slice(0, -7),
    'spw2.' + Buffer.concat([good.binary, Buffer.from([0])]).toString('base64url'),
    identity({privateKey: identity().pair.privateKey}).token];
  for (const token of tokens) {
    const f = fixture();
    await assert.rejects(f.actions.check(token));
    await assert.rejects(f.actions.wipe(token));
    assert.deepEqual(f.sent, []); assert.deepEqual(f.legacy, []); assert.equal(f.saved.size, 0);
  }
});

test('wrong target, edited signature, added expiry and old v2 stored orders fail closed', async () => {
  const a = identity(), b = identity();
  const command = await (await prepare(a.token)).sign();
  const bad = [await (await prepare(b.token)).sign(), {...command, signature: 'A'.repeat(86)},
    {...command, issued_at: command.issued_at - 1}, {...command, expires_at: 0}, {...command, protocol: 2}];
  for (const corrupt of bad) {
    const f = fixture(); f.saved.set(a.token, corrupt);
    await assert.rejects(f.actions.wipe(a.token));
    assert.deepEqual(f.sent, []); assert.deepEqual(f.legacy, []);
    assert.deepEqual(f.saved.get(a.token), corrupt);
  }
});

test('two contacts cannot reuse one another’s order', async () => {
  const f = fixture(), a = identity(), b = identity();
  await Promise.all([f.actions.wipe(a.token), f.actions.wipe(b.token)]);
  assert.deepEqual(new Set(f.sent.map(c => c.registration_id)), new Set([a.id, b.id]));
  assert.notEqual(f.sent[0].command_id, f.sent[1].command_id);
});

test('whitespace around a new token does not create separate orders', async () => {
  const f = fixture(), id = identity();
  assert.equal(tokenKind(' \n' + id.token + ' '), 'signed');
  await Promise.all([f.actions.wipe(id.token), f.actions.wipe(' \n' + id.token + ' ')]);
  assert.equal(f.sent.length, 1);
});

test('all eight languages cover the confirmation, receipt and error states', () => {
  for (const locale of ['en','da','de','es','fr','nl','no','sv']) {
    const data = JSON.parse(readFileSync(new URL(`../../src/assets/i18n/${locale}.json`, import.meta.url)));
    for (const key of ['wipe_confirmation_message','wipe_set_header','wipe_set_message','error_title','token_invalid_message','wipe_request_failed_message']) {
      assert.ok(data[key]?.length > 0, `${locale}: ${key}`);
    }
    assert.ok(data.wipe_set_header.includes('{{ contactName }}'));
  }
});
