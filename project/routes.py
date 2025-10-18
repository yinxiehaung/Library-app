# project/routes.py

from flask import Blueprint, jsonify
# 從 models 檔案匯入我們需要的模型
from .models import Book

# 建立一個 Blueprint 物件，'api' 是名稱，__name__ 是必須的
api_bp = Blueprint('api', __name__)

# 注意！路由裝飾器從 @app.route 改成了 @api_bp.route
@api_bp.route('/')
def index():
    return jsonify({
        "message": "歡迎來到重構後的花蓮圖書館整合系統 API！",
        "status": "ok"
    })

@api_bp.route('/api/books', methods=['GET'])
def get_books():
    try:
        all_books = Book.query.all()
        books_list = []
        for book in all_books:
            books_list.append({
                'id': book.id,
                'name': book.name,
                'author': book.author,
                'isbn': book.isbn,
                'publication_date': book.publication_date.strftime('%Y-%m-%d') if book.publication_date else None,
                'publisher': book.publisher,
                'category': book.category,
                'cover_image_url': book.cover_image_url
            })
        return jsonify(books_list)
    except Exception as e:
        return jsonify({"error": "無法查詢書籍", "message": str(e)}), 500
