from flask_restx import Api
from .books import book_ns
from .libraries import library_ns
from .copies import copy_ns

def register_routes(api: Api):
    api.add_namespace(book_ns)
    api.add_namespace(library_ns)
    api.add_namespace(copy_ns)
