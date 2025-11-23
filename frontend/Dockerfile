FROM node:20-alpine as build
WORKDIR /app

# 複製設定檔並安裝套件
COPY package*.json ./
RUN npm install

# 複製所有程式碼
COPY . .

# 執行建置
# (根據您的 package.json，這會執行 "vite build")
# (根據您的 vite.config.ts，產物會放在 "build" 資料夾)
RUN npm run build

# 階段 2: 生產環境 (Nginx)
FROM nginx:alpine

# 【關鍵】複製建置好的檔案到 Nginx 目錄
# 注意：這裡複製的是 /app/build，因為您的 vite config 設定輸出到 build
COPY --from=build /app/build /usr/share/nginx/html

# 確保 Nginx 設定正確 (這行是為了讓 React Router 正常運作)
# 我們直接在命令列寫入一個簡單的 nginx 配置，讓所有 404 都導向 index.html
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
