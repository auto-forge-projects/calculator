# 00 — Rafine Proje Brief'i: calculator

- Tarih: 2026-07-22 | Rafine eden model: Claude Sonnet 5 | Onay durumu: **Onaylandı** (dashboard, 2026-07-22)

## Ham fikir (kullanıcının girdisi — değiştirilmez)
> basit bir hesap makinesi yap

## Rafine problem (tek cümle)
Kullanıcının dört işlem (toplama, çıkarma, çarpma, bölme) yapabileceği basit, tek sayfalık bir hesap makinesi arayüzü sunmak.

## Hedef kitle
Günlük basit hesaplamalar için tarayıcıdan erişen tek kullanıcı (solo/demo amaçlı, kurumsal kullanıcı yok).

## Kısıtlar & varsayımlar (AF-001 kapanışı)
- Platform/runtime: Web (tarayıcı üzerinde çalışan statik/basit frontend; backend gerekmez varsayımı)
- Çevrimiçi/çevrimdışı, veri konumu: Tamamen istemci-taraflı, veri saklanmıyor (state kalıcı değil)
- Zaman/kota bütçesi: Küçük, tek-oturumluk üretim; LITE profil hız hedefiyle uyumlu
- Varsayımlar: (1) Klasik dört işlem + ondalık sayı desteği yeterli, bilimsel fonksiyon (sin/cos/log vb.) İSTENMİYOR; (2) test framework'ü olmayan basit bir proje, ama Faz 9 TDD disiplini korunur; (3) tasarım minimal/temiz, özel marka kimliği yok

## Başarı kriterleri (ölçülebilir)
1. Dört işlemin (+, −, ×, ÷) tamamı doğru sonuç üretir (birim testlerle doğrulanır)
2. Sıfıra bölme ve geçersiz girdi (örn. boş/NaN) kullanıcıya hata olarak gösterilir, uygulama çökmez
3. Tarayıcıda tek tıkla açılıp en az 10 ardışık işlem hatasız yapılabilir

## Kapsam sınırı (v1'de yapılmayacaklar)
- Bilimsel hesap makinesi fonksiyonları (üs, kök, trigonometri) yok
- Kullanıcı hesabı/oturum/geçmiş kaydı yok
- Mobil native uygulama yok (yalnız responsive web)

## Açık sorular (kullanıcının netleştirmesi önerilen)
- [ ] Bilimsel fonksiyonlar (üs, kök vb.) v1'de gerekli mi, yoksa dört işlem yeterli mi?
- [ ] Belirli bir görsel stil/tema tercihi var mı, yoksa minimal varsayılan kabul mü?

## Önerilen profil ve ilk mod
- Profil: LITE · Gerekçe: Küçük, tek-kullanıcılı, düşük riskli bir araç; kurumsal ölçek/adversarial inceleme gerektirmiyor.

---
## Onay kaydı
- 2026-07-22 — Beklemede
