from datetime import timedelta
from flask import session , request,  make_response
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError , DataError , OperationalError
from db_config import *
from werkzeug.security import generate_password_hash, check_password_hash
from validation import *
from log import *
from flask_cors import CORS
app.secret_key = 'b9c0e27183b3460490a4f817c8436a98bccf3f4c8d6c4fa39456aa48263100cf'

app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=60)

admin_username = 'adminiano'
admin_password = 'scrypt:32768:8:1$lgXjch7A6l3YQ6JB$9d707bb9ba371dbe323c7808164525f8cddab86c0adc5974fec797dc9459e50f92d7370b062dc7613c64de3b0e48aec47fcdba4250bffae65583c2ffdb651bfa'
admin_id = 'e15912a12f0713468d1418c839a2c1f585ea1f86fc9e8f4f1705faf5cdac26a1'

CORS(app)

run_cleanup_every_24h()

@app.route('/sign_up', methods = ['POST'])
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
                        phone_number=cust['phone_number']
                    )
                    db.session.add(new_customer)
                    db.session.commit()
                    log_customer("create", new_customer.customer_id ,"")
                else :
                    raise IntegrityError(statement=None, params=None, orig="email or phone number already exists")

            except ValidationError as err:
                return {"err": err.messages}, 400
            except (DataError) as e:
                return {"err": "the data you entered is wrong "}, 400
            except (IntegrityError) as e:
                return {"err": "the data you entered already exists"}, 400

            except (OperationalError, Exception) as e:
                return {"err": "internal server error"}, 500

        resp = make_response({"success" : True})
        return resp

@app.route('/login', methods =['POST'])
def login():
        cust = request.get_json()
        with app.app_context():
            try:
                # check if user exists in the db
                if   cust['username'] == admin_username  and check_password_hash(admin_password, cust.get('password')):
                    session['admin'] = admin_id
                    return {"success" : "welcome admin"}

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
                    if check_password_hash(hashed_password, cust.get('password')):
                        resp = make_response({"success" : "you logged in sucessfully"})
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

@app.route('/logout', methods =['POST'])
def logout():
    if 'online_market_id' in session and 'online_market_email' in session:
        session.clear()
        return {"success":"you logged out successfully"}
    return {"err":"you are not logged in"},402

@app.route('/item/add', methods = ['POST'])
def add_item():
    try:
        if 'online_market_id' in session and 'online_market_email' in session:
            cust = Customer.query.filter(
                            Customer.email == session['online_market_email'],
                    ).first()

            if(cust is None):
                session.clear()
                return {"err":"you are not authorized"} , 402
            else:

                product = validate_item.load(request.get_json())
                product["customer_id"] = cust.customer_id
                category = Category.query.get(product['category_id'])
                if not category:
                    return {"err": "the category you extered doesn't exist"}, 400

                new_product = Product(**product)

                db.session.add(new_product)
                db.session.commit()

                log_product("create" ,cust.customer_id ,new_product.product_id , "")
                return {"success" : "the product is added successfully"}
        else:
            return {"err" : "you are not authorized"} , 402
    except ValidationError as err:
        return {"err": err.messages}, 400

    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err":"internal server error"},500

@app.route('/item/', methods = ['GET'])
def get_myitems():
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
                products = Product.query.filter_by(customer_id=cust.customer_id).offset(offset).limit(limit).all()
                products_data = []
                for prod in products :
                    products_data.append({
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
            return {"err": "you are not authorized"} , 402
    except ValidationError as err:
        return {"err": err.messages}, 400

    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err": "internal server error"}, 500

@app.route('/item/edit', methods = ['GET'])
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
                                "previous price = " +str(new_product.price) + "new price = "
                                + str(product["price"]))
                    new_product.price  = product["price"]
                    new_product.description = product["description"]
                    # new_product.stock = product["stock"]
                    # new_product.SKU = product["SKU"]
                    # new_product.category_id = product["category_id"]
                    db.session.commit()


                    return {"success": "the product is edited successfully"}
                else:
                    return{"err" : "this is not your product"}, 404
        else:
            return {"err": "you are not authorized"}, 402
    except ValidationError as err:
        return {"err": err.messages}, 400

    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err": "internal server error"}, 500

@app.route('/item/search', methods = ['GET'])
def search_item():
    try:
        if 'online_market_id' in session and 'online_market_email' in session:
            cust = Customer.query.filter(
                Customer.email == session['online_market_email'],
            ).first()

            if cust is None:
                session.clear()
                return {"err": "you are not authorized"}
            else:
                offset = request.args.get('offset', default=0, type=int)
                limit = request.args.get('limit', default=10, type=int)
                search = request.args.get('search_text', default="")

                query = Product.query.join(Category, Product.category_id == Category.category_id)
                if search:
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
                for prod in products :
                    products_data.append({
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

@app.route('/item/<int:product_id>', methods = ['GET'])
def get_item(product_id):
    try:
        product = Product.query.get(product_id)
        if(product is None):
            return {"err" : "product not found"} , 400
        else:
            category = Category.query.get(product.category_id)

            return {"product" : {
                "product_id" : product.product_id, "category_id" : product.category_id,
                "category_name" : category.name, "SKU" : product.SKU,
                "description" : product.description, "price" : product.price,
                "stock" : product.stock,

            }}
    except Exception as e :
        return {"err" : "internal server error"} , 500

@app.route('/payment/', methods=['POST'])
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
                user = Customer.query.get(cust.customer_id)
                if data['type'] == "deposit":
                    log_customer("deposit", user.customer_id, "deposit " + str(data['amount'])
                                 + "previous balance = " + str(user.balance))
                    user.balance += data['amount']

                elif data['type'] == "withdraw":
                    log_customer("withdraw", user.customer_id, "withdraw " + str(data['amount'])
                                 + "previous balance = " + str(user.balance))
                    user.balance -= data['amount']

                else :
                    return {"err" : "wrong request data"} , 403
                db.session.commit()
                return {"success": "your balance is updated successfully"}
        else:
            return {"err": "you are not authorized"}, 402

    except (IntegrityError, DataError) as e:
        return {"err": "the data you entered is wrong format"}, 400
    except Exception as e:
        return {"err": "internal server error"}, 500

@app.route('/report/customer' , methods = ['GET'])
def get_customer_report():
    try:
        if 'admin' in session and session['admin'] == admin_id :

            offset = request.args.get('offset', default=0, type=int)
            limit = request.args.get('limit', default=10, type=int)
            log_type = request.args.get('log_type', default="")

            return read_customer_last_logs(log_type, limit, offset)

        else:
            return {"err": "you are not authorized"}, 402
    except Exception as e:
        return {"err": "internal server error"}, 500

@app.route('/report/order' , methods = ['GET'])
def get_order_report():
    try:
        if 'admin' in session and session['admin'] == admin_id :

            offset = request.args.get('offset', default=0, type=int)
            limit = request.args.get('limit', default=10, type=int)
            log_type = request.args.get('log_type', default="")

            return read_customer_last_logs(log_type, limit, offset)

        else:
            return {"err": "you are not authorized"}, 402
    except Exception as e:
        return {"err": "internal server error"}, 500

app.run(debug = True)

#deposit report [number of deposits
#withdraw report
#order report
#products report
#USER of id 78678 added product of id 875765 ay 987
#order of id 654654 was made at 2020

#get items of a category
#get customer info
# edit customer account
