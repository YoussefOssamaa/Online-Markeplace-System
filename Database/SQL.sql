CREATE DATABASE online_market;
USE online_market;
CREATE TABLE Customer(
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(15) NOT NULL,
    last_name VARCHAR(15) NOT NULL,
    email VARCHAR(30) NOT NULL,
    password VARCHAR(10) NOT NULL,
    address VARCHAR(40) NOT NULL,
    phone_number VARCHAR(15) NOT NULL
);
CREATE TABLE Shipment (
    shipment_id INT PRIMARY KEY,
    shipment_date DATE NOT NULL,
    address VARCHAR(40) NOT NULL,
    city VARCHAR(20) NOT NULL,
    country VARCHAR(30) NOT NULL
);
CREATE TABLE Orders (
    order_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    shipment_id INT NOT NULL,
    order_date DATE NOT NULL,
    total_price DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (shipment_id) REFERENCES Shipment(shipment_id)
);
CREATE TABLE Payment (
    payment_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_id INT NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    amount DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);
CREATE TABLE Category (
    category_id INT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);
CREATE TABLE Product (
    product_id INT PRIMARY KEY,
    category_id INT NOT NULL,
    customer_id INT NOT NULL,
    SKU VARCHAR(12) NOT NULL,
    description TEXT,
    price DECIMAL(4, 2) NOT NULL,
    stock INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Category(category_id),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);
CREATE TABLE Order_Item (
    order_item_id INT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(4, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);
CREATE TABLE Cart (
    cart_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);
CREATE TABLE Wishlist (
    wishlist_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);
