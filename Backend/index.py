from datetime import timedelta
from flask import session, request, make_response
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError, DataError, OperationalError
from db_config import *
from werkzeug.security import generate_password_hash, check_password_hash
from validation import *
from log import *
from flask_cors import CORS, cross_origin
from flask import send_from_directory
import os

app.secret_key = 'b9c0e27183b3460490a4f817c8436a98bccf3f4c8d6c4fa39456aa48263100cf'

app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=60)

admin_username = 'adminiano'
admin_password = 'scrypt:32768:8:1$lgXjch7A6l3YQ6JB$9d707bb9ba371dbe323c7808164525f8cddab86c0adc5974fec797dc9459e50f92d7370b062dc7613c64de3b0e48aec47fcdba4250bffae65583c2ffdb651bfa'
admin_id = 'e15912a12f0713468d1418c839a2c1f585ea1f86fc9e8f4f1705faf5cdac26a1'

# CORS(app)
CORS(app, supports_credentials=True ,origins=["http://127.0.0.1:5500"])
# run_cleanup_every_24h()


@app.route('/sign_up', methods=['POST'])
def sign_up():
    with app.app_context():
        try:
            cust = schema.load(request.get_json())
            # check if user exists in the db
            customer = Customer.query.filter(
                or_(
                    Customer.email == cust['email'],
                    Customer.phone_number == cust['phone_number']
                )
            ).first()

            if customer is None:
                cust['password'] = generate_password_hash(cust['password'])

                new_customer = Customer(
                    first_name=cust['first_name'],
                    last_name=cust['last_name'],
                    email=cust['email'],
                    password=cust['password'],
                    address=cust['address'],
                    phone_number=cust['phone_number'],
                    # balance=250.00  # Set default balance to $250.00
                )
                db.session.add(new_customer)
                db.session.commit()
                log_customer("create", new_customer.customer_id, "")
            else:
                raise IntegrityError(statement=None, params=None, orig="email or phone number already exists")

        except ValidationError as err:
            return {"err": err.messages}, 400
        except (DataError) as e:
            return {"err": "the data you entered is wrong "}, 400
        except (IntegrityError) as e:
            return {"err": "the data you entered already exists"}, 400

        except (OperationalError) as e:
            # Log the specific error for debugging
            print(f"Database operational error: {str(e)}")
            return {"err": f"Database connection error: {str(e)}"}, 500
        except Exception as e:
            # Log the specific error for debugging
            print(f"Unexpected error in signup: {str(e)}")
            return {"err": f"Internal server error: {str(e)}"}, 500

    resp = make_response({"success": True})
    return resp


@app.route('/login', methods=['POST'])
def login():
    cust = request.get_json()
    with app.app_context():
        try:
            # check if user exists in the db
            if cust['username'] == admin_username and check_password_hash(admin_password, cust.get('password')):
                session['admin'] = admin_id
                return {"success": "welcome admin"}

            customer = Customer.query.filter(
                or_(
                    Customer.email == cust['username'],
                    Customer.phone_number == cust['username']
                )
            ).first()

            if customer is None:
                return {"err": "the email or phone number you entered doesn't exists "}, 400
            else:
                hashed_password = customer.password
                # In the login function, modify the successful login response:
                if check_password_hash(hashed_password, cust.get('password')):
                    # Count purchased items

                    # Create response with user data
                    resp = make_response({
                        "success": "you logged in sucessfully",
                        "userData": {
                            "name": f"{customer.first_name} {customer.last_name}",
                            "balance": float(customer.balance),
                        }
                    })

                    session['online_market_id'] = customer.customer_id
                    session['online_market_email'] = customer.email

                    log_customer("login", customer.customer_id, "")
                    return resp
                else:
                    return {"err": "password is wrong"}, 400

        except (IntegrityError, DataError) as e:
            return {"err": "the email or phone number you entered doesn't exist"}, 400

        except (OperationalError, Exception) as e:
            return {"err": "internal server error"}, 500


@app.route('/logout', methods=['POST'])
def logout():
    if 'online_market_id' in session and 'online_market_email' in session:
        session.clear()
        return {"success": "you logged out successfully"}
    return {"err": "you are not logged in"}, 402


@app.route('/item/add', methods=['POST'])
def add_item():
    try:
        if 'online_market_id' in session and 'online_market_email' in session:
            cust = Customer.query.filter(
                Customer.email == session['online_market_email'],
            ).first()

            if (cust is None):
                session.clear()
                return {"err": "you are not authorized"}, 402
            else:

                product = validate_item.load(request.get_json())
                product["customer_id"] = cust.customer_id
                category = Category.query.get(product['category_id'])
                if not category:
                    return {"err": "the category you extered doesn't exist"}, 400

                new_product = Product(**product)

                db.session.add(new_product)
                db.session.commit()

                log_product("create", cust.customer_id, new_product.product_id, "")
                return {"success": "the product is added successfully"}
        else:
            return {"err": "you are not authorized"}, 402
    except ValidationError as err:
        return {"err": err.messages}, 400

    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err": "internal server error"}, 500


@app.route('/item', methods=['GET'])
def get_myitems():
    try:
        if 'online_market_id' in session and 'online_market_email' in session:
            cust = Customer.query.filter(
                Customer.email == session['online_market_email'],
            ).first()

            if cust is None:
                session.clear()
                return {"err": "you are not authorized"}, 402
            else:
                offset = request.args.get('offset', default=0, type=int)
                limit = request.args.get('limit', default=10, type=int)
                products = Product.query.filter_by(customer_id=cust.customer_id).offset(offset).limit(limit).all()
                products_data = []
                for prod in products:
                    products_data.append({
                        "product_id": prod.product_id,
                        "category_id": prod.category_id,
                        "product_name" : prod.product_name,
                        "category_name": prod.category.name,
                        "SKU": prod.SKU,
                        "description": prod.description,
                        "price": prod.price,
                        "stock": prod.stock
                    })

                return {"products": products_data}

        else:
            return {"err": "you are not authorized"}, 402
    except ValidationError as err:
        return {"err": err.messages}, 400

    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err": "internal server error"}, 500


@app.route('/item/edit', methods=['GET'])
def edit_item():
    try:
        if 'online_market_id' in session and 'online_market_email' in session:
            cust = Customer.query.filter(
                Customer.email == session['online_market_email'],
            ).first()

            if (cust is None):
                session.clear()
                return {"err": "you are not authorized"}, 402
            else:

                product = request.get_json()
                new_product = Product.query.get(product["product_id"])  # أو .filter_by(product_id=0).first()

                if new_product.customer_id == cust.customer_id:
                    log_product("update", cust.customer_id, new_product.product_id,
                                "previous price = " + str(new_product.price) + "new price = "
                                + str(product["price"]))
                    new_product.price = product["price"]
                    new_product.description = product["description"]
                    # new_product.stock = product["stock"]
                    # new_product.SKU = product["SKU"]
                    # new_product.category_id = product["category_id"]
                    db.session.commit()

                    return {"success": "the product is edited successfully"}
                else:
                    return {"err": "this is not your product"}, 404
        else:
            return {"err": "you are not authorized"}, 402
    except ValidationError as err:
        return {"err": err.messages}, 400

    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err": "internal server error"}, 500


@app.route('/item/search', methods=['GET'])
def search_item():
    try:
        if 'online_market_id' in session and 'online_market_email' in session:
            cust = Customer.query.filter(
                Customer.email == session['online_market_email'],
            ).first()

            if cust is None:
                session.clear()
                return {"err": "you are not authorized"} ,402
            else:
                offset = request.args.get('offset', default=0, type=int)
                limit = request.args.get('limit', default=10, type=int)
                search = request.args.get('search_text', default="")
                category_id = request.args.get('category_id', type=int ,default = -1)
                query = Product.query.join(Category, Product.category_id == Category.category_id)
                if category_id != -1 :
                    query = query.filter(Product.category_id == category_id )
                elif search:
                    search_filter = f"%{search}%"
                    query = query.filter(
                        or_(
                            Product.description.ilike(search_filter),
                            Product.SKU.ilike(search_filter),
                            Category.name.ilike(search_filter)
                        )
                    )

                products = query.offset(offset).limit(limit).all()
                # products = Product.query.filter_by().offset(offset).limit(limit).all()
                products_data = []
                for prod in products:
                    products_data.append({
                        "product_name": prod.product_name,
                        "product_id": prod.product_id,
                        "category_id": prod.category_id,
                        "category_name": prod.category.name,
                        "SKU": prod.SKU,
                        "description": prod.description,
                        "price": prod.price,
                        "stock": prod.stock
                    })

                return {"products": products_data}

        else:
            return {"err": "you are not authorized"}
    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err": "internal server error"}, 500


@app.route('/item/<int:product_id>', methods=['GET'])
def get_item(product_id):
    try:
        product = Product.query.get(product_id)
        if (product is None):
            return {"err": "product not found"}, 400
        else:
            category = Category.query.get(product.category_id)

            return {"product": {
                "product_id": product.product_id, "category_id": product.category_id,
                "category_name": category.name, "SKU": product.SKU,
                "description": product.description, "price": product.price,
                "stock": product.stock,

            }}
    except Exception as e:
        return {"err": "internal server error"}, 500

@app.route('/category', methods=['GET'])
def get_categories():
    try:

        categories = Category.query.filter_by().all()
        categories_data = []
        for category in categories:
            categories_data .append({
                "category_id": category.category_id,
                "name": category.name
            })

        return {"categories" : categories_data}

    except Exception as e:
        return {"err": "internal server error"}, 500


@app.route('/payment', methods=['POST'])
def handle_payment():
    try:
        if 'online_market_id' in session and 'online_market_email' in session:
            cust = Customer.query.filter(
                Customer.email == session['online_market_email'],
            ).first()

            if cust is None:
                session.clear()
                return {"err": "you are not authorized"}, 402
            else:
                data = request.get_json()
                # user = Customer.session.get(cust.customer_id)
                if data['type'] == "deposit":
                    # log_customer("deposit", user.customer_id, "deposit " + str(data['amount'])
                    #              + "previous balance = " + str(user.balance))
                    cust.balance += float(data['amount'])

                elif data['type'] == "withdraw":
                    # log_customer("withdraw", cust.customer_id, "withdraw " + str(data['amount'])
                    #              + "previous balance = " + str(cust.balance))
                    if cust.balance >= float(data['amount']):
                        cust.balance -= float(data['amount'])
                    else :
                        return {"err" : "your balance is not enough"} , 400
                else:
                    return {"err": "wrong request data"}, 403
                new_payment = Payment(
                    customer_id=cust.customer_id,
                    card_number=data['card_number'],
                    type=data['type'],
                    amount=data['amount']
                )

                db.session.add(new_payment)
                db.session.commit()
                return {"success": "your balance is updated successfully"}
        else:
            return {"err": "you are not authorized"}, 402

    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err": "internal server error"}, 500


@app.route('/report/customer', methods=['GET'])
def get_customer_report():
    try:
        if 'admin' in session and session['admin'] == admin_id:

            offset = request.args.get('offset', default=0, type=int)
            limit = request.args.get('limit', default=10, type=int)
            log_type = request.args.get('log_type', default="")

            return read_customer_last_logs(log_type, limit, offset)

        else:
            return {"err": "you are not authorized"}, 402
    except Exception as e:
        return {"err": "internal server error"}, 500


@app.route('/report/order', methods=['GET'])
def get_order_report():
    try:
        if 'admin' in session and session['admin'] == admin_id:

            offset = request.args.get('offset', default=0, type=int)
            limit = request.args.get('limit', default=10, type=int)
            log_type = request.args.get('log_type', default="")

            return read_customer_last_logs(log_type, limit, offset)

        else:
            return {"err": "you are not authorized"}, 402
    except Exception as e:
        return {"err": "internal server error"}, 500
#
# @app.route('/purchase/<int:product_id>', methods=['POST'])
# def purchase_item(product_id):
#     try:
#         if 'online_market_id' in session and 'online_market_email' in session:
#             buyer = Customer.query.filter(
#                 Customer.email == session['online_market_email'],
#             ).first()
#
#             if buyer is None:
#                 session.clear()
#                 return {"err": "you are not authorized"}, 402
#
#             # Get the product
#             product = Product.query.get(product_id)
#             if product is None:
#                 return {"err": "Product not found"}, 404
#
#             # Check if user is trying to buy their own product
#             if product.customer_id == buyer.customer_id:
#                 return {"err": "You cannot purchase your own product"}, 400
#
#             # Get the seller
#             seller = Customer.query.get(product.customer_id)
#             if seller is None:
#                 return {"err": "Seller not found"}, 404
#
#             # Check if product is in stock
#             if product.stock <= 0:
#                 return {"err": "Product is out of stock"}, 400
#
#             # Check if buyer has enough balance
#             price = float(product.price)
#             if buyer.balance < price:
#                 return {"err": "Insufficient balance"}, 400
#
#             # Create a new order
#             from datetime import date
#             new_order = Orders(
#                 customer_id=buyer.customer_id,
#                 order_date=date.today(),
#                 total_price=price
#             )
#             db.session.add(new_order)
#             db.session.flush()  # Get the order ID without committing
#
#             # Create order item
#             order_item = OrderItem(
#                 order_id=new_order.order_id,
#                 product_id=product.product_id,
#                 quantity=1,
#                 price=price
#             )
#             db.session.add(order_item)
#
#             # Create payment record
#             payment = Payment(
#                 customer_id=buyer.customer_id,
#                 order_id=new_order.order_id,
#                 payment_date=date.today(),
#                 payment_method="Account Balance",
#                 amount=price
#             )
#             db.session.add(payment)
#
#             # Transfer money from buyer to seller
#             buyer.balance -= price
#             seller.balance += price
#
#             # Transfer ownership of the product
#             product.customer_id = buyer.customer_id
#
#             # Decrement stock
#             product.stock -= 1
#
#             # Log the transaction
#             log_customer("purchase", buyer.customer_id, f"Purchased product {product_id} for {price}")
#             log_customer("sale", seller.customer_id, f"Sold product {product_id} for {price}")
#
#             # Commit all changes
#             db.session.commit()
#
#             return {"success": "Purchase completed successfully"}
#         else:
#             return {"err": "you are not authorized"}, 402
#
#     except (IntegrityError, DataError) as e:
#         db.session.rollback()
#         return {"err": "Data error occurred"}, 400
#     except Exception as e:
#         db.session.rollback()
#         return {"err": f"Internal server error: {str(e)}"}, 500

#
# @app.route('/user/profile', methods=['GET'])
# def get_user_profile():
#     try:
#         if 'online_market_id' in session and 'online_market_email' in session:
#             customer_id = session['online_market_id']
#             customer = Customer.query.get(customer_id)
#
#             if customer is None:
#                 session.clear()
#                 return {"err": "User not found"}, 404
#
#             # Get purchased items (products in completed orders with details)
#             purchased_items = db.session.query(
#                 Product.product_id,
#                 Product.description,
#                 Product.price,
#                 Category.name.label('category'),
#                 Orders.order_date
#             ).join(
#                 OrderItem, OrderItem.product_id == Product.product_id
#             ).join(
#                 Orders, Orders.order_id == OrderItem.order_id
#             ).join(
#                 Category, Category.category_id == Product.category_id
#             ).filter(
#                 Orders.customer_id == customer_id
#             ).all()
#
#             # Format purchased items
#             purchased_items_list = [{
#                 'product_id': item.product_id,
#                 'description': item.description,
#                 'price': float(item.price),
#                 'category': item.category,
#                 'purchase_date': item.order_date.strftime('%Y-%m-%d') if item.order_date else None
#             } for item in purchased_items]
#
#             # Get sold items (products that were once owned by this customer but now have a different owner)
#             sold_items = db.session.query(
#                 Product.product_id,
#                 Product.description,
#                 Product.price,
#                 Category.name.label('category'),
#                 Payment.payment_date.label('sale_date')
#             ).join(
#                 OrderItem, OrderItem.product_id == Product.product_id
#             ).join(
#                 Orders, Orders.order_id == OrderItem.order_id
#             ).join(
#                 Payment, Payment.order_id == Orders.order_id
#             ).join(
#                 Category, Category.category_id == Product.category_id
#             ).filter(
#                 Payment.customer_id != customer_id,  # Payment made by someone else
#                 Product.customer_id != customer_id  # Product now owned by someone else
#             ).all()
#
#             # Format sold items
#             sold_items_list = [{
#                 'product_id': item.product_id,
#                 'description': item.description,
#                 'price': float(item.price),
#                 'category': item.category,
#                 'sale_date': item.sale_date.strftime('%Y-%m-%d') if item.sale_date else None
#             } for item in sold_items]
#
#             # Get items yet to be sold (products currently owned by this customer with stock > 0)
#             items_to_sell = db.session.query(
#                 Product.product_id,
#                 Product.description,
#                 Product.price,
#                 Product.stock,
#                 Category.name.label('category')
#             ).join(
#                 Category, Category.category_id == Product.category_id
#             ).filter(
#                 Product.customer_id == customer_id,
#                 Product.stock > 0
#             ).all()
#
#             # Format items to sell
#             items_to_sell_list = [{
#                 'product_id': item.product_id,
#                 'description': item.description,
#                 'price': float(item.price),
#                 'stock': item.stock,
#                 'category': item.category
#             } for item in items_to_sell]
#
#             # Return user profile data with all requested information
#             return {
#                 "success": True,
#                 "profile": {
#                     "name": f"{customer.first_name} {customer.last_name}",
#                     "balance": float(customer.balance),
#                     "purchasedItems": purchased_items_list,
#                     "soldItems": sold_items_list,
#                     "itemsToSell": items_to_sell_list
#                 }
#             }
#         else:
#             return {"err": "Not authorized"}, 401
#     except Exception as e:
#         print(f"Error fetching user profile: {str(e)}")
#         return {"err": "Internal server error"}, 500


@app.route('/account/update', methods=['POST'])
def update_account():
    if 'online_market_id' not in session:
        return {"err": "you are not authorized"}, 402

    try:
        user = Customer.query.filter(
            Customer.customer_id == session['online_market_id'],
        ).first()
        if not user:
            session.clear()
            return {"err": "you are not authorized"}, 402

        data = request.get_json()

        # Update personal info
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.phone_number = data.get('phone_number', user.phone_number)

        # Optional: Change password
        current_pw = data.get('current_password')
        new_pw = data.get('new_password')
        confirm_pw = data.get('confirm_password')

        if current_pw and new_pw and confirm_pw:
            if not check_password_hash(user.password, current_pw):
                return {"err": "Current password is incorrect"}, 400
            if new_pw != confirm_pw:
                return {"err": "Passwords do not match"}, 400
            user.password = generate_password_hash(new_pw)

        db.session.commit()
        return {"success": "Account updated successfully"}

    except Exception as e:
        return {"err": "internal server error"}, 500


@app.route('/dashboard')
@cross_origin(supports_credentials=True, origins=["http://127.0.0.1:5500"])
def dashboard():
    if 'online_market_id' not in session:
        return {"err": "unauthorized"}, 401
    try:
        user = Customer.query.get(session['online_market_id'])
        if not user:
            return {"err": "user not found"}, 404

        return {
            "username": user.first_name,
            "balance": user.balance,
        }
    except Exception as e :
        return  {"err" : "interval server error"} , 500

app.run(debug=True)



