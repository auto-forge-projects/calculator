'use strict';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNumber, calculate, formatResult,
  createInitialState, reduceDigit, reduceOperator, reduceEquals, reduceClear,
} from '../src/app.js';

// --- parseNumber (FR-5: geçersiz girdi yönetimi) ---

test('parseNumber: geçerli tam sayı', () => {
  assert.deepEqual(parseNumber('7'), { value: 7 });
});

test('parseNumber: geçerli ondalık sayı', () => {
  assert.deepEqual(parseNumber('3.5'), { value: 3.5 });
});

test('parseNumber: negatif sayı', () => {
  assert.deepEqual(parseNumber('-4'), { value: -4 });
});

test('parseNumber: boş string → geçersiz girdi hatası', () => {
  assert.deepEqual(parseNumber(''), { error: 'geçersiz girdi' });
});

test('parseNumber: yalnızca boşluk → geçersiz girdi hatası', () => {
  assert.deepEqual(parseNumber('   '), { error: 'geçersiz girdi' });
});

test('parseNumber: sayısal olmayan string → geçersiz girdi hatası', () => {
  assert.deepEqual(parseNumber('abc'), { error: 'geçersiz girdi' });
});

test('parseNumber: null/undefined → geçersiz girdi hatası', () => {
  assert.deepEqual(parseNumber(null), { error: 'geçersiz girdi' });
  assert.deepEqual(parseNumber(undefined), { error: 'geçersiz girdi' });
});

// --- calculate (FR-1..FR-4: dört işlem + sıfıra bölme) ---

test('calculate: toplama (FR-1)', () => {
  assert.deepEqual(calculate(7, '+', 3), { value: 10 });
});

test('calculate: çıkarma (FR-2)', () => {
  assert.deepEqual(calculate(7, '-', 3), { value: 4 });
});

test('calculate: çarpma (FR-3)', () => {
  assert.deepEqual(calculate(7, '×', 3), { value: 21 });
});

test('calculate: bölme — geçerli (FR-4)', () => {
  assert.deepEqual(calculate(9, '÷', 3), { value: 3 });
});

test('calculate: sıfıra bölme → çökmeden hata (FR-4)', () => {
  assert.deepEqual(calculate(5, '÷', 0), { error: 'sıfıra bölünemez' });
});

test('calculate: allowlist dışı operatör → geçersiz girdi hatası (SEC-2)', () => {
  assert.deepEqual(calculate(1, '%', 2), { error: 'geçersiz girdi' });
  assert.deepEqual(calculate(1, '__proto__', 2), { error: 'geçersiz girdi' });
});

test('calculate: zincirleme işlem senaryosu (2+3+4=9)', () => {
  const step1 = calculate(2, '+', 3);
  assert.deepEqual(step1, { value: 5 });
  const step2 = calculate(step1.value, '+', 4);
  assert.deepEqual(step2, { value: 9 });
});

// --- formatResult (kayan nokta gürültüsü kırpma) ---

test('formatResult: tam sayı sonuç sadece rakam gösterir', () => {
  assert.equal(formatResult(10), '10');
});

test('formatResult: ondalık sonuç gereksiz kuyruk sıfırları olmadan gösterilir', () => {
  assert.equal(formatResult(3.5), '3.5');
});

test('formatResult: kayan nokta gürültüsü kırpılır (0.1+0.2)', () => {
  const r = calculate(0.1, '+', 0.2);
  assert.equal(formatResult(r.value), '0.3');
});

// --- Durum makinesi (docs/06-uiux.md akışlarının birebir karşılığı) ---

function press(state, keys) {
  return keys.reduce((s, k) => {
    if (k === '=') return reduceEquals(s);
    if (k === 'C') return reduceClear();
    if (['+', '-', '×', '÷'].includes(k)) return reduceOperator(s, k);
    return reduceDigit(s, k);
  }, state);
}

test('UI akışı: normal — [7][+][3][=] → 10', () => {
  const s = press(createInitialState(), ['7', '+', '3', '=']);
  assert.equal(s.display, '10');
  assert.equal(s.isError, false);
});

test('UI akışı: sıfıra bölme — [5][÷][0][=] → hata, C ile temizlenir', () => {
  const afterDiv = press(createInitialState(), ['5', '÷', '0', '=']);
  assert.equal(afterDiv.display, 'Hata: sıfıra bölünemez');
  assert.equal(afterDiv.isError, true);
  const cleared = reduceClear(afterDiv);
  assert.equal(cleared.display, '0');
  assert.equal(cleared.isError, false);
});

test('UI akışı: geçersiz girdi — [C][=] → hata (boş girişte = basılırsa)', () => {
  const s = press(createInitialState(), ['C', '=']);
  assert.equal(s.display, 'Hata: geçersiz girdi');
  assert.equal(s.isError, true);
});

test('UI akışı: zincirleme işlem — [2][+][3][+][4][=] → 9', () => {
  const s = press(createInitialState(), ['2', '+', '3', '+', '4', '=']);
  assert.equal(s.display, '9');
});

test('durum makinesi: başlangıç ekranı 0 gösterir', () => {
  assert.equal(createInitialState().display, '0');
});

test('durum makinesi: baştaki sıfır yeni rakamla değişir (0 → 5, "05" olmaz)', () => {
  const s = reduceDigit(createInitialState(), '5');
  assert.equal(s.display, '5');
});

test('durum makinesi: ondalık nokta iki kez eklenmez', () => {
  const s = press(createInitialState(), ['1', '.', '2', '.', '5']);
  assert.equal(s.display, '1.25');
});

test('durum makinesi: hatadan sonra rakam basmak sıfırdan başlar', () => {
  const errored = press(createInitialState(), ['5', '÷', '0', '=']);
  const s = reduceDigit(errored, '9');
  assert.equal(s.display, '9');
  assert.equal(s.isError, false);
});

test('durum makinesi: operatör değiştirmek (henüz rakam girilmeden) yeniden hesaplamaz', () => {
  const s = press(createInitialState(), ['7', '+', '-']);
  assert.equal(s.operator, '-');
  assert.equal(s.previous, 7);
});

test('durum makinesi: tek sayı girip = basmak (operatörsüz) hiçbir şeyi bozmaz', () => {
  const s = press(createInitialState(), ['4', '2', '=']);
  assert.equal(s.display, '42');
  assert.equal(s.isError, false);
});
