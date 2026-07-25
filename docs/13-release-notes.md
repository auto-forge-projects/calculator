# calculator v0.1.0 — Release Notes

- Tarih: 2026-07-25 | SemVer: **v0.1.0** (0.x = API garanti yok) | Mod: AUTOPILOT
> Sürüm numarası Faz 8 planındaki M1+M2 milestone'larıyla tutarlı: her ikisi de tamamlandı (FR-1..FR-6 eksiksiz).

## Öne çıkanlar
- İstemci-taraflı, sıfır bağımlılık dört işlem hesap makinesi (statik `index.html`+`app.js`+`style.css`).
- `eval()`/`Function()` mimari düzeyde yasak; girdi yalnız `Number()`+`Number.isFinite`, işlem sabit allowlist operatör tablosundan.

## Özellikler
- FR-1..FR-4: toplama/çıkarma/çarpma/bölme (sıfıra bölme → `{error}`, istisna yok).
- FR-5: geçersiz girdi hata mesajı (`Hata: geçersiz girdi` / `Hata: sıfıra bölünemez`).
- FR-6: Clear (`C` tuşu / `Escape`).
- Klavye desteği (rakam, `+ - * x ÷`, `Enter`, `Escape`) + responsive tuş takımı (NFR-4).

## Güvenlik
- OWASP Top 10 değerlendirildi (`docs/07-security.md`); SEC-1..SEC-5, SEC-7 Faz 10 code review'unda kodda doğrulandı (grep kanıtı: `eval`/`Function`/`innerHTML` repoda yok, CSP meta birebir uygulanmış, hata metinleri sabit).
- SEC-6 (CI en-az-yetki, non-root imaj): Faz 12'de `Dockerfile` (nginx:alpine statik servis) + workflow `permissions: contents:read` ile karşılandı.

## Bilinen sınırlar (docs/15-maintenance.md referanslı)
- Sayısal sınır durumları (çok büyük/çok küçük sonuç biçimlendirmesi) ve birkaç Minor/Nit bulgu (F5-F9, N1-N4) — bkz. `docs/15-maintenance.md` TD listesi.

## Kurulum
```bash
git clone <repo> && cd calculator
# Statik dosya sunucusu ile aç, örn:
npx serve src/     # veya Docker: docker build -t calculator . && docker run -p 3000:3000 calculator
```

## Rollback planı (kalite kapısı)
1. **Kod:** Önceki release tag'i yok (ilk sürüm); sorun çıkarsa `git revert <phase-9-commit-range>` ile Faz 9 değişiklikleri geri alınır, statik dosya olduğundan anlık etkilidir.
2. **Veri uyumluluğu:** Durumsuz (kalıcı depolama yok) — downgrade veri kaybı yaratmaz, kullanıcı state'i tarayıcı belleğinde geçicidir.
3. **Doğrulama:** Rollback sonrası `npm test` (38/38 yeşil beklenir) + `/health` endpoint (nginx statik servis) 200 dönmeli.
4. **Dağıtım:** Docker imajı `ghcr.io/auto-forge-projects/calculator:<önceki-sha>` tag'ine geri alınır (`deploy-image.yml` immutable SHA tag üretir); SSH-push deploy script'i (`deploy/remote-deploy.sh`) önceki tag ile yeniden çalıştırılır.

## Kalite kapısı raporu
- "Rollback prosedürü tanımlı" → ✅ (yukarıdaki 4 adım: kod/veri/doğrulama/dağıtım)
- "Sürüm plana uygun" → ✅ (Faz 8 M1+M2 milestone: v0.1.0, FR-1..FR-6 eksiksiz)
