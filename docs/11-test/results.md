# 11 — Test Sonuç Raporu: calculator

- Tarih: 2026-07-25 | Koşum: `npm test` (Node --test) + `npm run test:coverage`

## Sonuç
| Metrik | Değer |
|--------|-------|
| Geçti | 38 |
| Kaldı | **0** |
| Toplam | 38 |
| src/app.js satır coverage | %91,79 (önceki: %76,56 — DOM adaptörü artık test kapsamında) |

## Faz 10 (PR-1.md) yönlendirmesi — kapatıldı
- **F4** (DOM adaptörü sıfır test) → `tests/contract.test.js`: HTML↔JS sözleşme testi + 3 DOM smoke
  senaryosu (tıklama + klavye) eklendi.
- **NFR-3** (10 ardışık işlem) → sol-sağ zincirleme senaryo testi eklendi, çökmeden doğru sonuç.

## Kalan (bilinçli, Faz 15'e devredilen — DL-10-001'de zaten kayıtlı)
F6-F9 + N1-N4 (Minor/Nit): davranış değişikliği gerektirmiyor, teknik borç. Bu fazın kapsamı dışında.

## Kalite kapısı raporu
- "Kritik senaryolar %100" → ✅ (test-plan.md T1-T6 hepsi geçti)
- "npm test gerçek koşum" → ✅ 38/38 pass (mechanical kapı tarafından ayrıca doğrulanır)
