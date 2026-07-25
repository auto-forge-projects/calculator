# 07 — Güvenlik Tasarımı: calculator

- Tarih: 2026-07-24 | Mod: AUTOPILOT | Profil: LITE

## Varlıklar ve veri sınıflandırma
Tamamen istemci-taraflı, durumsuz uygulama: backend, veritabanı, oturum, kalıcı depolama YOK.
| Veri | Sınıf | Nerede duruyor | Koruma |
|------|-------|----------------|--------|
| Girdi sayıları (aRaw, bRaw, op) | Public / geçici | Yalnız tarayıcı belleği (RAM), tıklama süresince | Kalıcılık yok; sayfa yenilenince kaybolur |
| Hesap sonucu / hata mesajı | Public / geçici | DOM (sonuç alanı) | Ağa iletilmez; sunucuya gönderilmez |
| Uygulama kodu (html/css/js) | Public | Statik dosya sunumu / repo | Salt-okunur servis; sır içermez |

Not: PII, kimlik bilgisi, sır, çerez, localStorage/IndexedDB, ağ çağrısı YOK → korunacak hassas varlık yok.

## Threat model (STRIDE)
| Bileşen | Spoofing | Tampering | Repudiation | Info Disclosure | DoS | Elevation | Önlemler |
|---------|----------|-----------|-------------|-----------------|-----|-----------|----------|
| index.html + DOM | N/A (kimlik yok) | İstemci kendi DOM'unu değiştirebilir → yalnız kendini etkiler | N/A (işlem/log yok) | N/A (hassas veri yok) | Sonsuz döngü riski yok (O(1) senkron) | N/A (backend/rol yok) | textContent ile render (innerHTML değil); allowlist operatör |
| parseNumber / calculate (saf fn) | N/A | Girdi yalnız sayıya çevrilir, kod olarak çalıştırılmaz | N/A | N/A | Aritmetik O(1) → DoS yok | N/A | eval/Function YASAK; `{error}` birliğiyle çökmez |
| Statik hosting | Sunucu MITM (TLS ile azaltılır) | Sızma → dosya değişimi | Sunucu erişim logu (hosting katmanı) | Sır yok | Hosting katmanı sorumluluğu | N/A | HTTPS servis (deploy katmanı); SRI gerektirmez (harici dep yok) |

## Auth / Authz stratejisi
UYGULANAMAZ — kullanıcı hesabı, oturum, korunan kaynak, çok-kullanıcılı veri YOK. Uygulama anonim ve durumsuzdur; kimlik doğrulama/yetkilendirme yüzeyi bulunmamaktadır. Herkes tüm işlevi kullanır; ayrıcalık ayrımı gerekmez.

## OWASP Top 10 değerlendirmesi (kalite kapısı: HER madde)
| # | Risk | Uygulanabilir mi | Önlem / Neden uygulanamaz |
|---|------|------------------|----------------------------|
| A01 | Broken Access Control | Hayır | Erişim kontrolü konsepti yok — backend/kaynak/rol/veri yok, tüm mantık public istemcide |
| A02 | Cryptographic Failures | Hayır | Şifrelenecek/iletilecek hassas veri yok; sır saklanmaz. Transport güvenliği (HTTPS) deploy katmanına devredilir |
| A03 | Injection | **Evet (birincil risk)** | Kod/komut/SQL injection: `eval()`/`Function()`/`new Function` MİMARİ DÜZEYDE YASAK (NFR-2/DL-05-001). Girdi yalnız `parseNumber()` ile Number'a çevrilir; operatör SABİT allowlist tablosundan seçilir (tablo dışı reddedilir). SQL/OS/LDAP hedefi yok |
| A04 | Insecure Design | Evet (ele alındı) | Güvenlik-tasarımla: saf fonksiyon izolasyonu, allowlist operatör, hata `{error}` birliği (istisna sızıntısı yok), eval-yok kuralı. Minimal saldırı yüzeyi bilinçli tasarım |
| A05 | Security Misconfiguration | Kısmen (deploy) | Uygulama config'siz. Deploy katmanında güvenlik başlıkları önerilir (CSP, X-Content-Type-Options). Dizin listeleme kapalı olmalı → SEC-4/SEC-5 |
| A06 | Vulnerable & Outdated Components | Hayır (güçlü) | SIFIR runtime bağımlılık (vanilla HTML/CSS/JS). Test için yalnız Node yerleşik `--test` runner (dev-only, prod'a girmez). Tedarik zinciri yüzeyi ~sıfır |
| A07 | Identification & Auth Failures | Hayır | Kimlik/oturum/parola yok (bkz. Auth/Authz) |
| A08 | Software & Data Integrity Failures | Kısmen | Harici script/CDN/dep yok → SRI gereksiz. Deploy bütünlüğü: sürüm kontrollü repo + statik dosya doğrulaması. Insecure deserialization yok (JSON/pickle yok) |
| A09 | Security Logging & Monitoring Failures | Hayır | Kimlik/işlem/güvenlik olayı yok → loglanacak güvenlik olayı yok. İstemci hataları console'da kalır, hassas veri sızmaz |
| A10 | Server-Side Request Forgery (SSRF) | Hayır | Sunucu-taraf istek yok; uygulama hiçbir ağ çağrısı (fetch/XHR) yapmaz. SSRF yüzeyi yok |

## AI tedarik zinciri & fabrika tehditleri (Öneri 7)
| Tehdit | Uygulanabilir? | Önlem / Neden uygulanamaz |
|--------|----------------|----------------------------|
| Prompt injection | Hayır | Girdi bir modele beslenmez; yalnız sayısal ayrıştırılır |
| Repository/artefakt prompt poisoning | Düşük | Repo AutoForge fabrika ajanlarınca üretilir; harici içerik enjekte edilmez |
| Dependency confusion | Hayır | İç/özel paket yok; sıfır bağımlılık |
| Malicious package scripts (postinstall) | Hayır | `npm install` gerektiren bağımlılık yok |
| Shell komut güvenliği | Hayır | Uygulama kabuk komutu çalıştırmaz |
| Workspace sınırı / path & symlink escape | Hayır | Dosya sistemi erişimi yok (saf istemci) |
| Secret leakage | Hayır | Kod/commit sır içermez; sır kavramı yok |
| Docker build izolasyonu | Kısmen | Faz 12'de statik dosya imajı; minimal base + non-root önerilir |
| Üretilen CI güvenliği | Kısmen | Faz 12 workflow'u en az yetkiyle (`permissions: read`) olmalı → SEC-6 |
| MCP/tool izinleri | Hayır | Ürün çalışma zamanı tool yüzeyi taşımaz |

## Faz 9'a güvenlik gereksinimleri (developer implementasyon listesi)
- [ ] SEC-1: `app.js` içinde `eval`, `Function`, `new Function`, `setTimeout(string)`, `setInterval(string)` KESİNLİKLE bulunmayacak. Girdi yalnız `parseNumber()` (Number/parseFloat + isFinite kontrolü) ile sayıya çevrilecek.
- [ ] SEC-2: Operatör seçimi SABİT allowlist tablosundan (`{'+':..,'-':..,'×':..,'÷':..}`); tabloda olmayan op için `{error}` döndürülecek (dinamik property lookup güvenli tutulacak — prototype kirliliği yok).
- [ ] SEC-3: DOM güncellemesi YALNIZ `textContent` ile yapılacak; `innerHTML`/`insertAdjacentHTML`/`document.write` KULLANILMAYACAK (kullanıcı girdisi/hata mesajı HTML olarak yorumlanmasın → XSS ihtimali kapanır).
- [ ] SEC-4: `index.html`'e CSP meta etiketi eklenecek: `default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'` (inline script/eval'i tarayıcı düzeyinde de bloklar; savunma derinliği).
- [ ] SEC-5: Inline `<script>`/`<style>` yerine harici `app.js`/`style.css` dosyaları kullanılacak (CSP `'unsafe-inline'` gerektirmesin).
- [ ] SEC-6: (Faz 12) CI workflow'u `permissions: contents: read` ile en-az-yetkide olacak; deploy imajı non-root, minimal statik-serve base.
- [ ] SEC-7: Hata mesajları sabit/whitelist metinler olacak ("Hata: geçersiz girdi", "Hata: sıfıra bölünemez"); ham girdi hata metnine gömülüp DOM'a basılmayacak (savunma derinliği).

## Kalite kapısı raporu
- "OWASP Top 10 değerlendirildi" → ✅ GEÇTİ (A01–A10 hepsi gerekçeli değerlendirildi; A03 Injection ve A04 Insecure Design birincil odak, kalanlar N/A gerekçeleriyle)
- "Hassas veri sınıflandırması eksiksiz" → ✅ GEÇTİ (tüm veri Public/geçici; hassas/PII/sır varlığı YOK olarak sınıflandırıldı)
- "AI/tedarik zinciri tehditleri değerlendirildi" → ✅ GEÇTİ (10 tehdit; çoğu N/A, CI/Docker Faz 12'ye devredildi)
- Faz 9'a devredilen: SEC-1..SEC-7 (kritik: SEC-1 eval-yok, SEC-3 textContent, SEC-4 CSP)
