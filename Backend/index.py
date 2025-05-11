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
from datetime import date
from sqlalchemy.sql import func
from sqlalchemy.exc import IntegrityError, DataError

app.secret_key = 'b9c0e27183b3460490a4f817c8436a98bccf3f4c8d6c4fa39456aa48263100cf'

app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=60)

admin_username = 'adminiano'
admin_password = 'scrypt:32768:8:1$lgXjch7A6l3YQ6JB$9d707bb9ba371dbe323c7808164525f8cddab86c0adc5974fec797dc9459e50f92d7370b062dc7613c64de3b0e48aec47fcdba4250bffae65583c2ffdb651bfa'
admin_id = 'e15912a12f0713468d1418c839a2c1f585ea1f86fc9e8f4f1705faf5cdac26a1'

# CORS(app)
CORS(app, supports_credentials=True ,resources={r"/*": {"origins": "*"}})


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
            if customer:
                return {"err": "Email or phone number already exists"}, 400
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
    try:
        cust = request.get_json()
        if cust.get('email') == admin_username and check_password_hash(admin_password, cust.get('password')):
            session['admin'] = admin_id
            return {"success": "Welcome admin"}
        customer = Customer.query.filter(
            or_(
                Customer.email == cust.get('email'),
                Customer.phone_number == cust.get('email')
            )
        ).first()
        if not customer:
            return {"err": "Email or phone number not found"}, 400
        if not check_password_hash(customer.password, cust.get('password')):
            return {"err": "Incorrect password"}, 400
        session['online_market_id'] = customer.customer_id
        session['online_market_email'] = customer.email
        log_customer("login", customer.customer_id, "")
        return {
            "success": "Logged in successfully",
            "userData": {
                "name": f"{customer.first_name} {customer.last_name}",
                "balance": float(customer.balance)
            }
        }
    except DataError:
        return {"err": "Invalid data format"}, 400
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {"err": f"Internal server error: {str(e)}"}, 500

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
                category_id = product['category_id']
                print(f"Received category_id: {category_id}")
                category = Category.query.get(category_id)
                print(f"Category query result: {category}")
                if not category:
                    return {"err": "the category you entered doesn't exist"}, 400

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
        return {"err": f"Internal server error: {str(e)}"}, 500


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
                item_type = request.args.get('type', default=None)
                
                # Default behavior - return items for sale by the current user
                if item_type is None:
                    products = Product.query.filter_by(customer_id=cust.customer_id, is_active=True).offset(offset).limit(limit).all()
                    products_data = []
                    for prod in products:
                        products_data.append({
                            "product_id": prod.product_id,
                            "category_id": prod.category_id,
                            "product_name": prod.product_name,
                            "category_name": prod.category.name,
                            "sku": prod.sku,
                            "description": prod.description,
                            "price": prod.price,
                            "stock": prod.stock
                        })
                    return {"products": products_data}
                
                # Return purchased items
                elif item_type == 'purchased':
                    # Get products that the user has purchased with the actual purchased quantity and price
                    purchased_items_query = db.session.query(
                        Product.product_id,
                        Product.category_id,
                        Product.product_name,
                        Product.sku,
                        Product.description,
                        Orders.total_price,
                        func.sum(Orders.quantity).label('total_quantity'),
                        Orders.seller_id
                    ).join(
                        Orders, Orders.product_id == Product.product_id
                    ).filter(
                        Orders.customer_id == cust.customer_id,
                        Orders.seller_id != cust.customer_id
                    ).group_by(
                        Product.product_id,
                        Product.category_id,
                        Product.product_name,
                        Product.sku,
                        Product.description,
                        Orders.total_price,
                        Orders.seller_id
                    ).offset(offset).limit(limit).all()
                    
                    products_data = []
                    for item in purchased_items_query:
                        category = Category.query.get(item[1])
                        seller = Customer.query.get(item[7])
                        seller_name = f"{seller.first_name} {seller.last_name}" if seller else "Unknown"
                        products_data.append({
                            "product_id": item[0],
                            "category_id": item[1],
                            "product_name": item[2],
                            "category_name": category.name if category else "",
                            "sku": item[3],
                            "description": item[4],
                            "price": float(item[5]),  # Use the price from Orders
                            "stock": int(item[6]),  # This is the sum of all purchased quantities
                            "seller_name": seller_name
                        })
                    return {"products": products_data}
                
                # Return sold items
                elif item_type == 'sold':
                    # Get products that the user has sold with the actual sold quantity and price
                    sold_items = db.session.query(
                        Product,
                        db.func.sum(Orders.quantity).label('sold_quantity'),
                        Orders.order_date,
                        Orders.total_price,
                        Orders.customer_id
                    ).join(
                        Orders, Orders.product_id == Product.product_id
                    ).filter(
                        Orders.seller_id == cust.customer_id,
                        Orders.customer_id != cust.customer_id
                    ).group_by(Product.product_id, Orders.order_date, Orders.total_price, Orders.customer_id).offset(offset).limit(limit).all()
                    
                    products_data = []
                    for item in sold_items:
                        prod = item[0]  # Product object
                        sold_quantity = item[1]  # Sum of quantities from Orders
                        order_date = item[2]  # Order date
                        total_price = item[3]  # Total price from Orders
                        buyer = Customer.query.get(item[4])
                        buyer_name = f"{buyer.first_name} {buyer.last_name}" if buyer else "Unknown"
                        products_data.append({
                            "product_id": prod.product_id,
                            "category_id": prod.category_id,
                            "product_name": prod.product_name,
                            "category_name": prod.category.name,
                            "sku": prod.sku,
                            "description": prod.description,
                            "price": float(total_price) / float(sold_quantity),  # Calculate price per unit from total
                            "stock": sold_quantity,  # Use the summed sold quantity
                            "order_date": order_date.strftime('%Y-%m-%d') if order_date else None,
                            "total_price": float(total_price),  # Total price of the order
                            "buyer_name": buyer_name
                        })
                    return {"products": products_data}
                
                # Return my products
                elif item_type == 'my':
                    products = Product.query.filter_by(customer_id=cust.customer_id, is_active=True).offset(offset).limit(limit).all()
                    products_data = []
                    for prod in products:
                        products_data.append({
                            "product_id": prod.product_id,
                            "category_id": prod.category_id,
                            "product_name": prod.product_name,
                            "category_name": prod.category.name,
                            "sku": prod.sku,
                            "description": prod.description,
                            "price": prod.price,
                            "stock": prod.stock
                        })
                    return {"products": products_data}
                
                else:
                    return {"err": "Invalid item type"}, 400

        else:
            return {"err": "you are not authorized"}, 402
    except ValidationError as err:
        return {"err": err.messages}, 400

    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err": f"Internal server error: {str(e)}"}, 500


@app.route('/item/edit', methods=['POST'])
def edit_item():
    try:
        if 'online_market_id' in session and 'online_market_email' in session:
            cust = Customer.query.filter(
                Customer.email == session['online_market_email'],
            ).first()

            if (cust is None):
                session.clear()
                return {"err": "you are not authorized"}, 402
            
            product_data = request.get_json()
            if not product_data or 'product_id' not in product_data:
                return {"err": "invalid request data"}, 400

            new_product = Product.query.get(product_data["product_id"])
            if not new_product:
                return {"err": "product not found"}, 404

            if new_product.customer_id == cust.customer_id:
                    log_message = f"previous values: price = {new_product.price}"
                    
                    # Update product fields if provided
                    if 'price' in product_data:
                        new_product.price = product_data["price"]
                    if 'description' in product_data:
                        new_product.description = product_data["description"]
                    if 'stock' in product_data:
                        log_message += f", stock = {new_product.stock}"
                        new_product.stock = product_data["stock"]
                    if 'product_name' in product_data:
                        new_product.product_name = product_data["product_name"]
                    if 'sku' in product_data:
                        new_product.sku = product_data["sku"]
                    if 'category_id' in product_data:
                        new_product.category_id = product_data["category_id"]
                    
                    log_product("update", cust.customer_id, new_product.product_id, log_message)
                    db.session.commit()

                    return {"success": "the product is edited successfully"}
            else:
                    return {"err": "this is not your product"}, 403
        else:
            return {"err": "you are not authorized"}, 402
    except ValidationError as err:
        return {"err": err.messages}, 400

    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err": f"internal server error: {str(e)}"}, 500

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
                query = Product.query.join(Category, Product.category_id == Category.category_id)\
                    .join(Customer, Product.customer_id == Customer.customer_id)
                
                if search:
                    query = query.filter(Product.product_name.ilike(f'%{search}%'))
                if category_id != -1:
                    query = query.filter(Product.category_id == category_id)
                # Filter out removed products
                query = query.filter(Product.is_active == True)
                
                products = query.offset(offset).limit(limit).all()
                products_data = []
                for prod in products:
                    seller = Customer.query.get(prod.customer_id)
                    seller_name = f"{seller.first_name} {seller.last_name}" if seller else "Unknown"
                    products_data.append({
                        "product_id": prod.product_id,
                        "category_id": prod.category_id,
                        "product_name": prod.product_name,
                        "category_name": prod.category.name,
                        "description": prod.description,
                        "price": prod.price,
                        "stock": prod.stock,
                        "seller_name": seller_name
                    })
                return {"products": products_data}
        else:
            return {"err": "you are not authorized"}, 402
    except Exception as e:
        return {"err": f"Internal server error: {str(e)}"}, 500


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
                "category_name": category.name, "sku": product.sku,
                "description": product.description, "price": product.price,
                "stock": product.stock,

            }}
    except Exception as e:
        return {"err": f"Internal server error: {str(e)}"}, 500

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
        return {"err": f"Internal server error: {str(e)}"}, 500


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
                if data['type'] == "deposit":
                    cust.balance += float(data['amount'])

                elif data['type'] == "withdraw":
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
        return {"err": f"Internal server error: {str(e)}"}, 500


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
        return {"err": f"Internal server error: {str(e)}"}, 500


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
        return {"err": f"Internal server error: {str(e)}"}, 500


@app.route('/purchase', methods=['POST'])
def purchase_item():
    try:
        if 'online_market_id' in session and 'online_market_email' in session:
            buyer = Customer.query.filter(
                Customer.email == session['online_market_email'],
            ).first()

            if buyer is None:
                session.clear()
                return {"err": "you are not authorized"}, 402

            data = request.get_json()
            product_id = data.get('product_id')
            quantity = int(data.get('stock', 1))

            # Get the product
            product = Product.query.get(product_id)
            if product is None:
                return {"err": "Product not found"}, 404

            # Check if user is trying to buy their own product
            if product.customer_id == buyer.customer_id:
                return {"err": "You cannot purchase your own product"}, 400

            # Get the seller
            seller = Customer.query.get(product.customer_id)
            if seller is None:
                return {"err": "Seller not found"}, 404

            # Check if product has enough stock
            if product.stock < quantity:
                return {"err": "Not enough stock available"}, 400

            # Calculate total price
            total_price = float(product.price) * quantity
            
            # Check if buyer has enough balance
            if buyer.balance < total_price:
                return {"err": "Insufficient balance"}, 400

            # Create a new order
            new_order = Orders(
                customer_id=buyer.customer_id,
                seller_id=seller.customer_id,
                product_id=product.product_id,
                quantity=quantity,
                order_date=date.today(),
                total_price=total_price
            )
            db.session.add(new_order)
            db.session.flush()  # Get the order ID without committing

            # Create order item
            order_item = OrderItem(
                order_id=new_order.order_id,
                product_id=product.product_id,
                quantity=quantity,
                price=total_price
            )
            db.session.add(order_item)

            # Create payment record
            payment = Payment(
                customer_id=buyer.customer_id,
                payment_date=date.today(),
                card_number="Account Balance",
                type="purchase",
                amount=total_price
            )
            db.session.add(payment)

            # Transfer money from buyer to seller
            buyer.balance -= total_price
            seller.balance += total_price

            # Update product stock (don't transfer ownership, just reduce stock)
            product.stock -= quantity

            # Commit all changes
            db.session.commit()

            return {"success": "Purchase completed successfully"}
        else:
            return {"err": "you are not authorized"}, 402

    except (IntegrityError, DataError) as e:
        db.session.rollback()
        return {"err": f"Data error occurred: {str(e)}"}, 400  # Added error details for debugging
    except Exception as e:
        db.session.rollback()
        return {"err": f"Internal server error: {str(e)}"}, 500



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
        return {"err": f"Internal server error: {str(e)}"}, 500


@app.route('/dashboard')
@cross_origin(supports_credentials=True, origins=["http://127.0.0.1:5500", "http://127.0.0.1:5501"])
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

def reset_categories():
    from db_config import db, Category
    try:
        # Delete all existing categories
        Category.query.delete()
        db.session.commit()

        # Add only the three categories
        categories = [
            {"name": "Electronics"},
            {"name": "Clothes"},
            {"name": "Accessories"}
        ]
        for category_data in categories:
            new_category = Category(name=category_data["name"])
            db.session.add(new_category)
        db.session.commit()
        return {"message": "Categories initialized successfully", "categories": categories}
    except Exception as e:
        db.session.rollback()
        return {"err": f"Failed to initialize categories: {str(e)}"}, 500

@app.route('/initialize_categories', methods=['POST'])
def initialize_categories():
    return reset_categories()


@app.route('/item/remove', methods=['POST'])
def remove_item():
    try:
        if 'online_market_id' in session and 'online_market_email' in session:
            cust = Customer.query.filter(
                Customer.email == session['online_market_email'],
            ).first()

            if cust is None:
                session.clear()
                return {"err": "you are not authorized"}, 402

            product_data = request.get_json()
            if not product_data or 'product_id' not in product_data:
                return {"err": "invalid request data"}, 400

            product = Product.query.get(product_data["product_id"])
            if not product:
                return {"err": "product not found"}, 404

            if product.customer_id == cust.customer_id:
                product.is_active = False
                log_product("remove", cust.customer_id, product.product_id, "Product removed from marketplace")
                db.session.commit()
                return {"success": "the product is removed from marketplace successfully"}
            else:
                return {"err": "this is not your product"}, 403
        else:
            return {"err": "you are not authorized"}, 402
    except Exception as e:
        return {"err": f"Internal server error: {str(e)}"}, 500


@app.route('/payment', methods=['GET'])
def get_payments():
    if 'online_market_id' not in session:
        return {"err": "you are not authorized"}, 402
    try:
        cust = Customer.query.get(session['online_market_id'])
        if not cust:
            session.clear()
            return {"err": "you are not authorized"}, 402

        payment_type = request.args.get('type')
        query = Payment.query.filter_by(customer_id=cust.customer_id)
        if payment_type in ['deposit', 'withdraw']:
            query = query.filter_by(type=payment_type)
        payments = query.order_by(Payment.payment_date.desc()).all()
        data = [
            {
                "amount": float(p.amount),
                "card_number": p.card_number,
                "date": p.payment_date.strftime('%Y-%m-%d'),
                "type": p.type
            }
            for p in payments
        ]
        return {"payments": data}
    except Exception as e:
        return {"err": f"Internal server error: {str(e)}"}, 500


if __name__ == "__main__":
    with app.app_context():
        print(reset_categories())
    app.run(debug=True)


