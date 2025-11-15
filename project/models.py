from  .extensions import db
from datetime import datetime
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    #name = db.Column('name', db.String(100),nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(100),unique=True,nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    def __repr__(self):
        return f'<User {self.username}>' 
class Loan(db.Model):
    __tablename__ = 'loans'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_title=db.Column(db.String(255),nullable=False)
    book_isbn=db.Column(db.String(20))
    loan_date=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    return_date=db.Column(db.DateTime)
    user = db.relationship('User',backref=db.backref('loans',lazy=True))

