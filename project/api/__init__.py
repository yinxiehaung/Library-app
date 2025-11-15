from flask_restx import Api
from .auth import auth_ns
from .loans import loan_ns
from .recommend import recommend_ns
from .search import search_ns

def register_routes(api: Api):
    api.add_namespace(auth_ns)
    api.add_namespace(loan_ns)
    api.add_namespace(recommend_ns)
    api.add_namespace(search_ns)
