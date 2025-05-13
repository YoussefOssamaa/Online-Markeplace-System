CREATE EXTENSION IF NOT EXISTS citus;


CREATE TABLE Category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);
SELECT create_reference_table('Category');


CREATE TABLE Customer (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(15) NOT NULL,
    last_name VARCHAR(15) NOT NULL,
    email VARCHAR(30) NOT NULL,
    password VARCHAR(256) NOT NULL,
    address VARCHAR(40) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    balance FLOAT DEFAULT 0 NOT NULL
);
SELECT create_distributed_table('Customer', 'customer_id');


CREATE TABLE Product (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR NOT NULL,
    category_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    SKU VARCHAR(12),
    description TEXT NOT NULL,
    price NUMERIC(4,2) NOT NULL,
    stock INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Category(category_id),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);
SELECT create_distributed_table('Product', 'product_id');


CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY ,
    customer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    order_date DATE NOT NULL,
    total_price NUMERIC(5,2) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (seller_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

SELECT create_distributed_table('Orders', 'customer_id');


CREATE TABLE Payment (
    payment_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    card_number VARCHAR(20),
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(5,2) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);
SELECT create_distributed_table('Payment', 'customer_id');
