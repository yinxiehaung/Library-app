from flask import request
from flask_restx import Resource, Namespace, fields
from ..models import User
from ..extensions import db, bcrypt
from flask_jwt_extended import create_access_token

auth_ns = Namespace('auth', description='使用者驗證 (註冊與登入)')

# 註冊用的輸入模型
register_payload = auth_ns.model('RegisterPayload', {
    'username': fields.String(required=True, description='使用者名稱'),
    'email': fields.String(required=True, description='電子郵件'),
    'password': fields.String(required=True, description='密碼 (明文)')
})

# 登入用的輸入模型
login_payload = auth_ns.model('LoginPayload', {
    'username': fields.String(required=True, description='使用者名稱'),
    'password': fields.String(required=True, description='密碼 (明文)')
})

# 登入成功的回傳模型
login_success = auth_ns.model('LoginSuccess', {
    'message': fields.String(description='登入成功訊息'),
    'access_token': fields.String(description='JWT 存取令牌')
})

@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.doc('register_user')
    @auth_ns.expect(register_payload, validate=True)
    @auth_ns.response(201, '使用者建立成功')
    def post(self):
        """建立一個新使用者"""
        data = request.get_json()
        username = data['username']
        email = data['email']

        # 檢查使用者或 email 是否已存在
        if User.query.filter_by(username=username).first():
            return {"error": "使用者名稱已被註冊"}, 409
        if User.query.filter_by(email=email).first():
            return {"error": "電子郵件已被註冊"}, 409

        # 【關鍵】使用 bcrypt 雜湊密碼
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        try:
            new_user = User(
                username=username,
                email=email,
                password_hash=hashed_password
            )
            db.session.add(new_user)
            db.session.commit()
            return {"message": "使用者建立成功"}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": "無法註冊使用者", "message": str(e)}, 500

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.doc('login_user')
    @auth_ns.expect(login_payload, validate=True)
    @auth_ns.marshal_with(login_success)
    def post(self):
        """使用者登入並獲取 JWT 令牌"""
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()

        # 【關鍵】使用 bcrypt 檢查密碼
        if user and bcrypt.check_password_hash(user.password_hash, data['password']):
            # 密碼正確，產生 JWT 令牌
            access_token = create_access_token(identity=str(user.id))
            return {"message": "登入成功", "access_token": access_token}, 200
        else:
            return {"error": "使用者名稱或密碼錯誤"}, 401
