from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import date

app = Flask(__name__)

# Update connection string to connect to Citus Docker container
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:postgres@localhost:5433/online_market'
#app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg2://market_user:1234QWERa@localhost:5432/online_market"
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:postgres@localhost:5432/online_market'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:%20@localhost:5432/online_market'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Customer(db.Model):
    __tablename__ = 'customer'
    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(15), nullable=False)
    last_name = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(30), nullable=False, unique=True)
    password = db.Column(db.String(256), nullable=False)
    address = db.Column(db.String(40))
    phone_number = db.Column(db.String(15), nullable=False, unique=True)
    balance = db.Column(db.Float, default=0)
    
    # Note: In Citus, use viewonly=True for relationships that cross distribution boundaries
    # This ensures SQLAlchemy doesn't try to automatically join across shards
    orders = db.relationship('Orders', backref='customer', lazy=True, 
                           foreign_keys="Orders.customer_id", viewonly=True)
    sold_orders = db.relationship('Orders', backref='seller', lazy=True, 
                                foreign_keys="Orders.seller_id", viewonly=True)
    payments = db.relationship('Payment', backref='customer', lazy=True, viewonly=True)
    products = db.relationship('Product', backref='customer', lazy=True, viewonly=True)
    cart_items = db.relationship('Cart', backref='customer', lazy=True, viewonly=True)


class Orders(db.Model):
    __tablename__ = 'orders'
    order_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    order_date = db.Column(db.Date, nullable=False)
    total_price = db.Column(db.Numeric(5, 2), nullable=False)
    
    # For Citus, use viewonly=True for relationships that cross shards
    items = db.relationship('OrderItem', backref='order', lazy=True, viewonly=True)
    product = db.relationship('Product', foreign_keys=[product_id], backref='orders', lazy=True, viewonly=True)


class Payment(db.Model):
    __tablename__ = 'payment'
    payment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'), nullable=False)
    payment_date = db.Column(db.Date, default=date.today, nullable=False)
    card_number = db.Column(db.String(20))
    type = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Numeric(5, 2), nullable=False)


class Category(db.Model):
    __tablename__ = 'category'
    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(20), nullable=False)
    
    # For reference tables in Citus, relationships can be normal
    products = db.relationship('Product', backref='category', lazy=True)


class Product(db.Model):
    __tablename__ = 'product'
    product_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_name = db.Column(db.String, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.category_id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'), nullable=False)
    SKU = db.Column(db.String(12))
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Numeric(4, 2), nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    
    # Use viewonly=True for cross-shard relationships in Citus
    order_items = db.relationship('OrderItem', backref='product', lazy=True, viewonly=True)
    cart_items = db.relationship('Cart', backref='product', lazy=True, viewonly=True)


class Cart(db.Model):
    __tablename__ = 'cart'
    cart_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    date_added = db.Column(db.Date, default=date.today, nullable=False)


class OrderItem(db.Model):
    __tablename__ = 'orderitem'
    order_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(4, 2), nullable=False)

# Uncomment if you need to recreate the tables
# with app.app_context():
#     db.drop_all()
#     db.create_all()