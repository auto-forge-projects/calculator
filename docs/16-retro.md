# 16 — Retrospektif: AutoForge pipeline'ı (calculator koşusu)

- Tarih: 2026-07-25 | Mod: AUTOPILOT | Girdi: `AUTOFORGE-FEEDBACK.md` (AF-090, AF-091, AF-092)
- Kapsam: FABRİKA değerlendirilir, ürün değil (calculator'ın kendi teknik borcu `docs/15-maintenance.md`'de).

## Ne iyi gitti
- **Blind review + Author≠Reviewer disiplini işe yaradı:** Faz 10 code-reviewer (opus) HANDOFF/DL okumadan yalnız kod+checklist ile F1-F9 bulgularını çıkardı; kullanıcı DL-10-001'i reddedip ("düzelt bunları!") gerçek bir geri besleme döngüsü açtı — sistem bunu doğru şekilde Faz 9 (F1/F2/F5) ve Faz 5 (F3) hedeflerine ayırdı.
- **TDD commit-kanıtı gerçekti:** her kod fazında önce `test(...)` (red) sonra `feat(...)`/`fix(...)` (green) commit sırası korundu (DL-09-001, DL-09-002) — kanıt tiyatrosu değil, git log'da doğrulanabilir.
- **Delta-rework disiplini:** geri besleme sonrası Faz 9/5 SIFIRDAN değil yalnız bulgunun gerektirdiği kadar (F1/F2/F5 → 4-5 satır; F3 → doküman yaması) yeniden işlendi — gereksiz iş/token israfı olmadı.
- **Ürün-tipi (`web`) veri-tabanlı kapı kontrolü** (`product-types.json`) Faz 6/14'te doğru şekilde uygulandı — CLI varsayımıyla yanlış beklenti (AF-017 sınıfı hata) tekrarlanmadı.

## En önemli öğrenim
Kapanış disiplininin (state güncelle → commit → push) HER adımı hâlâ prompt'a/oturum devamlılığına bağımlı; bir oturum tam da bu üç-adımlı zincirin ortasında kesilirse (commit atılmadan önce, ya da DL yazılıp state güncellenmeden sonra) doctor'un bugünkü kontrolleri bunu göremiyor — çünkü kontroller ya "git commit var mı" (staged'i saymaz) ya da "state alanı X ≥ Y" (state güncellenmediyse hesaplama yanlış "hâlâ açık" der ama en azından FAIL-SAFE yönde, sessiz yanlış-pozitif "kapalı" değil). Bu koşuda İKİ ayrı yerde aynı sınıf boşluk somut olarak yakalandı (bkz. AF-091, AF-092) — ikisi de "gerçek iş bitti ama state/kayıt bunu yansıtmadı" biçiminde.

## Kök-neden temaları (AF kayıtları → temalar)
| Tema | İlgili AF | Özet |
|------|-----------|------|
| Kapanış zincirinin son adımı prompt disiplinine bırakılıyor | AF-091 (bu koşu) | Faz "done" + gate geçti ama commit staged'de kaldı; doctor `UNPUSHED_WORK` bunu görmüyor (yalnız commit-ahead-of-origin'e bakıyor, staged-uncommitted'e değil) |
| Delta-iş sonrası state bookkeeping'i unutulabiliyor | AF-092 (bu koşu) | Faz 10→5 döngüsü fiilen kapatıldı (DL-05-002 + commit) ama `phases["5"].completed_at` bump edilmediği için döngü hesaplamada süresiz "açık" kalıyordu |
| Ajan kaydı/açık döngü sessizce panelde takılı kalabiliyor | AF-090 (önceki koşu, bu koşuda kanıtlandı) | Zombi `active_agents` kaydı + açık döngü hiçbir yüzeyde nedenini göstermiyordu; dört katmanlı kod-enforced çözüm zaten uygulanmıştı, bu koşu onun GERÇEK veriyle (calculator'ın kendi eski state'i) tetiklendiğini doğruladı |

## Somut süreç iyileştirmeleri (kalite kapısı: ≥1)
### Öneri 1 — Doctor'a `STAGED_UNCOMMITTED` bulgusu **[P1, önerildi — AF-091'de detaylandırıldı]**
`scripts/doctor.mjs`'e yeni kontrol: proje git reposuysa `git status --porcelain` boş değilken en az bir faz `done` ise (ya da basitçe: herhangi bir `done` faz sonrası çalışma ağacı kirliyse) bulgu üret; `fix`: birikmiş değişikliği faz kapanış mesajıyla commit+push et. Uygulama yeri: `scripts/doctor.mjs` (mevcut `UNPUSHED_WORK`/`GATE_MISMATCH` kontrollerinin yanına).

### Öneri 2 — `/pipeline-continue` kural 3'e delta-kapanış son-adım hatırlatması **[P2, önerildi — AF-092'de detaylandırıldı]**
`.claude/commands/pipeline-continue.md` (ve CLAUDE.md kural 3) metnine açıkça ekle: "delta iş bittiğinde hedef fazın `completed_at`'i YENİ zaman damgasıyla ve `decisions[]` güncellenerek yazılmalı — DL dosyasını commit'lemek yeterli değil, döngü kapanışı SADECE state alanı üzerinden hesaplanır." Uygulama yeri: `.claude/commands/pipeline-continue.md` kural 3 + `CLAUDE.md` madde 5.

**Seçilen:** Öneri 1 (P1) — doctor bugün "temiz" derken gerçekte birikmiş commit'siz iş barındırabiliyor; bu en yüksek sessiz-hata riski taşıyan boşluk.

## MASTER-PROMPT / CLAUDE.md / şablon değişiklik önerileri
1. `scripts/doctor.mjs` → `STAGED_UNCOMMITTED` bulgu türü ekle (git status + done-faz kesişimi).
2. `.claude/commands/pipeline-continue.md` kural 3 → delta-kapanışta `completed_at` bump zorunluluğunu açık cümleyle vurgula.
3. (Uygulanmadı, gelecek oturuma bırakıldı — bu faz kapsamı yalnız GÖZLEM/ÖNERİ üretmek; fabrika kodu değişikliği `/pipeline-improve` + insan onayı akışına aittir, kural: "öz-kod riski".)

## Kalite kapısı raporu
- "En az 1 somut süreç iyileştirmesi" → ✅ GEÇTİ (2 öneri, biri seçildi + gerekçelendirildi; AUTOFORGE-FEEDBACK.md'ye AF-091/AF-092 olarak zaten işlendi)
