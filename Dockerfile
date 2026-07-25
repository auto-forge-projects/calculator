# calculator — statik dosya servisi (bkz. docs/05-architecture.md: "Build/Deploy: Yok — statik dosya servisi").
# Sıfır bağımlılık ilkesi (DL-04-001) yalnız uygulama koduna dairdir; paketleme için hafif nginx yeterli.
FROM nginx:alpine

COPY src/ /usr/share/nginx/html/
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
