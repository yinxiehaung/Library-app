from  .extensions import db

class Users(db.Model):
    _id = db.Column('id',db.Integer, primary_key=True);
    name = db.Column('name', db.String(100),nullable=False)
    email = db.Column(db.String(100),unique=True,nullable=False)
    def __init__(self, name, email):
        self.name = name
        self.email = email
class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(255), nullable = False)
    isbn = db.Column(db.String(13), unique=True, nullable=False)
    author = db.Column(db.String(100), nullable=False)
    publication_date = db.Column(db.Date)
    publisher = db.Column(db.String(100))
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    language = db.Column(db.String(30))
    cover_image_url = db.Column(db.String(265))
    copies = db.relationship('BookCopy', backref = 'book', lazy = True)
class Library(db.Model):
    __tablename__ = 'libraries'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    address = db.Column(db.String(255))
    phone = db.Column(db.String(20))
class BookCopy(db.Model):
    __tablename__ = 'book_copies'
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    library_id = db.Column(db.Integer, db.ForeignKey('libraries.id'),nullable=False)
    call_number = db.Column(db.String(50))
    status = db.Column(db.Integer, nullable=False, default=0)


