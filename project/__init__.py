from flask import Flask
from .config import Config
from .extensions import db, migrate
from flask_restx import Api
from .routes import register_routes
from . import models
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    db.init_app(app)
    migrate.init_app(app,db)
    api = Api(
            app,
            version='1.0',
            title='花蓮圖書館整合系統 API',
            description='一個由 Flask-RestX 自動產生的專業 API 文件',
            doc='/doc/'
    )
    register_routes(api)
    return app
