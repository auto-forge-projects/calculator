# 01-02 — Değer & Fizibilite (LITE birleşik faz): calculator

- Tarih: 2026-07-24 | Mod: AUTOPILOT | Profil: LITE

## Değer önerisi
Kuruluma gerek olmadan, tarayıcıda anında açılıp dört işlem yapabilen, hatalarda çökmeyen basit bir hesap makinesi sunar.

## KPI'lar (kalite kapısı: en az 3, ölçülebilir)
1. Doğruluk: dört işlemin (+, −, ×, ÷) tamamı birim testlerde %100 doğru sonuç üretir (ölçüm: Faz 9/11 test raporu).
2. Dayanıklılık: geçersiz girdi/sıfıra bölme senaryolarının %100'ünde uygulama çökmeden hata mesajı gösterir (ölçüm: Faz 11 kritik senaryo testleri).
3. Erişilebilirlik hızı: sayfa tek tıkla açılır, ilk anlamlı içerik < 1sn (ölçüm: tarayıcı DevTools performans sekmesi, statik sayfa olduğu için düşük risk).

## Fizibilite
- Teknik: İstemci-taraflı basit HTML/CSS/JS yeterli, backend/veritabanı gerekmiyor ✅
- Ekonomik: Statik barındırma maliyeti sıfıra yakın, ek lisans/servis yok ✅
- Zaman: LITE profil + dar kapsam (dört işlem) tek oturumluk üretime uygun ✅

## GO / NO-GO önerisi: **GO**
Gerekçe: Teknik, ekonomik ve zaman boyutlarının üçü de engelsiz; kapsam net ve dar (dört işlem, backend yok), risk düşük.

## Kalite kapısı raporu
- "En az 3 ölçülebilir KPI" → ✅ GEÇTİ
- "GO/NO-GO kararı gerekçeli" → ✅ GEÇTİ
