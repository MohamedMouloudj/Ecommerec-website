-- SQLite Database Schema for ecommerce_db

PRAGMA foreign_keys = ON;

-- Table: client
CREATE TABLE client (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(100),
    phone INTEGER,
    isAdmin INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(20) NOT NULL DEFAULT ''
);

-- Table: category
CREATE TABLE category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(20) NOT NULL
);

-- Table: product
CREATE TABLE product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL,
    brand VARCHAR(20) NOT NULL,
    price DECIMAL(7,2) NOT NULL,
    discount DECIMAL(5,2) NOT NULL,
    description VARCHAR(300) NOT NULL,
    weight DECIMAL(7,2) NOT NULL,
    tags VARCHAR(100) NOT NULL,
    categoryId INTEGER NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES category(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: cart
CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status VARCHAR(10) NOT NULL DEFAULT 'active',
    checkoutDate DATETIME,
    clientId INTEGER NOT NULL,
    FOREIGN KEY (clientId) REFERENCES client(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: cartitem
CREATE TABLE cartitem (
    cartId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (cartId) REFERENCES cart(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (cartId, productId)
);

-- Table: orders
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER NOT NULL,
    orderDate DATETIME NOT NULL,
    totalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    FOREIGN KEY (clientId) REFERENCES client(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: orderitem
CREATE TABLE orderitem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    orderId INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: dimensions
CREATE TABLE dimensions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    length INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    FOREIGN KEY (productId) REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: productimage
CREATE TABLE productimage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url VARCHAR(300) NOT NULL,
    productId INTEGER NOT NULL,
    isThumbnail INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (productId) REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Insert sample data

-- Insert categories first (will get IDs 1, 2)
INSERT INTO category (name) VALUES ('Laptops'), ('Smartphones');

-- Insert clients (will get IDs 1, 2, 3, 4)
INSERT INTO client (name, email, password, isAdmin, category) VALUES 
('Mohamed', 'mouloudj.mohamed.04@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$MTQ3TGxDVUlyVnJRNVk3bQ$PEQfHtCWl1UuqrTOwx0Sf6qLQytd7DCXaPyc4HbcF+k', 1, ''),
('Mohamed', 'mohamedmdj6565@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$d2V0bXNJcmFJV05OVXJiNQ$ZzwkLCTnOLPvdD7V4mj0hLICjAPpGr0jKrOk3i80AOk', 0, ''),
('Mohamed', 'mouloudj@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$T2tOelZRaFFUWkx0YWxxUw$jJR3BQsM5OlGBZVfaVBWxze2aPvcT8qhhvqqN8+G3Ec', 0, ''),
('Mohamed', 'mouloudj123@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$bWQvTGpJaGVQSlhFemJlZg$WJ4E1aVDRU70uG35Yjp1RoE3wS82Pv0UbTOeLpPWLN0', 0, '');

-- Insert carts (will get IDs 1, 2, 3, 4)
INSERT INTO cart (status, clientId) VALUES 
('active', 1),
('active', 2),
('active', 3),
('active', 4);

-- Insert products (will get IDs 1, 2, 3)
INSERT INTO product (name, stock, brand, price, discount, description, weight, tags, categoryId) VALUES 
('IPhone 13 Pro', 10, 'Apple', 950.00, 10.00, 'The iPhone 13 Pro is a cutting-edge smartphone with a powerful camera system, high-performance chip, and stunning display. It offers advanced features for users who demand top-notch technology.', 200.00, 'Apple mobile', 2),
('Apple MacBook Pro 14 Inch Space Grey', 5, 'Apple', 2500.00, 15.00, 'The MacBook Pro 14 Inch in Space Grey is a powerful and sleek laptop, featuring Apple''s M1 Pro chip for exceptional performance and a stunning Retina display.', 2000.00, 'Apple laptops battery', 1),
('Asus Zenbook Pro Dual Screen Laptop', 10, 'Asus', 3000.00, 6.00, 'The Asus Zenbook Pro Dual Screen Laptop is a high-performance device with dual screens, providing productivity and versatility for creative professionals.', 3500.00, 'Asus Gaming Laptop', 1);

-- Insert cart items (now using correct product IDs 1, 2, 3)
INSERT INTO cartitem (cartId, productId, quantity) VALUES 
(2, 1, 1),  -- iPhone 13 Pro for client 2
(4, 1, 1);  -- iPhone 13 Pro for client 4

-- Insert product images (now using correct product IDs 1, 2, 3)
INSERT INTO productimage (url, productId, isThumbnail) VALUES 
-- iPhone 13 Pro images (product ID 1)
('https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/thumbnail.png', 1, 1),
('https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/2.png', 1, 0),
-- MacBook Pro images (product ID 2)
('https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png', 2, 1),
('https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/2.png', 2, 0),
-- Asus Zenbook images (product ID 3)
('https://cdn.dummyjson.com/products/images/laptops/Asus%20Zenbook%20Pro%20Dual%20Screen%20Laptop/thumbnail.png', 3, 1),
('https://cdn.dummyjson.com/products/images/laptops/Asus%20Zenbook%20Pro%20Dual%20Screen%20Laptop/2.png', 3, 0);