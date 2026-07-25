# 11 — Test Planı: calculator

- Tarih: 2026-07-25 | Mod: AUTOPILOT | Profil: LITE | Rol: `test-engineer` (orchestrator inline)
- Girdi: `docs/03-requirements.md`, `src/`, `tests/`, `docs/10-review/PR-1.md` (F4/NFR-3 yönlendirmesi)

## Kapsam (Faz 10 F4 yönlendirmesi kapatıldı)
| # | Senaryo | Kritiklik | Durum |
|---|---------|-----------|-------|
| T1 | HTML↔JS sözleşmesi: 11 `data-digit` + 4 `data-op` (allowlist) + `#screen`/`#equals`/`#clear` | Kritik (regresyon kör noktası, F4) | ✅ |
| T2 | DOM smoke: tıklama ile [7][+][3][=] → 10 | Kritik (F4) | ✅ |
| T3 | DOM smoke: klavye ile sıfıra bölme → hata + `.error` sınıfı | Kritik (F4) | ✅ |
| T4 | DOM smoke: Escape ile temizleme | Major (F4) | ✅ |
| T5 | NFR-3: 10 ardışık işlem (sol-sağ, öncelik yok) çökmeden doğru sonuç | Kritik | ✅ |
| T6 | FR-1..FR-6 + hata yolları (Faz 9'dan devralınan 31 test) | Kritik | ✅ (mevcut) |

## Yöntem
Minimal DOM stub (`tests/contract.test.js`) — gerçek jsdom bağımlılığı eklenmedi (sıfır-bağımlılık
mimari ilkesi, DL-05-001 korunur). Statik sözleşme kontrolü `src/index.html` metin taraması ile.

## Kalite kapısı raporu
- "Kritik senaryolar %100" → ✅ T1-T6 hepsi geçti (38/38 test yeşil).
