# 14 — Monitoring: calculator

- Tarih: 2026-07-25 | Mod: AUTOPILOT | Profil: LITE (basit health check + hata loglama)

## Ürün tipine göre izleme (web)

| Tip | İzlenecekler |
|-----|--------------|
| Web | `/health` endpoint (nginx statik servis), istemci-taraflı JS hataları, statik dosya sunum hataları (404/5xx) |

LITE profil asgari kapsam: health check + hata görünürlüğü (JS console hatası + nginx erişim/hata logu). Kod-içi analytics/APM eklenmedi (statik, durumsuz, sıfır bağımlılık mimarisiyle tutarlı — DL-04-001).

## Health check
| Kontrol | Sağlıklı | Sorunlu davranış |
|---------|----------|-------------------|
| `GET /health` (nginx, `deploy/nginx.conf`) | `200 OK` (statik yanıt) | Bağlantı reddi / 5xx → container ayakta değil veya statik dosya servis edilemiyor |
| `GET /` (index.html) | `200 OK`, `Content-Type: text/html` | 404 → yanlış `docker_image`/statik kök yolu; 5xx → nginx config hatası |
| Tarayıcı konsolu (manuel/gözlem) | Hata yok | `Uncaught TypeError`/`SyntaxError` → F7 (null-guard eksik, bkz. PR-1.md) tetiklenmiş olabilir |

## Hata görünürlüğü / loglama
- **Sunucu tarafı:** nginx erişim/hata logları (container stdout/stderr — `docker logs`); Docker/Swarm/SSH-deploy zaten stdout'u toplar, ek log altyapısı gerekmiyor (statik dosya servisi, uygulama sunucusu yok).
- **İstemci tarafı:** Uygulama hataları `{error}` birliğiyle UI'da gösterilir (`isError:true` + `.error` stili), konsola ayrıca `console.error` YAZILMAZ — CSP `default-src 'self'` zaten üçüncü-taraf hata toplama (Sentry vb.) engelliyor ve NFR-2 sıfır-bağımlılık ilkesiyle çelişirdi.
- **Hassas veri loglanmaz:** Girdi olarak yalnız sayı/operatör var (kullanıcı kimliği, PII, sır yok); nginx erişim logu yalnız istek yolu+durum kodu tutar, gövde/parametre loglanmaz (zaten GET isteği, body yok).

## Kritik akış izleme (kalite kapısı)
- **En kritik risk:** Statik dosya servisinin (container) ayakta kalmaması → tüm ürün erişilemez olur (tek risk yüzeyi, sunucu-taraflı iş mantığı yok).
- **Görünürlük/alert mekanizması:** `deploy-image.yml` + `remote-deploy.sh` sonrası `/health` **canlı probe** edilir (kural 9, bitiş otomasyonu) ve sonucu `state.deploy` alanına yazılır; dashboard 🔴/🟢 rozetiyle gösterir. Sürekli izleme (uptime ping) bu ölçekte (LITE, tek statik container) kapsam dışı — deploy-anı probe + manuel `docker logs` yeterli kabul edildi.
- **İkincil risk:** JS runtime hatası (F7 — DOM null-guard eksikliği, `docs/15-maintenance.md` TD-3) sayfayı sessizce kırabilir; alert mekanizması yok (istemci taraflı, sunucuya rapor edilmiyor) — bilinçli kapsam dışı, bkz. bakım planı.

## Kalite kapısı raporu
- "Kritik akışlar için alert/hata görünürlüğü tanımlı" → ✅ (health probe + deploy-anı doğrulama + nginx log; tip=web beklentisi: health/hata/log karşılandı)
