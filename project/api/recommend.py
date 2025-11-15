import os
import requests
from flask import jsonify
from flask_restx import Resource, Namespace
# 匯入 JWT 工具和您的 Loan 模型
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Loan
from ..extensions import db

# 1. 建立 Namespace
recommend_ns = Namespace('recommend', description='個人化 RAG 推薦閘道')

# 2. 建立「資源 (Resource)」
@recommend_ns.route('/')
class RecommendationGateway(Resource):
    
    @recommend_ns.doc('get_recommendations', 
                      description='獲取個人化的書籍推薦 (必須登入)')
    @recommend_ns.response(401, '未經授權 (JWT 令牌無效或未提供)')
    @recommend_ns.response(503, 'N8N 推薦模組無回應')
    @jwt_required()  # <-- 【關鍵】 加上這個「保護罩」
    def post(self):
        """
        獲取 RAG 推薦。
        此 API 會查詢您的借閱歷史，並轉發給 N8N 推薦模組。
        """
        
        # 3. 獲取當前登入者的 ID (來自 JWT)
        try:
            current_user_id = int(get_jwt_identity())
        except Exception as e:
            return {"error": "無效的 JWT 身份", "message": str(e)}, 422 # 422 Unprocessable Entity

        # 4. 【核心邏輯 1】 查詢您「自己」的 PostgreSQL 資料庫
        try:
            my_loans = Loan.query.filter_by(user_id=current_user_id).order_by(Loan.loan_date.desc()).limit(20).all()
            
            # 將借閱歷史格式化為一個簡單的列表
            loan_history_titles = [loan.book_title for loan in my_loans]
            
            if not loan_history_titles:
                return {"message": "您還沒有借閱紀錄，無法進行推薦"}, 200

        except Exception as e:
            return {"error": "查詢借閱紀錄時發生錯誤", "message": str(e)}, 500

        # 5. 獲取 N8N 服務的 URL (來自 .env)
        n8n_url = os.getenv('N8N_RECOMMEND_URL')
        if not n8n_url:
            return {"error": "N8N 推薦模組未設定"}, 503 # 503 Service Unavailable
            
        # 6. 【核心邏輯 2】 轉發請求給 N8N
        n8n_payload = {
            "user_id": current_user_id,
            "loan_history": loan_history_titles
        }

        try:
            response = requests.post(n8n_url, json=n8n_payload, timeout=10)
            response.raise_for_status() # 檢查 N8N 是否回傳錯誤
            
            # 7. 【成功】將 N8N 的「完整 JSON 回應」直接回傳給前端
            return response.json(), response.status_code

        except requests.exceptions.Timeout:
            return {"error": "N8N 推薦模組回應超時"}, 504 # 504 Gateway Timeout
        except requests.exceptions.ConnectionError:
            return {"error": "無法連接至 N8N 推薦模組"}, 504
        except requests.exceptions.HTTPError as e:
            return {"error": "N8N 推薦模組回報錯誤", "n8n_response": e.response.text}, e.response.status_code
        except Exception as e:
            return {"error": "閘道發生未知錯誤", "message": str(e)}, 500
