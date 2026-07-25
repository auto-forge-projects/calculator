# 05 — Mimari Tasarım: calculator

- Tarih: 2026-07-24 | Mod: AUTOPILOT | Profil: LITE

## Genel yaklaşım
Statik, sıfır-bağımlılık istemci uygulaması (Faz 4 → Alternatif A). Tek `index.html` sayfa,
saf JS mantık katmanı (parser + calculator), DOM render katmanı. Build/bundler/framework YOK.
Hesap mantığı **saf fonksiyonlar** olarak izole → hem güvenlik (eval yasağı) hem test edilebilirlik.

## Dosya yapısı
| Dosya | Sorumluluk |
|-------|------------|
| `index.html` | İskelet: tek ekranlı tuş takımı (11 rakam + 4 operatör + `=`/`C`), sonuç alanı |
| `style.css` | Sunum + responsive layout (mobil/masaüstü) |
| `app.js` | Mantık: `parseNumber()`/`calculate()`/`formatResult()` (saf fn) + reducer durum makinesi (`reduceDigit`/`reduceOperator`/`reduceEquals`/`reduceClear`) + ince DOM adaptörü (olay bağlama, `render()`, klavye haritası) |
| `app.test.js` | Saf fonksiyon + reducer birim testleri (parser + 4 işlem + hata yolları + durum geçişleri) |

Not: `app.js` tek dosyada üç katman tutar (parser/calculator saf fn'ler + reducer durum makinesi + ince DOM adaptörü);
LITE kapsamda ayrı modül dosyaları gereksiz. Saf fn'ler ve reducer'lar `export` edilerek testten tüketilir.
**(Faz 10 F3 düzeltmesi — DL-10-001):** UI, "iki sayı girişi" yerine tek-ekranlı tuş takımı + reducer
durum makinesi olarak implemente edildi; bu bölüm ve aşağıdaki diyagram/veri modeli buna göre güncellendi.

## Bileşen görünümü
```mermaid
graph TD
  HTML[index.html<br/>tuş takımı + sonuç ekranı] -->|tuş olayı| ADP[DOM adaptörü<br/>app.js]
  ADP -->|digit/op/equals/clear| RED[Reducer durum makinesi<br/>reduceDigit/reduceOperator/reduceEquals/reduceClear]
  RED -->|ham metin| PAR[parseNumber<br/>saf fn]
  PAR -->|sayı / hata| CALC[calculate a,op,b<br/>sabit operatör tablosu]
  CALC -->|sonuç / hata mesajı| RED
  RED -->|display state| FMT[formatResult<br/>saf fn]
  FMT -->|textContent| ADP
  ADP -->|render| HTML
  TEST[app.test.js] -.test.-> PAR
  TEST -.test.-> CALC
  TEST -.test.-> RED
  CSS[style.css] -.stil.-> HTML
```

## Veri akışı
```mermaid
sequenceDiagram
  participant U as Kullanıcı
  participant D as DOM adaptörü (app.js)
  participant P as parseNumber
  participant C as calculate
  U->>D: operatör butonuna tıklar
  D->>P: girdi metinlerini ayrıştır
  alt geçersiz / boş girdi
    P-->>D: {error:"geçersiz girdi"}
    D-->>U: "Hata: geçersiz girdi" göster
  else geçerli sayılar
    P-->>D: {a, b}
    D->>C: calculate(a, op, b)
    alt op="÷" ve b=0
      C-->>D: {error:"sıfıra bölünemez"}
      D-->>U: "Hata: sıfıra bölünemez"
    else
      C-->>D: {value}
      D-->>U: sonucu göster (<100ms)
    end
  end
```

## Veri modeli
Kalıcı depolama yok (durumsuz). Geçici çalışma değerleri:
- Reducer durumu (tek ekran tuş takımı — Faz 10 F3): `{ display:string, previous:number|null, operator:string|null, awaitingNext:boolean, hasEntered:boolean, isError:boolean }`; `createInitialState()` başlangıç değerini üretir.
- Saf hesap katmanı girdisi: `calculate(a:number, op:'+'|'-'|'×'|'÷', b:number)`.
- Sonuç: ayrık birlik → `{ value:number }` VEYA `{ error:string }` (istisna fırlatmadan hata taşınır → NFR-3).
- Operatör tablosu: sabit `{ '+':fn, '-':fn, '×':fn, '÷':fn }` — allowlist; tablo dışı op reddedilir.

## Teknoloji seçimleri
| Katman | Seçim | Alternatifler | DL referansı |
|--------|-------|---------------|--------------|
| Sunum | Vanilla HTML + CSS (responsive, flex/media query) | React/Vite, Alpine/Preact | DL-04-001 |
| Mantık | Saf ES modül JS, elle parse + sabit operatör tablosu | `eval()`/`Function()` (REDDEDİLDİ) | DL-05-001, DL-03-001 |
| Test | Node yerleşik test runner (`node --test`), sıfır dep | Jest/Vitest | DL-05-001 |
| Build/Deploy | Yok — statik dosya servisi | Bundler | DL-04-001 |

## NFR ↔ Mimari eşlemesi (kalite kapısı kanıtı)
| NFR | Mimarideki somut karşılığı |
|-----|-----------------------------|
| NFR-1 Performans (render <1sn, işlem <100ms) | Tek statik `index.html`, bundle/hydrate yok; işlem senkron saf fn (O(1) aritmetik) → <100ms garanti |
| NFR-2 Güvenlik (eval yasağı) | Girdi yalnız `parseNumber()` ile sayıya çevrilir; işlem SABİT operatör tablosundan (allowlist) seçilir; `eval`/`Function`/`new Function` repoda HİÇ yok → kod incelemesi trivial (bkz. DL-05-001) |
| NFR-3 Güvenilirlik (çökmez) | Hata istisna değil, `{error}` birliğiyle taşınır; parser boş/NaN'ı, calculate sıfıra bölmeyi yakalar; saf fn'ler `app.test.js` ile FR-4/FR-5 yollarında test edilir |
| NFR-4 Kullanılabilirlik (responsive) | `style.css` flexbox + `@media` breakpoint; sabit-genişlik/px-taşma yok → mobil/masaüstü bozulmasız |

## ADR listesi
- DL-05-001: Elle tokenize/parse + sabit operatör tablosu; `eval()`/`Function()` mimari düzeyde yasak; test için Node yerleşik runner (sıfır bağımlılık).
- DL-04-001: (Faz 4) Vanilla HTML/CSS/JS yığını seçimi — referans.
- DL-03-001: (Faz 3) NFR-2 eval yasağı kısıtı — referans.

## Kalite kapısı raporu
- "Kritik NFR'lerin mimaride karşılığı var" → ✅ GEÇTİ. NFR-1..NFR-4'ün DÖRDÜ de yukarıdaki
  "NFR ↔ Mimari" tablosunda somut mimari mekanizmaya eşlendi (statik tek dosya; allowlist operatör
  tablosu + eval-yok; `{error}` birliğiyle çökmez hata yolu; flex/media responsive). Kritik kısıt
  NFR-2 (eval yasağı) DL-05-001 ile mimari kurala bağlandı.
