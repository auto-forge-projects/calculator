# 06 — UI/UX: calculator

- Tarih: 2026-07-24 | Mod: AUTOPILOT | Profil: LITE
- Ürün tipi: Web (tek sayfalık statik uygulama) → wireframe + akış

## Yüzey sözleşmesi
Tek ekran. Bileşenler: sonuç ekranı (üstte, sağa hizalı), sayı tuşları (0-9, .), operatör tuşları (+, −, ×, ÷), "=" ve "C" (temizle).

## Ana akış(lar) — uçtan uca (kalite kapısı)
```
Normal akış:  [7] [+] [3] [=]   → ekran: 10
Sıfıra bölme: [5] [÷] [0] [=]   → ekran: "Hata: sıfıra bölünemez" (C ile temizlenir)
Geçersiz girdi: [C] [=]         → ekran: "Hata: geçersiz girdi" (boş girişte = basılırsa)
Zincirleme:   [2] [+] [3] [+] [4] [=] → ekran: 9 (soldan sağa sıralı işlem, FR kapsamı önceliği yok)
```

## Çıktı/görsel şablonları
- Normal sonuç: sayı, sondaki gereksiz sıfırlar/ondalık kırpılmış (ör. `10`, `3.5`).
- Hata mesajı: kırmızı metin, ekranın üstünde — `Hata: sıfıra bölünemez` / `Hata: geçersiz girdi`.
- Boş/başlangıç durumu: ekran `0` gösterir.

## Tasarım notları
- Minimal, marka kimliği yok (brief kısıtı); nötr gri/beyaz tema.
- Erişilebilirlik: tuşlar `<button>` elementi, klavye ile de kullanılabilir (Enter=`=`, Escape=`C`).
- Responsive: flex/grid tabanlı düzen, mobilde tam genişlik.

## Kalite kapısı raporu
- "Ana kullanıcı akışları uçtan uca çizildi" → ✅ GEÇTİ (normal, sıfıra bölme, geçersiz girdi, zincirleme işlem akışları yukarıda dökümlü)
