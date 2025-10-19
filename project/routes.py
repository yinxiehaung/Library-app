# project/routes.py
from flask import Blueprint, jsonify, request
from flask_restx import Api, Resource, fields, Namespace
from .models import Book
from .extensions import db
from datetime import datetime

book_ns = Namespace('books', description='書籍相關操作')
book_payload = book_ns.model('BookPayload', {
    'name': fields.String(required=True, description='書名'),
    'author': fields.String(required=True, description='作者'),
    'isbn': fields.String(required=True, description='ISBN'),
    'publication_date': fields.Date(description='出版日期 (YYYY-MM-DD)'),
    'publisher': fields.String(description='出版社'),
    'description': fields.String(description='簡介'),
    'category': fields.String(description='分類'),
    'language': fields.String(description='語言'),
    'cover_image_url': fields.String(description='封面圖 URL')
})

book_model = book_ns.clone('BookModel', book_payload, {
    'id': fields.Integer(readonly=True, description='書籍的唯一 ID')
})

api_bp = Blueprint('api', __name__)

@book_ns.route('/')
class BookList(Resource):
    @book_ns.doc('list_books',description='獲取所有書籍列表')
    @book_ns.marshal_list_with(book_model)
    def get(self):
        return Book.query.all()
    @book_ns.doc('create_book',description='建立一本新書')
    @book_ns.expect(book_model, validate=True)
    @book_ns.marshal_with(book_model, code=201)
    def post(self):
        data = request.get_json()
        pub_date = data.get('publication_date')
        if pub_date:
            try:
                pub_date = datetime.strptime(pub_date,'%Y-%m-%d').date()
            except ValueError:
                return {"error":"日期格式錯誤，請使用 YYYY-MM-DD"},400
        try:
            new_book = Book(
                name=data['name'],
                author=data['author'],
                isbn=data['isbn'],
                publication_date=pub_date,
                publisher=data.get('publisher'),
                description=data.get('description'),
                category=data.get('category'),
                language=data.get('language'),
                cover_image_url=data.get('cover_image_url')
            )
            db.session.add(new_book)
            db.session.commit()
            return new_book,201
        except Exception as e:
            db.session.rollback()
            return {"error":"無法將書籍存入資料庫", "message": str(e)}, 500
def register_routes(api):
    api.add_namespace(book_ns)
