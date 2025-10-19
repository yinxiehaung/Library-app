from flask import Blueprint, jsonify, request
from flask_restx import Api, Resource, fields, Namespace
from ..models import Library
from ..extensions import db
from datetime import datetime

library_ns = Namespace('libraries',description='圖書館相關操作')
library_payload = library_ns.model('LibraryPayload', {
    'name':fields.String(required=True, description='圖書館名稱'),
    'address':fields.String(required=True, description='圖書館地址'),
    'phone':fields.String(required=True, description='圖書館電話')
})
library_model = library_ns.clone('LibraryModel', library_payload, {
    'id':fields.Integer(readonly=True, description='圖書館唯一的id')
})

@library_ns.route('/')
class LibraryList(Resource):
    @library_ns.doc('list_library',description='獲取所有圖書館列表')
    @library_ns.marshal_list_with(library_model)
    def get(self):
        return Library.query.all()
    @library_ns.doc('create_library',description='建立新的圖書館')
    @library_ns.expect(library_payload, validate=True)
    @library_ns.marshal_with(library_model, code=201)
    def post(self):
        data = request.get_json()
        try:
            new_library = Library(
                    name = data['name'],
                    address = data['address'],
                    phone = data['phone']
            )
            db.session.add(new_library)
            db.session.commit()
            return new_library, 201
        except Exception as e:
            db.session.rollback()
            return {"error":"無法將圖書館存入資料庫","message":str(e)},500
@library_ns.route('/<int:library_id>')
@library_ns.param('library_id','圖書館唯一的id')
class LibraryItem(Resource):
    @library_ns.doc('get_library',description='獲取圖書館的詳細資料')
    @library_ns.marshal_with(library_model)
    def get(self,library_id):
        return Library.query.get_or_404(library_id)
    @library_ns.doc('update_library',description='更新圖書館')
    @library_ns.expect(library_payload,validate=True)
    @library_ns.marshal_with(library_model)
    def put(self,library_id):
        library_to_update = Library.query.get_or_404(library_id)
        data = request.get_json()
        library_to_update.name = data['name']
        library_to_update.address = data['address']
        library_to_update.phone = data['phone']
        db.session.commit()
        return library_to_update
    @library_ns.doc('delete_library', description='刪除某一間圖書館')
    @library_ns.response(204, '圖書館已刪除')
    def delete(self,library_id):
        library_to_delete = Library.query.get_or_404(library_id)
        db.session.delete(library_to_delete)
        db.session.commit()
        return '',204

def register_routes(api):
    api.add_namespace(book_ns)
    api.add_namespace(library_ns)
