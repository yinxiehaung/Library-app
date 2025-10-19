from flask import request
from flask_restx import Resource, fields, Namespace
from ..models import BookCopy,Book,Library
from ..extensions import db

copy_ns = Namespace('copies', description='圖書館藏複本（實體書）相關操作')

copy_payload = copy_ns.model('BookCopyPayload', {
    'book_id': fields.Integer(required=True, description='所屬書籍的 ID'),
    'library_id': fields.Integer(required=True, description='所屬圖書館的 ID'),
    'call_number': fields.String(description='索書號 (例如 857.7 1234)'),
    'status': fields.Integer(required=True, description='館藏狀態 (0: 在館, 1: 已借出, 2: 預約中)', default=0)
})

copy_model = copy_ns.clone('BookCopyModel', copy_payload, {
    'id': fields.Integer(readonly=True, description='館藏的唯一 ID'),
    
    'book_name': fields.String(attribute='book.name', readonly=True, description='書名'),
    'library_name': fields.String(attribute='library.name', readonly=True, description='圖書館名稱')
})

@copy_ns.route('/')
class CopyList(Resource):    
    @copy_ns.doc('list_copies', description='獲取所有館藏列表')
    @copy_ns.marshal_list_with(copy_model) 
    def get(self): 
        return BookCopy.query.all()

    @copy_ns.doc('create_copy', description='新增一筆館藏紀錄（登錄一本新書）')
    @copy_ns.expect(copy_payload, validate=True)
    @copy_ns.marshal_with(copy_model, code=201)
    def post(self): 
        data = request.get_json()
         
        if not Book.query.get(data['book_id']):
            return {"error": f"ID 為 {data['book_id']} 的書籍不存在"}, 404
        if not Library.query.get(data['library_id']):
            return {"error": f"ID 為 {data['library_id']} 的圖書館不存在"}, 404

        try:
            new_copy = BookCopy(
                book_id=data['book_id'],
                library_id=data['library_id'],
                call_number=data.get('call_number'), 
                status=data.get('status', 0) 
            )
            db.session.add(new_copy)
            db.session.commit()
            return new_copy, 201
        except Exception as e:
            db.session.rollback()
            return {"error": "無法將館藏存入資料庫", "message": str(e)}, 500

@copy_ns.route('/<int:copy_id>')
@copy_ns.param('copy_id', '館藏的唯一 ID')
class CopyItem(Resource):
    
    @copy_ns.doc('get_copy', description='獲取單一館藏的詳細資料')
    @copy_ns.marshal_with(copy_model)
    def get(self, copy_id):
        return BookCopy.query.get_or_404(copy_id)

    @copy_ns.doc('update_copy', description='更新一筆館藏（例如：借出、歸還、遺失）')
    @copy_ns.expect(copy_payload, validate=True) 
    @copy_ns.marshal_with(copy_model)
    def put(self, copy_id):
        copy_to_update = BookCopy.query.get_or_404(copy_id)
        data = request.get_json()

        if 'book_id' in data and not Book.query.get(data['book_id']):
            return {"error": "更新失敗：書籍 ID 不存在"}, 404
        if 'library_id' in data and not Library.query.get(data['library_id']):
            return {"error": "更新失敗：圖書館 ID 不存在"}, 404

        try:
            copy_to_update.book_id = data['book_id']
            copy_to_update.library_id = data['library_id']
            copy_to_update.call_number = data.get('call_number')
            copy_to_update.status = data['status']
            
            db.session.commit()
            return copy_to_update
        except Exception as e:
            db.session.rollback()
            return {"error": "無法更新館藏", "message": str(e)}, 500

    @copy_ns.doc('delete_copy', description='刪除一筆館藏（例如：書籍報廢）')
    @copy_ns.response(204, '館藏已刪除')
    def delete(self, copy_id):
        copy_to_delete = BookCopy.query.get_or_404(copy_id)
        db.session.delete(copy_to_delete)
        db.session.commit()
        return '', 204
