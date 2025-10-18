# 1. 使用官方的 Python 3.9 作為基礎環境
FROM python:3.9-slim

# 2. 在容器(container)內建立一個工作目錄 /app
WORKDIR /app

# 3. 把本地的 requirements.txt 複製到容器的 /app 目錄下
COPY requirements.txt .

# 4. 在容器內執行指令，安裝所有需要的套件
RUN pip install --no-cache-dir -r requirements.txt

# 5. 把本地的所有檔案 (.) 複製到容器的 /app 目錄下
COPY . .

# 6. 【新增此行】設定容器啟動時要執行的預設命令
CMD ["python", "run.py"]
CMD ["sh", "-c", "flask db upgrade && python run.py"]
