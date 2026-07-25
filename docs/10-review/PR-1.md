# 10 — Code Review: PR-1 (calculator)

- Tarih: 2026-07-25 | Mod: AUTOPILOT | Profil: LITE | İnceleyen: `code-reviewer` subagent (opus) — **BLIND review; Faz 9'u yazan orchestrator/developer DEĞİL (Author ≠ Reviewer)**
- İncelenen: Faz 9 diff'i — `407b346` (test: `tests/app.test.js`, `package.json`) + `0dc17cc` (feat: `src/app.js`, `src/index.html`, `src/style.css`, test genişletme) · toplam ~336 satır ürün+test kodu
- Referans: `docs/03-requirements.md`, `docs/05-architecture.md`, `docs/07-security.md`
- Bağımsız denetim notu: yazarın DL-09-001 gerekçesi ve HANDOFF özeti **okunmadı** (anchoring/bug-gizleme riski); bulgular yalnız kod + sabit checklist + kendi koşumumdan çıktı.

## Yöntem
1. **Elle kod okuması:** `src/app.js` (saf katman `parseNumber`/`calculate`/`formatResult`; reducer durum makinesi `createInitialState`/`reduceDigit`/`reduceOperator`/`reduceEquals`/`reduceClear`; satır 98-128 DOM adaptörü + klavye haritası), `src/index.html` (CSP meta, tuş sözleşmesi `data-digit`/`data-op`/`#screen`/`#equals`/`#clear`), `src/style.css` (grid + `@media`), `tests/app.test.js`.
2. **Bağımsız test koşumu (yazarın beyanına güvenilmedi):** `npm test` → **27 test / 27 pass / 0 fail** (Node v22.23.1, 124 ms). `npm run test:coverage` → `src/app.js` satır **%76,56** · branch %85,71 · fn %68,42, **kapsanmayan satırlar 99-128** (tüm DOM adaptörü).
3. **Statik güvenlik taraması:** `grep -rnE "eval\(|new Function|Function\(|innerHTML|insertAdjacentHTML|document\.write|setTimeout\(['\"]|setInterval\(['\"]"` → tek eşleşme `src/app.js:4` (yorum satırı). Inline `<script>`/`<style>`/`style=` → eşleşme yok.
4. **Kenar-durum sürüşü:** saf fn ve reducer'lar doğrudan koşturularak taşma/çok küçük sayı/zincirleme/hata-kurtarma yolları ölçüldü (aşağıdaki bulguların kanıtı bu koşumdan).
5. **HTML ↔ JS sözleşmesi elle çapraz kontrol:** app.js'in aradığı 3 id ve 11 `data-digit` + 4 `data-op` değeri index.html'de mevcut; her `data-op` değeri `OPERATORS` allowlist'inde (bugün tutarlı — bkz. F4 regresyon riski).

## Bulgular
| # | Severity | Dosya:Satır | Bulgu | Aksiyon |
|---|----------|-------------|-------|---------|
| F1 | Major | `src/app.js:32` | `Math.round(value * 1e10)` taşıyor: `|value| > ~1.79e298` olan **finite** sonuçlar ekrana `"Infinity"` yazılır. Kanıt: `formatResult(1e299) === "Infinity"`. UI'dan erişilebilir (300 haneli sayı + `[+][0][=]` → ekran `Infinity`; 300 haneli sayı `[×][9][=]` de aynı). | Taşma-güvenli biçimlendirme: `const s = value*1e10; const r = Number.isFinite(s) ? Math.round(s)/1e10 : value;` veya `Number(value.toPrecision(12))`. |
| F2 | Major | `src/app.js:85-90`, `66-70` | `reduceEquals`/`reduceOperator` sonucu `Number.isFinite` ile doğrulamıyor. `calculate(1e308,'×',10)` → `{value: Infinity}` → `formatResult` `"Hata: geçersiz girdi"` döndürür ama state `isError:false` kalır → `.error` stili uygulanmaz; "display hata metni ⟺ `isError:true`" değişmezi kırılır (ekran hata gösterir, uygulama hatasız sanır). | Reducer'da sonuç doğrula: `if (!Number.isFinite(result.value)) return errorState('geçersiz girdi');` (hem equals hem operator dalında). |
| F3 | Major | `docs/05-architecture.md:13,61` ↔ `src/index.html`, `src/app.js:38-95` | **Doküman-kod drift:** docs/05 "iki sayı girişi" ekranı ve veri modeli `{aRaw, bRaw, op}` öngörüyor; implementasyon tek-ekranlı tuş takımı + **reducer durum makinesi** (docs/05'te bileşen görünümünde ve veri modelinde YOK). Downstream fazlar (11 Test, 12, 14) docs/05'i sözleşme olarak okur → yanlış varsayımla ilerleme riski. Kod FR'leri karşılıyor ve saf-fn + allowlist mimari ilkesine uyuyor; sorun **artefaktın bayat** olması. | Hafif Faz 5 doküman yaması: veri modeli (`{display, previous, operator, awaitingNext, hasEntered, isError}`) + bileşen görünümüne reducer katmanı + dosya tablosuna `tests/app.test.js`. Kod değişikliği gerekmez. |
| F4 | Major | `tests/app.test.js` (kapsam), `src/app.js:99-128` | DOM adaptörü **hiç test edilmiyor** (kapsanmayan 99-128: olay bağlama, `render()`, klavye haritası). HTML↔JS sözleşmesi yalnız elle doğrulandı: bir `data-digit`/`data-op` typo'su veya id değişimi **27 test yeşilken** uygulamayı tümüyle bozar; `'x'→'×'` klavye eşlemesi de kanıtsız. | Faz 11: (a) `index.html` sözleşme testi (3 id + her `data-op` ∈ allowlist + 11 rakam tuşu), (b) minimal DOM stub ile `render`/`keydown` smoke testi, (c) 10 ardışık işlem NFR-3 senaryosu. |
| F5 | Minor | `src/app.js:32` | Sabit 10-ondalık yuvarlama sıfır-olmayan küçük sonuçları `"0"` gösterir: `formatResult(1e-11) === "0"`; UI: `1 ÷ 100000000000 =` → `0`. Yanlış çıktı (float gürültüsü kırpma niyetinin yan etkisi). | Exponent-farkındalı biçim (`Number(value.toPrecision(12))`) veya `|v| < 1e-10` için bilimsel gösterim. |
| F6 | Minor | `src/app.js:11` | `Number()` semantiği beklenmeyen girdileri kabul eder: `parseNumber('0x1f')→31`, `'1e5'→100000`, `[5]→5`. Mevcut tuş takımından erişilemez ve SEC-1 metnine uygundur; ancak FR-5'in "sayısal olmayan girdi" beklentisiyle çelişir ve ileride metin girişi eklenirse sürpriz olur. | Ön dilbilgisi kontrolü `/^-?\d*\.?\d+$/` veya docs/03'te kabul edilen sayı dilbilgisini netleştir. |
| F7 | Minor | `src/app.js:99,113-114` | DOM adaptöründe null-güvenliği yok: `getElementById('screen'\|'equals'\|'clear')` null dönerse `render()`/`addEventListener` TypeError atar ve sayfa tümüyle ölür (NFR-3 "çökmez" ruhu; F4 ile birleşince sessiz kırılma). | `if (!screenEl \|\| !equalsEl \|\| !clearEl) return;` erken çıkış (veya konsola tek uyarı). |
| F8 | Minor | `src/app.js:46-57` | `reduceDigit` argümanını doğrulamıyor: dışa açık API'ye herhangi bir string verilirse display'e eklenir (`reduceDigit(s,'abc')` → `"abc"`). **Güvenlik etkisi yok** (render `textContent`, XSS kapalı; parse hataya düşer), ama SEC-7'nin "display yalnız sabit/allowlist içerik" ruhuna aykırı. | `if (!/^[0-9.]$/.test(d)) return state;` |
| F9 | Minor | `src/app.js:82-83`, `tests/app.test.js:115` | Boş makinede `=` → `"Hata: geçersiz girdi"`. Klasik hesap makinesi davranışı no-op'tur; ayrıca tuş takımı UI'da FR-5'e **yalnız bu yolla** erişilebiliyor → FR-5 ↔ UI eşlemesi zorlama. | Faz 3 küçük geri besleme: FR-5'i tuş-takımı gerçeğine göre yeniden ifade et (klavye ile geçersiz karakter / boş `=` politikası) ya da `=`'i no-op yap. |
| N1 | Nit | `src/app.js:1`, `tests/app.test.js:1` | ES modülde `'use strict'` gereksiz (modüller zaten strict). | Kaldır. |
| N2 | Nit | `src/index.html:6-7` | CSP SEC-4 metnini **birebir** karşılıyor; ek sertleştirme mümkün: `form-action 'none'`, `img-src 'none'`, `require-trusted-types-for 'script'`. | Opsiyonel savunma derinliği. |
| N3 | Nit | `src/index.html:16-31` | Operatör butonlarında `aria-label` yok (`÷ × −` simgeleri ekran okuyucularda tutarsız okunabilir). Görünen `−` (U+2212) ile `data-op="-"` ayrımı bilinçli ve **doğru** kurulmuş. | `aria-label="böl/çarp/çıkar"` ekle. |
| N4 | Nit | `src/app.js:116-125` | Klavye haritasında Backspace / ± / % yok (FR'lerde istenmiyor — bilgi amaçlı). | Kapsam dışı; gerekirse Faz ↺. |

**Blocker: 0 · Critical: 0 · Major: 4 · Minor: 5 · Nit: 4**

## İzlenebilirlik (FR ↔ kod)
| FR | Karşılayan modül | Durum |
|----|------------------|-------|
| FR-1 Toplama | `OPERATORS['+']` app.js:17 + `calculate` app.js:23 + `reduceOperator/reduceEquals`; `index.html:31` `data-op="+"`; test:42, UI test:100 | ✅ |
| FR-2 Çıkarma | `OPERATORS['-']` app.js:18; `index.html:26` (görünen `−`, `data-op="-"`); test:46 | ✅ |
| FR-3 Çarpma | `OPERATORS['×']` app.js:19; `index.html:21`; klavye `*`/`x` app.js:123; test:50 | ✅ |
| FR-4 Bölme + sıfıra bölme | `OPERATORS['÷']` app.js:20; guard app.js:26; test:54,58 + UI test:106 (`5÷0=` → "Hata: sıfıra bölünemez", C ile temizlenir); `0÷0` da aynı hatayı verir (doğrulandı) | ✅ |
| FR-5 Geçersiz girdi | `parseNumber` app.js:7-14, `errorState` app.js:42, `reduceEquals` app.js:83; test:23-38, UI test:115 | ⚠️ Kısmi — mantık tam, ancak UI'dan yalnız "boş makinede `=`" yoluyla erişilebilir (F9); F1/F2 taşma yolu bu hata sınıfına düşmüyor |
| FR-6 Temizle | `reduceClear` app.js:93; `#clear` index.html:15; klavye `Escape` app.js:118; test:110 | ✅ |
| NFR-1 <1sn / <100ms | Sıfır bağımlılık, tek statik sayfa, bundler yok; reducer'lar senkron O(1) | ✅ tasarımca (sayısal ölçüm Faz 11'e) |
| NFR-2 eval/Function yasağı | Grep kanıtı: yalnız yorumda geçiyor; girdi `Number()`+`isFinite`, operatör allowlist | ✅ |
| NFR-3 Çökmez | Hata `{error}` birliğiyle taşınır, istisna atılmaz; 27 test yeşil | ⚠️ Kısmi — F2 (Infinity → tutarsız state) ve F7 (eksik DOM null-guard) kenar durumları açık |
| NFR-4 Responsive | `style.css` grid + `@media (max-width:400px)`, `max-width:360px`, `word-break:break-all` (300 haneli girdi taşmıyor) | ✅ kod incelemesiyle (görsel doğrulama Faz 11) |

Eksik/karşılıksız FR yok — FR-1..FR-6 hepsi kodda karşılığını buldu; ters yönde de **gereksinimsiz kod yok** (formatResult ve reducer katmanı FR-1..FR-6'nın UI karşılığı; yalnız docs/05'te belgelenmemiş → F3).

## Güvenlik (SEC-*) uygulama kontrolü
- **SEC-1** eval/Function yasağı: ✅ (`grep -rnE "eval\(|new Function|Function\(|setTimeout\(['\"]|setInterval\(['\"]"` → tek eşleşme `app.js:4` yorumu; girdi yalnız `Number()` + `Number.isFinite`)
- **SEC-2** Operatör allowlist: ✅ (sabit `OPERATORS` app.js:16-21 + `Object.prototype.hasOwnProperty.call` app.js:24 + `typeof fn !== 'function'` ikinci savunma; `tests:62-65` `'%'` ve `'__proto__'` reddini doğruluyor → prototype kirliliği kapalı)
- **SEC-3** Yalnız `textContent`: ✅ (`app.js:103` `screenEl.textContent` + `classList.toggle`; `innerHTML`/`insertAdjacentHTML`/`document.write` repoda YOK → hata metni/girdi HTML olarak yorumlanmıyor)
- **SEC-4** CSP meta: ✅ (`index.html:6-7`, docs/07'deki dize ile birebir: `default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'`) — ek sertleştirme N2
- **SEC-5** Inline script/style yok: ✅ (harici `app.js` `type="module"` + `style.css`; `style=` attribute'u da yok → `'unsafe-inline'` gerekmiyor)
- **SEC-6** CI en-az-yetki / non-root imaj: ⏳ **Faz 12 kapsamı.** Bilgi: iskelet `ci.yml` ve `teardown.yml` `permissions: contents: read`; `deploy-image.yml` `contents: read + packages: write` (imaj push için gereken minimum). Dockerfile henüz yok → Faz 12'de non-root + minimal statik base doğrulanmalı.
- **SEC-7** Sabit hata metinleri: ✅ (`errorState` app.js:42 yalnız iç sabitleri (`'geçersiz girdi'`, `'sıfıra bölünemez'`) interpolate eder; ham kullanıcı girdisi hata metnine gömülmez)

Ek güvenlik gözlemi: ağ çağrısı (`fetch`/XHR), `localStorage`/`IndexedDB`/çerez, harici CDN/script ve sır YOK → docs/07'nin varlık envanteri ve A06 "sıfır bağımlılık" iddiası kod tarafında **doğrulandı**.

## Test kalitesi değerlendirmesi
- **TDD kanıtı gerçek:** `407b346` `test(...)` commit'i (implementasyondan ÖNCE, red) → `0dc17cc` `feat(...)` (green). Kanıt tiyatrosu değil, commit sırası doğrulandı.
- **Güçlü senaryolar:** parser sınırları (boş, yalnız-boşluk, `abc`, `null`, `undefined`, negatif, ondalık); 4 işlem; sıfıra bölme; **allowlist ihlali + `__proto__`** (güvenlik testi, sadece happy-path değil); float gürültüsü (`0.1+0.2`); zincirleme (`2+3+4`); durum makinesi kenar durumları (baştaki sıfır `05` olmuyor, çift ondalık, hatadan sonra rakamla kurtarma, rakam girmeden operatör değiştirme, operatörsüz `=`). Assertion'lar `deepEqual`/`equal` ile davranışa bağlı, tautolojik değil.
- **Boşluklar (hepsi Faz 11'e somut giriş):** (a) **DOM/klavye katmanı sıfır test** (F4) — asıl risk; (b) **sayısal sınır testi yok** — F1/F5 tam bu boşluktan kaçtı (çok büyük/çok küçük sonuç); (c) negatif sonuç UI akışı (`0-4`, `−` ile negatife düşme) test edilmemiş; (d) docs/03 NFR-3 ölçütü olan "10 ardışık işlem" senaryosu yok; (e) `=` tekrar basma davranışı (son işlemi tekrarlamama) kayıt altında değil.
- Kapsam sayısı (%76,56) Faz 9 kapısını (≥%70) geçiyor, ama **kapsanmayan blok tam olarak kullanıcının dokunduğu katman** — sayı yeterli, dağılım değil.

## Karar
**Kapı GEÇTİ** — Blocker 0, Critical 0. Güvenlik gereksinimlerinin Faz 9 kapsamındaki 6 maddesi (SEC-1..SEC-5, SEC-7) kanıtla uygulanmış; SEC-6 tasarımca Faz 12'de. FR-1..FR-6 eksiksiz karşılanmış, 27 test bağımsız koşumda yeşil.

LITE profil review döngüsü eşiği `critical` (`reviewLoop: {threshold:"critical", max_cycles:1}`) olduğundan Major bulgular düzeltme **dayatmaz**; yine de yönlendirme:
1. **F1 + F2 → Faz 9 (ÖNERİLEN, tek küçük yama):** ikisi de `formatResult`/reducer sonuç doğrulamasının aynı 4-5 satırı; ölçülebilir yanlış çıktı üretiyorlar (`"Infinity"`, hata metni + `isError:false`). Ucuz ve testle kilitlenebilir → düzeltilirse F5 de aynı yamada kapanır.
2. **F3 → Faz 5 (doküman yaması):** docs/05 veri modeli/bileşen görünümü güncellenmeli; downstream (11/12/14) bayat sözleşme okumasın.
3. **F4 → Faz 11 (test kapsamı):** DOM sözleşme + smoke testleri, sayısal sınır testleri, NFR-3 10-işlem senaryosu.
4. **F5-F9 + N1-N4 → Faz 15 (teknik borç):** düzeltilmezse `docs/15-maintenance.md`'ye önceliklendirilmiş girdi (F5 > F7 > F6 > F8 > F9 > Nit'ler).
Ertelenen düzeltmeler ve kabul edilen riskler: **DL-10-001** (İnsan onayı: Beklemede).

## Kalite kapısı raporu
- "Blocker/Critical bulgu = 0" → ✅ GEÇTİ (Blocker: 0, Critical: 0)
- "Bağımsız (blind) review yapıldı; Author ≠ Reviewer" → ✅ (Faz 9'u yazan orchestrator değil `code-reviewer` subagent; DL-09-001/HANDOFF okunmadı)
- "Testler reviewer tarafından bağımsız koşuldu" → ✅ (27/27 pass, kapsam %76,56 — yazar beyanı değil kendi koşumum)
- "Güvenlik gereksinimleri (docs/07 SEC-*) uygulama kontrolü yapıldı" → ✅ (SEC-1..SEC-5, SEC-7 ✅; SEC-6 Faz 12'ye açık kayıtla devredildi)
- "Gereksinim ↔ kod izlenebilirliği kuruldu" → ✅ (FR-1..FR-6 + NFR-1..NFR-4 tablosu; karşılıksız FR yok)
