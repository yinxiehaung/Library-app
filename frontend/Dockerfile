# 階段 1: 建置 (Build)
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 階段 2: 執行 (Run) - 使用 Nginx 來伺服這些靜態檔案
FROM nginx:alpine
# 把階段 1 產生出來的 build 資料夾，複製到 Nginx 的網頁目錄
COPY --from=build /app/build /usr/share/nginx/html
# 開放容器內部的 80 埠
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
