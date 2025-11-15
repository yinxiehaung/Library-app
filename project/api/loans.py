from flask import request
from flask_restx import Resource, Namespace, fields
from ..models import Loan, User
from ..extensions import db
# 【關鍵】 匯入 JWT 工具來「保護」API
from flask_jwt_extended import jwt_required, get_jwt_identity

loan_ns = Namespace('loans', description='借閱紀錄相關操作')

# (輸入) 建立一筆借閱紀錄
loan_payload = loan_ns.model('LoanPayload', {
    'book_title': fields.String(required=True, description='書名'),
    'book_isbn': fields.String(description='ISBN (選填)')
})

# (輸出) 顯示借閱紀錄
loan_model = loan_ns.clone('LoanModel', loan_payload, {
    'id': fields.Integer(readonly=True),
    'user_id': fields.Integer(readonly=True),
    'loan_date': fields.DateTime(readonly=True)
})

@loan_ns.route('/')
class LoanList(Resource):

    @loan_ns.doc('create_loan', description='新增一筆借閱紀錄 (需要登入)')
    @loan_ns.expect(loan_payload, validate=True)
    @loan_ns.marshal_with(loan_model, code=201)
    @jwt_required()  # <-- 【關鍵】 加上這個「保護罩」
    def post(self):
        """新增一筆借閱紀錄"""

        # 【關鍵】 從 JWT 令牌中獲取當前登入者的 ID
        current_user_id = int(get_jwt_identity())

        data = request.get_json()

        new_loan = Loan(
            user_id=current_user_id,
            book_title=data['book_title'],
            book_isbn=data.get('book_isbn')
        )
        db.session.add(new_loan)
        db.session.commit()
        return new_loan, 201

@loan_ns.route('/my')
class MyLoans(Resource):

    @loan_ns.doc('get_my_loans', description='獲取我所有的借閱歷史 (需要登入)')
    @loan_ns.marshal_list_with(loan_model)
    @jwt_required() # <-- 【關鍵】 加上這個「保護罩」
    def get(self):
        """獲取當前登入者的所有借閱紀錄"""

        # 【關鍵】 從 JWT 令牌中獲取當前登入者的 ID
        current_user_id = int(get_jwt_identity())

        my_loans = Loan.query.filter_by(user_id=current_user_id).all()
        return my_loans
