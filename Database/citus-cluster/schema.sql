-- schema.sql
-- Ensure the Citus extension is enabled
CREATE EXTENSION IF NOT EXISTS citus;

-- Category (reference table)
CREATE TABLE Category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);
SELECT create_reference_table('Category');

-- Customer (distributed table)
CREATE TABLE Customer (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(15) NOT NULL,
    last_name VARCHAR(15) NOT NULL,
    email VARCHAR(30) NOT NULL, -- UNIQUE removed due to Citus limitation
    password VARCHAR(256) NOT NULL,
    address VARCHAR(40),
    phone_number VARCHAR(15) NOT NULL, -- UNIQUE removed due to Citus limitation
    balance FLOAT DEFAULT 0
);
SELECT create_distributed_table('Customer', 'customer_id');

-- Product (distributed table)
CREATE TABLE Product (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR NOT NULL,
    category_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    SKU VARCHAR(12),
    description TEXT NOT NULL,
    price NUMERIC(4,2) NOT NULL,
    stock INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
    -- FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) removed
);
SELECT create_distributed_table('Product', 'product_id');


CREATE TABLE Orders (
    order_id SERIAL,
    customer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    order_date DATE NOT NULL,
    total_price NUMERIC(5,2) NOT NULL,
    PRIMARY KEY (order_id, customer_id)
);

SELECT create_distributed_table('Orders', 'customer_id');

-- Payment (distributed table)
CREATE TABLE Payment (
    payment_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    card_number VARCHAR(20),
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(5,2) NOT NULL
    -- FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) removed
);
SELECT create_distributed_table('Payment', 'payment_id');

-- OrderItem (distributed table)
CREATE TABLE OrderItem (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(4,2) NOT NULL
    -- FOREIGN KEY (order_id) REFERENCES Orders(order_id) removed
    -- FOREIGN KEY (product_id) REFERENCES Product(product_id) removed
);
SELECT create_distributed_table('OrderItem', 'order_item_id');

-- Cart (distributed table)
CREATE TABLE Cart (
    cart_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    date_added DATE NOT NULL DEFAULT CURRENT_DATE
    -- FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) removed
    -- FOREIGN KEY (product_id) REFERENCES Product(product_id) removed
);
SELECT create_distributed_table('Cart', 'cart_id');
