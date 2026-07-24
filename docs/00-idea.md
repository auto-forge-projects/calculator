# 00 — Fikir (Intake): calculator

- Tarih: 2026-07-24 | Mod: AUTOPILOT | Profil: LITE

## Problem (tek cümle)
Kullanıcının dört işlemi (toplama, çıkarma, çarpma, bölme) yapabileceği basit, tek sayfalık bir hesap makinesi arayüzü yok.

## Çözüm fikri
Tamamen istemci-taraflı (backend'siz), tarayıcıda çalışan minimal bir hesap makinesi web arayüzü: dört işlem + ondalık sayı desteği, hatalı girdi/sıfıra bölmede çökmeden hata gösterimi.

## Hedef kitle
Günlük basit hesaplamalar için tarayıcıdan erişen tek kullanıcı (solo/demo amaçlı; kurumsal kullanıcı yok).

## Başarı kriterleri
1. Dört işlemin (+, −, ×, ÷) tamamı doğru sonuç üretir (birim testlerle doğrulanır).
2. Sıfıra bölme ve geçersiz girdi (boş/NaN) kullanıcıya hata olarak gösterilir, uygulama çökmez.
3. Tarayıcıda tek tıkla açılıp en az 10 ardışık işlem hatasız yapılabilir.

## Kapsam dışı (v1)
- Bilimsel hesap makinesi fonksiyonları (üs, kök, trigonometri).
- Kullanıcı hesabı/oturum/geçmiş kaydı.
- Mobil native uygulama (yalnız responsive web).

## Kalite kapısı raporu
- "Problem tek cümlede ifade edilebiliyor" → ✅ GEÇTİ (yukarıdaki "Problem" bölümü tek cümle, ölçülebilir başarı kriterleriyle desteklenmiş).
