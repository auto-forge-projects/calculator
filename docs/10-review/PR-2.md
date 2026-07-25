# 10 — Code Review: PR-2 (calculator — REQ-001 delta)

- Tarih: 2026-07-25 | Mod: AUTOPILOT | Profil: LITE | İnceleyen: `code-reviewer` subagent (opus) — **BLIND; Faz 9 yazarı DEĞİL (Author ≠ Reviewer)**
- İncelenen: `12a370f` (test-only, red) + `06f6b0c` (fix: `src/index.html`, `src/style.css`, `decisions/DL-09-003.md`) — 1 satır HTML + 1 satır CSS + 10 satır test
- Referans: `docs/03-requirements.md`, `docs/05-architecture.md`, `docs/07-security.md` · Yazarın DL/HANDOFF gerekçe anlatısı **okunmadı**

## Yöntem
1. Diff elle okundu; `src/index.html` + `src/style.css` güncel hâli grid semantiği açısından doğrulandı (`.keys` = `repeat(4,1fr)`; satır-1 span toplamı 3+1=4 → `÷` 4. sütuna düşüyor; son satır 1+1+2=4 → bozulma yok; `.key-span2` hâlâ `#equals` tarafından kullanılıyor, ölü CSS değil).
2. **Bağımsız test koşumu (beyana güvenilmedi):** HEAD'de `npm test` → **39/39 pass, 0 fail** (Node, 174 ms).
3. **Red→green kanıtı bağımsız üretildi:** `12a370f` bir git worktree'ye alınıp koşuldu → **38 pass / 1 fail** (yeni test gerçekten kırmızıydı); iki ayrı commit (test → fix) sırası AF-093 ile uyumlu.
4. Statik güvenlik kontrolü: diff'te inline `style=`/`<style>`/`<script>` eklenmedi, CSP meta ve harici `style.css` bağı değişmedi; JS'e dokunulmadı (`git show --stat` doğrulandı).

## Bulgular
| # | Severity | Dosya:Satır | Bulgu | Aksiyon |
|---|----------|-------------|-------|---------|
| F1 | Major | `tests/contract.test.js:42-47` | Test yalnız HTML class adını (`key-span3`) doğruluyor; **`src/style.css` hiç okunmuyor.** `.key-span3 { grid-column: span 3; }` kuralı silinse/yazılmasa buton 1 sütuna düşer, `÷` 2. sütuna kayar — yani REQ-001 regresyonu **aynen geri gelir ama test YEŞİL kalır** (zayıf oracle). Test başlığı "÷ diğer operatörlerle aynı sütunda hizalanır" iddia ediyor, ama `÷`/sütun sayısı/span toplamı hakkında tek assertion yok. | Testi CSS'e bağla: `style.css`'ten `grid-template-columns: repeat(N,…)` sütun sayısını ve `.key-span3`→`span 3` eşlemesini oku; satır-1 span toplamının sütun sayısına eşitliğini assert et (`3 + 1 === 4`). |
| F2 | Minor | `tests/contract.test.js:43` | Regex `/<button[^>]*id="clear"[^>]*class="([^"]*)"/` **attribute sırasına bağlı**: `class` `id`'den önce yazılırsa test "clear butonu bulunamadı" ile düşer — davranış bozulmadığı hâlde yanıltıcı hata (kırılgan test). | Önce `<button ...>` etiketini yakala, sonra `id`/`class`'ı ayrı ayrı çıkar (sıra bağımsız). |
| N1 | Nit | `tests/contract.test.js:45-46` | `includes('key-span3')` token değil **substring** eşlemesi (`key-span30` da geçer); negatif `!includes('key-span2')` kontrolü pratikte `key-span3` varken zaten sağlanır. | `class.split(/\s+/)` ile token bazlı kontrol. |
| N2 | Nit | `docs/05-architecture.md` (NFR-4 satırı) ↔ `src/style.css:54-58` | Mimari doküman layout'u "flexbox + @media" diye tarif ediyor; gerçek uygulama **CSS Grid**. Bu delta'nın kökü tam da grid semantiği (span) olduğu için drift artık anlamlı. Delta'nın ürettiği bir hata değil, **önceden var olan** doküman bayatlığı. | Faz 5 doküman yaması (kod değişikliği gerekmez) veya Faz 15 borcu. |

**Blocker: 0 · Critical: 0 · Major: 1 · Minor: 1 · Nit: 2**

## İzlenebilirlik (FR ↔ kod)
| FR / talep | Karşılayan modül | Durum |
|----|------------------|-------|
| REQ-001 (operatörler rakamların sağında, `÷` diğer operatörlerle aynı sütunda) | `src/index.html:15` (`key-span3`) + `src/style.css:89` | ✅ Karşılandı — 4 sütunluk grid'de satır-1 = 3+1, `÷` 4. sütunda `×`/`−`/`+` ile hizalı |
| FR-6 (Temizle) | `#clear` id'si ve `app.js:120` bağlaması değişmedi; yalnız class değişti | ✅ Regresyon yok (39/39 test, DOM smoke `clear.click()` dahil yeşil) |
| NFR-4 (responsive) | `.keys` `repeat(4,1fr)` + `@media(max-width:400px)` | ✅ Sabit px/taşma eklenmedi; span oransal (`1fr`) kaldı |
| FR-1..FR-5, NFR-1..NFR-3 | Bu delta'da dokunulmadı (JS diff'i yok) | Kapsam dışı (PR-1) |

## Güvenlik (SEC-*) uygulama kontrolü
- SEC-3: ✅ (DOM/JS'e dokunulmadı; `innerHTML` yok)
- SEC-4: ✅ (CSP meta `style-src 'self'` değişmedi)
- SEC-5: ✅ (stil harici `style.css`'te kaldı; inline `style=`/`<style>` **eklenmedi** → `'unsafe-inline'` gerekmiyor)
- SEC-1/2/7: N/A (bu delta JS içermiyor)

## Test kalitesi değerlendirmesi
Doğru olan: değişiklik **testle ÖNCE kırmızıya alındı** (bağımsız doğrulandı: 12a370f'te 1 fail), test-only ve fix commit'leri ayrı, mevcut 38 testin hiçbiri bozulmadı. Zayıf olan: yeni test **sözleşmenin yalnız yarısını** (HTML class) tutuyor; hizalamayı fiilen belirleyen CSS kuralı ve grid sütun aritmetiği test dışı (F1). Yani test "bu class yazılı mı"yı doğruluyor, "hizalama doğru mu"yu değil — isimlendirmesi kapsamından geniş. Statik dosya okumasıyla (headless tarayıcı gerekmeden) F1'deki güçlendirme 5-6 satırda yapılabilir; LITE'ta maliyeti düşük, değeri yüksek.

## Karar
**Kapı GEÇTİ** — Blocker 0 / Critical 0. LITE eşiği (`threshold: critical`) gereği Major/Minor/Nit düzeltme dayatmaz; **F1 küçük bir Faz 9 test yaması olarak ÖNERİLİR** (aynı regresyonun sessizce geri gelmesini engelleyen tek koruma), F2+N1 aynı yamaya katlanabilir, N2 Faz 5/15 doküman borcu. Erteleme riskleri `decisions/DL-10-002.md`'de kayıt altına alındı.

## Kalite kapısı raporu
- "Blocker/Critical bulgu = 0" → ✅ (Blocker: 0, Critical: 0)
- "Bağımsız test koşumu yeşil" → ✅ (39/39, reviewer tarafından koşuldu)
- "Red→green kanıtı" → ✅ (test commit'inde 1 fail, fix commit'inde 0 fail — worktree ile doğrulandı)
