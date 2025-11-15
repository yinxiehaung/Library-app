import os
class Config:
    DB_USER = os.getenv('POSTGRES_USER','user')
    DB_PASS = os.getenv('POSTGRES_PASSWORD','password')
    DB_HOST = os.getenv('DB_HOST','db')
    DB_NAME = os.getenv('POSTGRES_DB', 'library_db')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-fallback-key')
    SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:5432/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
