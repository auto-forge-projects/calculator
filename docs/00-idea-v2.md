# Yeni İhtiyaç — REQ-001 (cycle 2)

## Talep (birebir)

> "+ - * ve / butonları rakamların solunda kalmış. bu butonları en sağa alalım."

## Sınıflandırma

**patch** — davranış/FR değişmiyor, yalnız görsel düzen (grid hizalama) düzeltmesi.

**Gerekçe:** `src/index.html` içindeki tuş grid'inde (`grid-template-columns: repeat(4, 1fr)`) 2-4. satırlarda operatör butonları (×, −, +) zaten grid'in son (4.) sütununda — yani rakamların sağında. Ancak 1. satırda `C` butonu yalnız 2 sütun kaplıyor (`key-span2`) ve `÷` bu span'ın hemen ardından 3. sütuna düşüyor; 4. sütun boş kalıyor. Sonuç: `÷` görsel olarak diğer operatörlerin (×, −, +) bir sütun SOLUNDA hizalanıyor — kullanıcının "operatörler sola kaymış" algısının kaynağı budur. Düzeltme: `C` butonunu 3 sütuna yayıp (`key-span3`) `÷`'yi 4. sütuna (diğer operatörlerle aynı hizaya) taşımak — tüm operatör sütunu tutarlı şekilde en sağda hizalanır.

## Hedef faz

**Faz 9 (Development)** — `src/index.html` (grid-span sınıfı değişimi) + `src/style.css` (`.key-span3` kuralı eklenir). Yeni FR yok, mevcut FR-* kapsamı değişmez.

Downstream (mevcut motor tarafından otomatik türetilir): Faz 10 (blind diff re-review), Faz 11 (regresyon: tuş click/klavye davranışı; yeni senaryo yok), Faz 13 (patch sürüm artışı — v0.1.**1**).

## Varsayım (kural 8)

Kullanıcı onayı beklenmeden sınıflandırma ve hedef faz orchestrator tarafından karara bağlandı (komut talimatı: bu talep için özel onay kapısı yok, `default_mode` uygulanır). Proje `default_mode: AUTOPILOT` — Faz 9→10→11→13 zinciri kalite kapıları geçtiği sürece otomatik ilerler; herhangi bir kapı düşerse `gate_failed` ile durur ve eskale eder.
