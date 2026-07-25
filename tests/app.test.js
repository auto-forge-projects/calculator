'use strict';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNumber, calculate, formatResult } from '../src/app.js';

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
