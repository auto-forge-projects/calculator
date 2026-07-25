# 11 — Test Sonuç Raporu: calculator

- Tarih: 2026-07-25 | Koşum: `npm test` (Node --test) + `npm run test:coverage`

## Sonuç
| Metrik | Değer |
|--------|-------|
| Geçti | 39 |
| Kaldı | **0** |
| Toplam | 39 |
| src/app.js satır coverage | %91,79 (önceki: %76,56 — DOM adaptörü artık test kapsamında) |

## ↺ REQ-001 delta (cycle 2) — revalidasyon
- T7 eklendi (`tests/contract.test.js`): `#clear` `key-span3` + grid hizası regresyonu. `npm test` bağımsız 39/39 yeşil (bkz. `docs/10-review/PR-2.md`).

## Faz 10 (PR-1.md) yönlendirmesi — kapatıldı
- **F4** (DOM adaptörü sıfır test) → `tests/contract.test.js`: HTML↔JS sözleşme testi + 3 DOM smoke
  senaryosu (tıklama + klavye) eklendi.
- **NFR-3** (10 ardışık işlem) → sol-sağ zincirleme senaryo testi eklendi, çökmeden doğru sonuç.

## Kalan (bilinçli, Faz 15'e devredilen — DL-10-001'de zaten kayıtlı)
F6-F9 + N1-N4 (Minor/Nit): davranış değişikliği gerektirmiyor, teknik borç. PR-2.md F1 (REQ-001 testinin CSS'i doğrulamaması) de aynı listeye eklendi.

## Kalite kapısı raporu
- "Kritik senaryolar %100" → ✅ (test-plan.md T1-T7 hepsi geçti)
- "npm test gerçek koşum" → ✅ 39/39 pass (mechanical kapı tarafından ayrıca doğrulanır)
