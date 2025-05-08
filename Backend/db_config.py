
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:1234QWERa@localhost:5432/online_market'
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg2://market_user:1234QWERa@localhost:5432/online_market"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Add the reset database configuration here
app.config['RESET_DB_ON_START'] = True  # Set to False in production

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


class Cart(db.Model):
    __tablename__ = 'Cart'
    
    cart_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('Customer.customer_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('Product.product_id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    date_added = db.Column(db.Date)

class Wishlist(db.Model):
    __tablename__ = 'Wishlist'
    
    wishlist_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('Customer.customer_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('Product.product_id'), nullable=False)
    date_added = db.Column(db.Date)

class OrderItem(db.Model):
    __tablename__ = 'OrderItem'
    
    order_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('Orders.order_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('Product.product_id'), nullable=False)
    quantity = db.Column(db.Integer)
    price = db.Column(db.Numeric(4, 2))

# with app.app_context():
#     print("hello from server!")
    
#     if app.config['RESET_DB_ON_START']:
#         try:
#             # Check if any customers exist in the database
#             try:
#                 customer_count = Customer.query.count()
#                 data_exists = customer_count > 0
#             except Exception:
#                 # If we can't query, assume data exists to be safe
#                 data_exists = True
            
#             # If customers exist, drop all tables and recreate them
#             if data_exists:
#                 print("Existing data found in database. Dropping all tables...")
#                 # Close any existing sessions
#                 db.session.close()
#                 # Drop tables with more control - using proper text() function
#                 from sqlalchemy import text
#                 db.session.execute(text('SET CONSTRAINTS ALL DEFERRED'))
#                 db.drop_all()
#                 db.session.commit()
#                 print("All tables dropped successfully.")
#                 db.create_all()
#                 print("All tables recreated successfully.")
#             else:
#                 # Just create tables if they don't exist
#                 db.create_all()
#                 print("No existing data found. Tables created if they didn't exist.")
#         except Exception as e:
#             print(f"Error during database reset: {str(e)}")
#             # Close session to release any locks
#             db.session.close()
#             # Fallback to just creating tables
#             try:
#                 db.create_all()
#                 print("Tables created after error recovery.")
#             except Exception as create_error:
#                 print(f"Critical database error: {str(create_error)}")
#     else:
#         # In production mode, just ensure tables exist
#         db.create_all()
#         print("Production mode: Ensuring tables exist without dropping data.")