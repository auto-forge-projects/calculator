'use strict';

// --- Saf fonksiyonlar (parser + calculator) — bkz. docs/05-architecture.md ---
// NFR-2/SEC-1: eval()/Function()/new Function KESİNLİKLE kullanılmaz. Girdi yalnız
// Number() ile sayıya çevrilir; operatör SABİT allowlist tablosundan seçilir (SEC-2).

export function parseNumber(raw) {
  if (raw === null || raw === undefined) return { error: 'geçersiz girdi' };
  const trimmed = String(raw).trim();
  if (trimmed === '') return { error: 'geçersiz girdi' };
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return { error: 'geçersiz girdi' };
  return { value: n };
}

const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => a / b,
};

export function calculate(a, op, b) {
  const fn = Object.prototype.hasOwnProperty.call(OPERATORS, op) ? OPERATORS[op] : null;
  if (typeof fn !== 'function') return { error: 'geçersiz girdi' };
  if (op === '÷' && b === 0) return { error: 'sıfıra bölünemez' };
  return { value: fn(a, b) };
}

export function formatResult(value) {
  if (!Number.isFinite(value)) return 'Hata: geçersiz girdi';
  const rounded = Math.round(value * 1e10) / 1e10;
  return String(rounded);
}

// --- Durum makinesi (saf reducer'lar — DOM'dan bağımsız, doğrudan test edilir) ---

export function createInitialState() {
  return { display: '0', previous: null, operator: null, awaitingNext: false, hasEntered: false, isError: false };
}

function errorState(msg) {
  return { display: `Hata: ${msg}`, previous: null, operator: null, awaitingNext: false, hasEntered: false, isError: true };
}

export function reduceDigit(state, d) {
  const base = state.isError ? createInitialState() : state;
  let display;
  if (base.awaitingNext || base.display === '0') {
    display = d === '.' ? '0.' : d;
  } else if (d === '.' && base.display.includes('.')) {
    display = base.display;
  } else {
    display = base.display + d;
  }
  return { ...base, display, awaitingNext: false, hasEntered: true, isError: false };
}

export function reduceOperator(state, op) {
  if (state.isError) return state;
  const parsed = parseNumber(state.display);
  if ('error' in parsed) return errorState(parsed.error);

  let previous = parsed.value;
  if (state.previous !== null && state.operator && !state.awaitingNext) {
    const result = calculate(state.previous, state.operator, parsed.value);
    if ('error' in result) return errorState(result.error);
    previous = result.value;
  } else if (state.previous !== null && state.awaitingNext) {
    previous = state.previous;
  }
  return {
    display: formatResult(previous), previous, operator: op,
    awaitingNext: true, hasEntered: false, isError: false,
  };
}

export function reduceEquals(state) {
  if (state.isError) return state;
  const parsed = parseNumber(state.display);
  if ('error' in parsed) return errorState(parsed.error);
  if (state.previous === null || !state.operator) {
    return state.hasEntered ? state : errorState('geçersiz girdi');
  }
  const result = calculate(state.previous, state.operator, parsed.value);
  if ('error' in result) return errorState(result.error);
  return {
    display: formatResult(result.value), previous: null, operator: null,
    awaitingNext: true, hasEntered: true, isError: false,
  };
}

export function reduceClear() {
  return createInitialState();
}

// --- DOM adaptörü (yalnız tarayıcıda çalışır; Node test ortamında atlanır) ---
if (typeof document !== 'undefined') {
  const screenEl = document.getElementById('screen');
  let state = createInitialState();

  function render() {
    screenEl.textContent = state.display;
    screenEl.classList.toggle('error', state.isError);
  }

  document.querySelectorAll('[data-digit]').forEach((btn) => {
    btn.addEventListener('click', () => { state = reduceDigit(state, btn.dataset.digit); render(); });
  });
  document.querySelectorAll('[data-op]').forEach((btn) => {
    btn.addEventListener('click', () => { state = reduceOperator(state, btn.dataset.op); render(); });
  });
  document.getElementById('equals').addEventListener('click', () => { state = reduceEquals(state); render(); });
  document.getElementById('clear').addEventListener('click', () => { state = reduceClear(); render(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); state = reduceEquals(state); render(); }
    else if (e.key === 'Escape') { state = reduceClear(); render(); }
    else if (/^[0-9]$/.test(e.key)) { state = reduceDigit(state, e.key); render(); }
    else if (e.key === '.') { state = reduceDigit(state, '.'); render(); }
    else if (e.key === '+') { state = reduceOperator(state, '+'); render(); }
    else if (e.key === '-') { state = reduceOperator(state, '-'); render(); }
    else if (e.key === '*' || e.key.toLowerCase() === 'x') { state = reduceOperator(state, '×'); render(); }
    else if (e.key === '/') { e.preventDefault(); state = reduceOperator(state, '÷'); render(); }
  });

  render();
}
