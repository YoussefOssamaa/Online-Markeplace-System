
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import date

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:1234QWERa@localhost:5432/online_market'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Customer(db.Model):
    __tablename__ = 'Customer'

    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(15))
    last_name = db.Column(db.String(15))
    email = db.Column(db.String(30), unique=True)
    password = db.Column(db.String(256))
    address = db.Column(db.String(40))
    phone_number = db.Column(db.String(15), unique=True)
    balance = db.Column(db.Float, default=0)

    orders = db.relationship('Orders', backref='customer', lazy=True)
    payments = db.relationship('Payment', backref='customer', lazy=True)
    products = db.relationship('Product', backref='customer', lazy=True)
    # cart_items = db.relationship('Cart', backref='customer', lazy=True)

class Orders(db.Model):
    __tablename__ = 'Orders'

    order_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('Customer.customer_id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('Customer.customer_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('Product.product_id'), nullable=False)
    quantity = db.Column(db.Integer)
    order_date = db.Column(db.Date)
    total_price = db.Column(db.Numeric(5, 2))

    items = db.relationship('OrderItem', backref='order', lazy=True)

class Payment(db.Model):
    __tablename__ = 'Payment'

    payment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('Customer.customer_id'), nullable=False)
    payment_date = db.Column(db.Date, default=date.today)
    card_number = db.Column(db.String(20))
    type = db.Column(db.String(20))
    amount = db.Column(db.Numeric(5, 2))

class Category(db.Model):
    __tablename__ = 'Category'

    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(20))

    products = db.relationship('Product', backref='category', lazy=True)

class Product(db.Model):
    __tablename__ = 'Product'

    product_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_name = db.Column(db.String())
    category_id = db.Column(db.Integer, db.ForeignKey('Category.category_id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('Customer.customer_id'), nullable=False)
    SKU = db.Column(db.String(12))
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Numeric(4, 2))
    stock = db.Column(db.Integer)

    order_items = db.relationship('Orders', backref='product', lazy=True)
    # cart_items = db.relationship('Cart', backref='product', lazy=True)
#
# class Cart(db.Model):
#     __tablename__ = 'Cart'
#
#     cart_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     customer_id = db.Column(db.Integer, db.ForeignKey('Customer.customer_id'), nullable=False)
#     product_id = db.Column(db.Integer, db.ForeignKey('Product.product_id'), nullable=False)
#     quantity = db.Column(db.Integer, default=1)
#     date_added = db.Column(db.Date)
#
# class OrderItem(db.Model):
#     __tablename__ = 'OrderItem'
#
#     order_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     order_id = db.Column(db.Integer, db.ForeignKey('Orders.order_id'), nullable=False)
#     product_id = db.Column(db.Integer, db.ForeignKey('Product.product_id'), nullable=False)
#     quantity = db.Column(db.Integer)
#     price = db.Column(db.Numeric(4, 2))
#
# with app.app_context():
#     db.drop_all()
#     db.create_all()