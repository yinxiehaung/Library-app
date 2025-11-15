from flask import Flask
from .config import Config
from .extensions import db, migrate,bcrypt, jwt
from flask_restx import Api
from .api import register_routes
from . import models

authorizations = {
    'jwt_auth': {  # 這是一個您自訂的名稱，可以隨意取
        'type': 'apiKey',      # 授權類型是 API Key
        'in': 'header',        # 這個 Key 是放在 HTTP 的「標頭 (Header)」中
        'name': 'Authorization', # 標頭的「名稱」就叫做 "Authorization"
        'description': "JWT 授權標頭。請在 'Value' 框中輸入 'Bearer [您的 JWT 令牌]'"
    }
}

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    db.init_app(app)
    migrate.init_app(app,db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    api = Api(
            app,
            version='1.0',
            title='花蓮圖書館整合系統 API',
            description='一個由 Flask-RestX 自動產生的專業 API 文件',
            doc='/doc/',
            authorizations=authorizations,  # <-- 3. 載入您剛剛定義的方案
            security='jwt_auth'          # <-- 4. 告訴 Swagger UI 全域套用這個方案
    )
    register_routes(api)
    return app
