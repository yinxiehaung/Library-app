# 花蓮圖書館整合系統 (後端)

這是一個使用 Flask, PostgreSQL 和 Docker 打造的後端 API 服務。

## 專案架構

* **api:** Flask 應用程式 (使用應用程式工廠模式)
* **db:** PostgreSQL 13 資料庫
* **adminer:** 資料庫管理介面 (運行在 http://localhost:8080)

## 快速啟動 (開發環境)

1.  **Clone 專案**
    ```bash
    git clone [您的 GitHub Repo 網址]
    cd [您的專案資料夾名稱]
    ```

2.  **建立環境變數檔案**
    * 複製範本檔案：
    ```bash
    cp .env.example .env
    ```
    * 然後請開啟 `.env` 檔案，並填入您自己的資料庫密碼。

3.  **啟動服務**
    ```bash
    docker-compose up --build
    ```
    * 服務啟動時會自動執行 `flask db upgrade` 來建立或更新資料表。
    * API 服務運行在: `http://localhost:5000`

## 如何建立新的資料庫遷移 (Migration)

當您修改了 `project/models.py` 檔案後，您必須手動產生新的遷移腳本：

1.  進入 `api` 容器：
    ```bash
    docker exec -it <您的 api 容器名稱> sh
    ```

2.  在容器內執行 `flask db migrate`：
    ```bash
    flask db migrate -m "您的修改備註 (例如: Added phone to User model)"
    ```

3.  提交 `migrations/` 資料夾的變更到 Git。
