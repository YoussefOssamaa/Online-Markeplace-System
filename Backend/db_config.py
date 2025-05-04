
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:1234QWERa@localhost:5432/online_market'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Customer(db.Model):
    __tablename__ = 'Customer'

    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(15))
    last_name = db.Column(db.String(15))
    email = db.Column(db.String(30) , unique=True)
    password = db.Column(db.String(256))
    address = db.Column(db.String(40))
    phone_number = db.Column(db.String(15) , unique=True)
    balance = db.Column(db.Float ,default=0)

    orders = db.relationship('Orders', backref='customer', lazy=True)
    payments = db.relationship('Payment', backref='customer', lazy=True)
    products = db.relationship('Product', backref='customer', lazy=True)
    cart_items = db.relationship('Cart', backref='customer', lazy=True)
    wishlist_items = db.relationship('Wishlist', backref='customer', lazy=True)

class Orders(db.Model):
    __tablename__ = 'Orders'

    order_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('Customer.customer_id'), nullable=False)
    order_date = db.Column(db.Date)
    total_price = db.Column(db.Numeric(5, 2))

    items = db.relationship('OrderItem', backref='order', lazy=True)
    payments = db.relationship('Payment', backref='order', lazy=True)

class Payment(db.Model):
    __tablename__ = 'Payment'

    payment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('Customer.customer_id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('Orders.order_id'), nullable=False)
    payment_date = db.Column(db.Date)
    payment_method = db.Column(db.String(20))
    amount = db.Column(db.Numeric(5, 2))

class Category(db.Model):
    __tablename__ = 'Category'

    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(20))

    products = db.relationship('Product', backref='category', lazy=True)

class Product(db.Model):
    __tablename__ = 'Product'

    product_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_id = db.Column(db.Integer, db.ForeignKey('Category.category_id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('Customer.customer_id'), nullable=False)
    SKU = db.Column(db.String(12))
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Numeric(4, 2))
    stock = db.Column(db.Integer)

    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    cart_items = db.relationship('Cart', backref='product', lazy=True)
    wishlist_items = db.relationship('Wishlist', backref='product', lazy=True)

with app.app_context():
    db.drop_all()
    db.create_all()