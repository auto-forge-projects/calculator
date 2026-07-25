'use strict';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { calculate, createInitialState, reduceDigit, reduceOperator, reduceEquals } from '../src/app.js';

// Faz 10 (PR-1.md) F4 bulgusu: DOM adaptörü ve HTML↔JS sözleşmesi hiç test edilmiyordu.
// Bu dosya (a) statik HTML↔JS sözleşme kontrolü, (b) minimal DOM stub ile smoke test,
// (c) docs/03 NFR-3 "10 ardışık işlem" senaryosunu kapsar.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
const ALLOWED_OPS = ['+', '-', '×', '÷'];

// --- (a) HTML ↔ JS sözleşmesi (statik) ---

test('sözleşme: index.html tam 11 data-digit tuşu içerir (0-9 + .)', () => {
  const digits = [...html.matchAll(/data-digit="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(digits.sort(), ['.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].sort());
});

test('sözleşme: index.html her data-op değeri allowlist içinde', () => {
  const ops = [...html.matchAll(/data-op="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(ops.length, 4);
  for (const op of ops) {
    assert.ok(ALLOWED_OPS.includes(op), `${op} allowlist dışı`);
    assert.notDeepEqual(calculate(1, op, 1), { error: 'geçersiz girdi' });
  }
});

test('sözleşme: index.html zorunlu id\'leri içerir (screen/equals/clear)', () => {
  for (const id of ['screen', 'equals', 'clear']) {
    assert.ok(html.includes(`id="${id}"`), `#${id} eksik`);
  }
});

// REQ-001: operatör butonları görsel olarak rakamların SAĞINDA (grid'in son sütununda)
// hizalı olmalı. 1. satırda C tuşu 3 sütun kaplamalı ki ÷ diğer operatörlerle (×, −, +)
// aynı (4.) sütuna düşsün — aksi halde ÷ bir sütun sola kayar (kullanıcı bulgusu).
test('sözleşme: C tuşu 3 sütun kaplar (key-span3), ÷ diğer operatörlerle aynı sütunda hizalanır', () => {
  const clearMatch = html.match(/<button[^>]*id="clear"[^>]*class="([^"]*)"/);
  assert.ok(clearMatch, 'clear butonu bulunamadı');
  assert.ok(clearMatch[1].includes('key-span3'), 'clear butonu key-span3 olmalı (3 sütun)');
  assert.ok(!clearMatch[1].includes('key-span2'), 'clear butonu artık key-span2 olmamalı');
});

// --- (b) Minimal DOM stub — smoke test (F4) ---

class FakeClassList {
  constructor() { this.set = new Set(); }
  toggle(cls, force) { if (force) this.set.add(cls); else this.set.delete(cls); }
  contains(cls) { return this.set.has(cls); }
}

class FakeElement {
  constructor() { this.dataset = {}; this.classList = new FakeClassList(); this._listeners = {}; this._text = ''; }
  addEventListener(type, cb) { (this._listeners[type] ??= []).push(cb); }
  click() { (this._listeners.click ?? []).forEach((cb) => cb()); }
  set textContent(v) { this._text = v; }
  get textContent() { return this._text; }
}

function buildFakeDom() {
  const byId = {};
  const all = [];
  const docListeners = {};
  const screen = new FakeElement(); byId.screen = screen; all.push(screen);
  const clear = new FakeElement(); byId.clear = clear; all.push(clear);
  const equals = new FakeElement(); byId.equals = equals; all.push(equals);
  for (const d of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']) {
    const b = new FakeElement(); b.dataset.digit = d; all.push(b);
  }
  for (const op of ALLOWED_OPS) {
    const b = new FakeElement(); b.dataset.op = op; all.push(b);
  }
  const doc = {
    getElementById: (id) => byId[id],
    querySelectorAll: (sel) => {
      const attr = sel.match(/\[data-(\w+)\]/)[1];
      return all.filter((el) => attr in el.dataset);
    },
    addEventListener: (type, cb) => { (docListeners[type] ??= []).push(cb); },
    dispatch: (type, evt) => { (docListeners[type] ?? []).forEach((cb) => cb(evt)); },
  };
  return { doc, byId, all };
}

// Tek modül örneği: coverage'ın tek app.js kaynağına doğru birleşmesi için app.js
// yalnız BİR KEZ (ilk stub belge ile) dinamik import edilir; senaryolar arası #clear ile sıfırlanır.
const { doc: smokeDoc, byId: smokeById, all: smokeAll } = buildFakeDom();
globalThis.document = smokeDoc;
await import('../src/app.js?dom-smoke');
const press = (dataset, val) => smokeAll.find((el) => el.dataset[dataset] === val).click();

test('DOM smoke: [7][+][3][=] tıklamaları ekranda 10 gösterir', () => {
  smokeById.clear.click();
  press('digit', '7'); press('op', '+'); press('digit', '3'); smokeById.equals.click();
  assert.equal(smokeById.screen.textContent, '10');
  assert.equal(smokeById.screen.classList.contains('error'), false);
});

test('DOM smoke: klavye ile [5][/][0][Enter] → hata metni + error sınıfı', () => {
  smokeById.clear.click();
  press('digit', '5');
  smokeDoc.dispatch('keydown', { key: '/', preventDefault() {} });
  press('digit', '0');
  smokeDoc.dispatch('keydown', { key: 'Enter', preventDefault() {} });
  assert.equal(smokeById.screen.textContent, 'Hata: sıfıra bölünemez');
  assert.equal(smokeById.screen.classList.contains('error'), true);
});

test('DOM smoke: klavye Escape ile temizleme (C ile aynı)', () => {
  smokeById.clear.click();
  press('digit', '9');
  smokeDoc.dispatch('keydown', { key: 'Escape', preventDefault() {} });
  assert.equal(smokeById.screen.textContent, '0');
});

// --- (c) docs/03 NFR-3: 10 ardışık işlem senaryosu ---

function pressKeys(state, keys) {
  return keys.reduce((s, k) => {
    if (k === '=') return reduceEquals(s);
    if (ALLOWED_OPS.includes(k)) return reduceOperator(s, k);
    return reduceDigit(s, k);
  }, state);
}

test('NFR-3: 10 ardışık işlem çökmeden doğru (sol-sağ) sonuç üretir', () => {
  // 5 +3 -2 ×4 +1 -3 ÷2 +5 -2 ×3 +1 = — 10 operatör, hesap makinesi sol-sağ (öncelik yok) hesaplar.
  const keys = ['5', '+', '3', '-', '2', '×', '4', '+', '1', '-', '3', '÷', '2', '+', '5', '-', '2', '×', '3', '+', '1', '='];
  const ops = ['+', '-', '×', '+', '-', '÷', '+', '-', '×', '+'];
  const vals = [3, 2, 4, 1, 3, 2, 5, 2, 3, 1];
  let expected = 5;
  for (let i = 0; i < ops.length; i++) expected = calculate(expected, ops[i], vals[i]).value;

  const result = pressKeys(createInitialState(), keys);
  assert.equal(result.isError, false);
  assert.equal(Number(result.display.replace(',', '.')), expected);
});
