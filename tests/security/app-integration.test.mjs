// Uses an already installed TypeScript compiler; never installs dependencies.
// Run with TYPESCRIPT_MODULE pointing to that compiler's typescript.js.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import {WipeActions} from '../../src/app/security/wipe-actions.ts';
import {identity} from './fixtures.mjs';

if (!process.env.TYPESCRIPT_MODULE) throw new Error('Set TYPESCRIPT_MODULE to an existing TypeScript compiler; do not install one automatically.');
const ts = createRequire(import.meta.url)(process.env.TYPESCRIPT_MODULE);
const observable = invoke => ({invoke, pipe() { return this; }});
const rxjs = {defer: invoke => observable(invoke), firstValueFrom: value => value.invoke(),
  of: value => observable(async () => value), timeout: () => value => value};
const clone = value => JSON.parse(JSON.stringify(value));

function compile(path, dependencies) {
  const code = readFileSync(new URL('../../src/app/' + path, import.meta.url), 'utf8');
  const result = ts.transpileModule(code, {
    fileName: path, reportDiagnostics: true,
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true},
  });
  assert.deepEqual(result.diagnostics, []);
  const exports = {};
  runInNewContext(result.outputText, {exports, require: name => {
    if (!(name in dependencies)) throw new Error('Unexpected dependency: ' + name);
    return dependencies[name];
  }});
  return exports;
}

const {WipeStatusEnum} = compile('WipeStatusEnum.ts', {});
const {CircledataService} = compile('services/circledata.service.ts', {
  '@angular/core': {Injectable: () => target => target},
  '@angular/common/http': {HttpHeaders: class { constructor(headers) { this.headers = headers; } }},
  'rxjs': rxjs, '../../environments/environment': {environment: {api_url: 'https://circle.invalid/api/'}},
  '../security/wipe-actions': {WipeActions}, '../WipeStatusEnum': {WipeStatusEnum},
});
const {WipeDialogService} = compile('services/wipe-dialog.service.ts', {
  '@angular/core': {Injectable: () => target => target}, 'rxjs': rxjs, '../WipeStatusEnum': {WipeStatusEnum},
});

function serviceFixture(contacts) {
  let value = JSON.stringify(contacts), failWrites = false;
  const requests = [];
  const storage = {
    get: async () => value,
    set: async (_key, next) => { if (failWrites) throw new Error('Storage full'); value = next; },
  };
  const request = (method, url, body) => observable(async () => {
    requests.push({method, url, body: clone(body), persisted: JSON.parse(value)});
    return url.includes('/v2/') ? {accepted: true} : {response_code: 200};
  });
  const service = new CircledataService(storage, {post: (url, body) => request('POST', url, body), patch: (url, body) => request('PATCH', url, body)});
  return {service, requests, storage, read: () => JSON.parse(value), failWrites: () => { failWrites = true; }};
}

test('real data service loads/checks without sending, persists before send, and marks only the matching contact', async () => {
  const token = identity().token;
  const contact = {name: 'Alice', wipe_auth_token: token, wipe_status: 1};
  const f = serviceFixture([contact, {name: 'Bob', wipe_auth_token: 'old-token', wipe_status: 1}]);
  await f.service.circles();
  await rxjs.firstValueFrom(await f.service.circleTokenCheck(contact));
  const pending = f.service.wipe(contact);
  assert.equal(f.requests.length, 0); // Merely making an observable cannot wipe.
  await rxjs.firstValueFrom(pending);
  assert.equal(f.requests.length, 1);
  const request = f.requests[0];
  assert.equal(request.url, 'https://circle.invalid/api/v2/circlecontroller/wipe');
  assert.equal(request.method, 'POST');
  assert.deepEqual(request.persisted[0].pending_wipe_command, request.body);
  assert.equal('wipe_token' in request.body, false);
  await f.service.markWiping(token);
  assert.equal(f.read()[0].wipe_status, 3); assert.equal(f.read()[1].wipe_status, 1);
  assert.deepEqual(f.read()[0].pending_wipe_command, request.body);
});

test('real service preserves legacy URLs, methods, body and contact data', async () => {
  const contact = {name: 'Old', wipe_auth_token: 'old-token', wipe_status: 1};
  const f = serviceFixture([contact]);
  await rxjs.firstValueFrom(await f.service.circleTokenCheck(contact));
  await rxjs.firstValueFrom(f.service.wipe(contact));
  assert.deepEqual(f.requests.map(({method,url,body}) => ({method,url,body})), [
    {method:'POST',url:'https://circle.invalid/api//v1/circlecontroller/add',body:{wipe_token:'old-token'}},
    {method:'PATCH',url:'https://circle.invalid/api//v1/circlecontroller/updateToWiped',body:{wipe_token:'old-token'}},
  ]);
  assert.deepEqual(f.read(), [contact]);
});

test('serialized local writes preserve contacts and the pending order during simultaneous additions', async () => {
  const a = {name:'Alice',wipe_auth_token:identity().token,wipe_status:1};
  const b = {name:'Bob',wipe_auth_token:identity().token,wipe_status:1};
  const f = serviceFixture([a]);
  await Promise.all([rxjs.firstValueFrom(f.service.wipe(a)), f.service.add(b)]);
  assert.equal(f.read().length, 2); assert.ok(f.read()[0].pending_wipe_command);
  assert.equal(f.read()[1].wipe_auth_token, b.wipe_auth_token);
});

test('removed contacts and local write failures never send a signed order', async () => {
  const contact = {name:'Alice',wipe_auth_token:identity().token,wipe_status:1};
  const removed = serviceFixture([]);
  await assert.rejects(rxjs.firstValueFrom(removed.service.wipe(contact)));
  assert.equal(removed.requests.length, 0);
  const full = serviceFixture([contact]); full.failWrites();
  await assert.rejects(rxjs.firstValueFrom(full.service.wipe(contact)));
  assert.equal(full.requests.length, 0);
});

test('duplicate contacts and service restart reuse an identical saved command', async () => {
  const contact = {name:'Alice',wipe_auth_token:identity().token,wipe_status:1};
  const f = serviceFixture([contact, {...contact,name:'Duplicate'}]);
  await rxjs.firstValueFrom(f.service.wipe(contact));
  const saved = f.read();
  assert.deepEqual(saved[0].pending_wipe_command, saved[1].pending_wipe_command);
  const restarted = serviceFixture(saved);
  assert.equal(restarted.requests.length, 0);
  await rxjs.firstValueFrom(restarted.service.wipe(contact));
  assert.deepEqual(restarted.requests[0].body, f.requests[0].body);
});

function dialogFixture(role, fail = false) {
  const alerts = [], sent = [], marked = [];
  let dismissed = 0;
  const service = new WipeDialogService({create: async options => {
    alerts.push(options);
    return {present: async () => {}, onDidDismiss: async () => ({role})};
  }}, {create: async () => ({present: async () => {}, dismiss: async () => { ++dismissed; }})},
  {instant: key => key}, {
    wipe: contact => observable(async () => { sent.push(clone(contact)); if (fail) throw new Error('Timeout'); return {response_code:200}; }),
    markWiping: async token => { marked.push(token); },
  });
  return {service, alerts, sent, marked, dismissed: () => dismissed};
}

test('cancelling or closing the single confirmation never sends a wipe', async () => {
  for (const role of ['cancel','backdrop',undefined]) {
    const f = dialogFixture(role);
    assert.equal(await f.service.confirm({name:'Alice',wipe_auth_token:'synthetic-token',wipe_status:1}), false);
    assert.deepEqual(f.sent, []); assert.deepEqual(f.marked, []);
    assert.equal(f.alerts[0].buttons.length, 2); assert.equal(f.alerts[0].inputs, undefined);
  }
});

test('twenty taps open one confirmation and send once, using the selected contact snapshot', async () => {
  const f = dialogFixture('confirm'), contact = {name:'Alice',wipe_auth_token:'synthetic-token',wipe_status:1};
  const calls = Array.from({length:20}, () => f.service.confirm(contact));
  contact.wipe_auth_token = 'different-contact';
  await Promise.all(calls);
  assert.equal(f.sent.length, 1); assert.equal(f.sent[0].wipe_auth_token, 'synthetic-token');
  assert.deepEqual(f.marked, ['synthetic-token']);
  assert.equal(f.alerts.length, 2); assert.equal(f.dismissed(), 1);
});

test('failed receipt closes the spinner, shows no success and leaves contact active', async () => {
  const f = dialogFixture('confirm', true), contact = {name:'Alice',wipe_auth_token:'synthetic-token',wipe_status:1};
  assert.equal(await f.service.confirm(contact), false);
  assert.equal(contact.wipe_status, 1); assert.deepEqual(f.marked, []);
  assert.equal(f.alerts[1].message, 'wipe_request_failed_message'); assert.equal(f.dismissed(), 1);
  // The user can explicitly retry after a failure.
  await f.service.confirm(contact); assert.equal(f.sent.length, 2);
});

test('an already requested wipe and a missing contact do not open confirmation', async () => {
  const f = dialogFixture('confirm');
  assert.equal(await f.service.confirm(undefined), false);
  assert.equal(await f.service.confirm({wipe_status:3}), false);
  assert.deepEqual(f.alerts, []); assert.deepEqual(f.sent, []);
});
