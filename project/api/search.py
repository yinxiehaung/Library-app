# project/api/search.py

import os
import requests
from flask import request
from flask_restx import Resource, fields, Namespace

search_ns = Namespace('search', description='整合搜尋閘道')

# 搜尋的輸入模型 (前端傳來的)
search_payload = search_ns.model('SearchPayload', {
    'query': fields.String(required=True, description='使用者的查詢字串')
})

@search_ns.route('/basic')
class BasicSearch(Resource):
    @search_ns.doc('basic_search')
    @search_ns.expect(search_payload, validate=True)
    def post(self):
        """
        接收「基本搜尋」請求，並轉發至 N8N 基本搜尋模組
        """
        data = request.get_json()
        n8n_url = os.getenv('N8N_BASIC_SEARCH_URL')

        try:
            # 您的 API 閘道邏輯：轉發請求
            response = requests.post(n8n_url, json=data, timeout=10)
            response.raise_for_status()
            return response.json(), response.status_code
        except Exception as e:
            # 錯誤處理：N8N 服務連線失敗
            return {"error": "N8N 基本搜尋模組無回應", "message": str(e)}, 503

@search_ns.route('/advanced')
class AdvancedSearch(Resource):
    @search_ns.doc('advanced_search')
    @search_ns.expect(search_payload, validate=True)
    def post(self):
        """
        接收「RAG 搜尋」請求，並轉發至 N8N RAG 搜尋模組
        """
        data = request.get_json()
        n8n_url = os.getenv('N8N_ADVANCED_SEARCH_URL')

        try:
            # 您的 API 閘道邏輯：轉發請求
            response = requests.post(n8n_url, json=data, timeout=10)
            response.raise_for_status()
            return response.json(), response.status_code
        except Exception as e:
            return {"error": "N8N RAG 搜尋模組無回應", "message": str(e)}, 503
