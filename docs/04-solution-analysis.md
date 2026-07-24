# 04 — Çözüm Analizi: calculator

- Tarih: 2026-07-24 | Mod: AUTOPILOT | Profil: LITE

## Karar problemi
Backend'siz, tarayıcıda çalışan 4-işlem hesap makinesi için **frontend teknoloji yığını** seçimi.
Belirleyici kısıtlar: NFR-1 (ilk render <1sn), NFR-2 (girdi ASLA `eval()`/`Function()` ile çalışmaz — elle ayrıştırma), NFR-3 (çökmez), NFR-4 (responsive). Kapsam çok küçük (6 FR, tek ekran), solo/demo.

## Alternatifler (≥2 gerçek alternatif)
- **A — Vanilla HTML/CSS/JS (statik).** Tek `index.html` + `style.css` + `app.js`. Build/bundler yok, bağımlılık sıfır. Tarayıcıda doğrudan açılır.
- **B — React + Vite SPA.** Bileşen tabanlı, JSX, Vite dev server + `npm run build` ile bundle. Node/npm bağımlılık ağacı.
- **C — Hafif reaktif kütüphane (Alpine.js / Preact, CDN).** Küçük runtime (~10-40KB), build isteğe bağlı; HTML'e CDN `<script>` ile eklenir.

## Trade-off matrisi
| Kriter | A: Vanilla | B: React/Vite | C: Alpine/Preact (CDN) |
|--------|-----------|---------------|------------------------|
| Kurulum/build karmaşıklığı | Yok (dosyayı aç) | Yüksek (Node, Vite, npm install) | Düşük (tek CDN script) |
| Bağımlılık/tedarik zinciri riski | Sıfır | Yüksek (yüzlerce transitive dep) | Düşük (1 lib) |
| NFR-1 (render <1sn) | ✅ En hızlı (tek dosya) | ⚠️ Bundle + hydrate yükü | ✅ İyi (küçük runtime) |
| NFR-2 (eval yok) | ✅ Tam kontrol, elle parse | ✅ Sağlanabilir | ✅ Sağlanabilir |
| NFR-3/NFR-4 (çökmez/responsive) | ✅ Düz CSS + saf JS | ✅ | ✅ |
| Test edilebilirlik | ✅ Saf fn'ler (Jest/Vitest node) | ✅ ama araç kurulumu | ⚠️ CDN globali test zoru |
| Maliyet (LOC/zaman/kota) | En düşük | En yüksek (aşırı mühendislik) | Orta |
| Geri alınabilirlik | Yüksek (bağımlılık kilidi yok) | Orta (framework kilidi) | Yüksek (CDN kaldırılır) |

## Seçim: **A — Vanilla HTML/CSS/JS**
**Gerekçe:**
- Kapsam tek ekran/6 FR → React'in bileşen/state modeli net fayda getirmez; B **aşırı mühendislik** (build zinciri + tedarik-zinciri riski maliyeti değere ağır basar).
- NFR-2 en güvenli A'da karşılanır: bağımlılık yok, tüm ayrıştırma elle yazılır, `eval`/`Function` çağrısı repoda hiç bulunmaz (kod incelemesi trivial).
- NFR-1 (render <1sn) tek statik dosyayla en garantili; bundle/hydrate yükü yok.
- Hesap mantığı saf fonksiyonlar → `tests/` içinde bağımsız birim testi kolay (NFR-3 kanıtı).
- C elenir: reaktiflik bu kapsam için gereksiz; CDN bağımlılığı offline/tedarik riski ve test globali zorluğu ekler, A'ya karşı somut fayda yok.
- Geri alınabilirlik yüksek: framework kilidi yok; ileride büyürse C/B'ye taşınabilir.

## Kalite kapısı raporu
- "En az 2 alternatif karşılaştırıldı" → ✅ GEÇTİ (3 alternatif A/B/C, 9 kriterli satır-satır trade-off matrisi; her alternatif NFR-1..NFR-4 + maliyet + geri alınabilirlik boyutunda değerlendirildi)
