# 15 — Bakım: calculator

- Tarih: 2026-07-25 | Mod: AUTOPILOT
- Bu dosya ÜRÜNÜN teknik borcunu izler; fabrikanın eksikleri `AUTOFORGE-FEEDBACK.md`'ye.

## Bilinen sorunlar
- Yok (Blocker/Critical = 0; F1/F2/F5 Faz 9'da, F3 Faz 5'te, F4 Faz 11'de düzeltildi/kapatıldı — bkz. DL-09-002, DL-05-002, DL-11-001).

## Teknik borç (kalite kapısı: önceliklendirilmiş)
| # | Borç | Kaynak (DL/review bulgusu) | Öncelik (P1/P2/P3) | Not |
|---|------|---------------------------|--------------------|-----|
| TD-1 | DOM adaptöründe null-güvenliği yok (`getElementById` sonucu kontrolsüz) — eksik/yanlış id sayfayı tümüyle kırar | PR-1.md F7 | P1 | `if (!screenEl \|\| !equalsEl \|\| !clearEl) return;` erken çıkış eklenmeli — düşük efor, yüksek dayanıklılık kazancı |
| TD-2 | `parseNumber` `Number()` semantiği ile hex/exponential (`'0x1f'`, `'1e5'`) gibi tuş takımından erişilemeyen formatları kabul ediyor — FR-5 dilbilgisiyle çelişki | PR-1.md F6 | P2 | Ön dilbilgisi kontrolü (`/^-?\d*\.?\d+$/`) veya docs/03'te sayı dilbilgisini netleştir |
| TD-3 | `reduceDigit` argümanını doğrulamıyor (dışa açık API'ye keyfi string verilirse display'e eklenir) | PR-1.md F8 | P2 | `if (!/^[0-9.]$/.test(d)) return state;` — güvenlik etkisi yok (XSS kapalı) ama API sözleşmesi sıkılaştırılmalı |
| TD-4 | Boş makinede `=` → hata mesajı; klasik hesap makinesi davranışı (no-op) beklenir; FR-5 UI eşlemesi yalnız bu yoldan zorlanıyor | PR-1.md F9 | P3 | Faz 3'e küçük geri besleme: FR-5'i tuş-takımı gerçeğine göre yeniden ifade et ya da `=`'i no-op yap |
| TD-5 | `'use strict'` gereksiz (ES modül); CSP ek sertleştirme (`form-action 'none'`, `img-src 'none'`); operatör butonlarında `aria-label` yok; Backspace/±/% klavye desteği yok | PR-1.md N1-N4 | P3 | Kozmetik/erişilebilirlik iyileştirmeleri, davranış değişikliği gerektirmiyor |

## Bağımlılık güncelleme planı
- Sıfır çalışma-zamanı bağımlılık (DL-04-001/DL-05-001) — güncellenecek paket yok.
- Runtime: Node.js sürümü (`node --test`, geliştirme/CI'da) — CI workflow'undaki Node sürümü LTS güncellemelerinde elle bump edilir (Dependabot gereksiz, tek satırlık workflow ayarı).

## Bakım ritmi
- Sürüm başı: PR-1.md'deki açık P1 bulgusunu (TD-1) bir sonraki minor sürümde (v0.2.0) kapat.
- P2/P3 borçları birikimli backlog'da tutulur, kullanıcı talebi veya ↺ Yeni İhtiyaç fazında önceliklendirilir.

## Kalite kapısı raporu
- "Teknik borç önceliklendirilmiş" → ✅ (5 borç, hepsi PR-1.md bulgusuna izlenebilir, P1/P2/P3 önceliklendirildi)
