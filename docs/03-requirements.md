# 03 — Requirement Analizi: calculator

- Tarih: 2026-07-24 | Mod: AUTOPILOT | Profil: LITE

## Fonksiyonel gereksinimler

### FR-1: Toplama
- **User story:** Kullanıcı olarak, iki sayıyı toplamak istiyorum, böylece hızlı hesap yapabileyim.
- **Kabul kriterleri:** Given iki geçerli sayı, when "+" işlenir, then doğru toplam gösterilir.
- **Öncelik:** Must

### FR-2: Çıkarma
- **User story:** Kullanıcı olarak, bir sayıdan diğerini çıkarmak istiyorum.
- **Kabul kriterleri:** Given iki geçerli sayı, when "−" işlenir, then doğru fark gösterilir.
- **Öncelik:** Must

### FR-3: Çarpma
- **User story:** Kullanıcı olarak, iki sayıyı çarpmak istiyorum.
- **Kabul kriterleri:** Given iki geçerli sayı, when "×" işlenir, then doğru çarpım gösterilir.
- **Öncelik:** Must

### FR-4: Bölme
- **User story:** Kullanıcı olarak, bir sayıyı diğerine bölmek istiyorum.
- **Kabul kriterleri:** Given ikinci sayı sıfır DEĞİL, when "÷" işlenir, then doğru bölüm gösterilir; given ikinci sayı sıfır, when "÷" işlenir, then çökmeden "Hata: sıfıra bölünemez" gösterilir.
- **Öncelik:** Must

### FR-5: Geçersiz girdi yönetimi
- **User story:** Kullanıcı olarak, boş/sayısal-olmayan girdi girdiğimde anlaşılır bir hata görmek istiyorum.
- **Kabul kriterleri:** Given girdi boş/NaN, when işlem tuşuna basılır, then "Hata: geçersiz girdi" gösterilir, uygulama çökmez.
- **Öncelik:** Must

### FR-6: Temizle (Clear)
- **User story:** Kullanıcı olarak, ekranı ve girdileri sıfırlamak istiyorum, böylece yeni işleme başlayabileyim.
- **Kabul kriterleri:** Given herhangi bir durum, when "C" tuşuna basılır, then girdiler ve sonuç sıfırlanır.
- **Öncelik:** Should

## Fonksiyonel olmayan gereksinimler
| ID | Kategori | Gereksinim | Ölçüt / Hedef |
|----|----------|------------|----------------|
| NFR-1 | Performans | Sayfa yükleme ve işlem yanıtı | İlk render < 1sn; işlem sonucu < 100ms |
| NFR-2 | Güvenlik | Kullanıcı girdisi doğrudan `eval()`/`Function()` ile çalıştırılmaz | Kod incelemesinde ✅ (yalnız sayısal ayrıştırma + sabit operatör seti) |
| NFR-3 | Güvenilirlik | Hiçbir girdi kombinasyonu uygulamayı çökertmez (FR-4/FR-5 hata yolları) | 10 ardışık işlemlik manuel/otomatik test senaryosu hatasız |
| NFR-4 | Kullanılabilirlik | Responsive tasarım (mobil/masaüstü) | Chrome DevTools responsive modda görsel bozulma yok |

## İzlenebilirlik
| FR | Karşıladığı KPI / iş hedefi |
|----|------------------------------|
| FR-1..FR-4 | KPI-1: Doğruluk (4 işlem %100 doğru) |
| FR-4, FR-5 | KPI-2: Dayanıklılık (çökmeden hata gösterimi) |
| FR-6, NFR-1, NFR-4 | KPI-3: Erişilebilirlik hızı (<1sn, tek tık) |

## Kalite kapısı raporu
- "Her FR'nin kabul kriteri var" → ✅ GEÇTİ (FR-1..FR-6 hepsinde Given/When/Then)
- "NFR'ler ölçülebilir" → ✅ GEÇTİ (NFR-1..NFR-4 hepsinde sayısal/gözlemlenebilir eşik)
