#!/bin/bash

# Configuration
DB_NAME="querymind"
DB_USER="postgres" 

echo "🚀 Initializing '$DB_NAME' for trend analysis testing..."

# 1. Force close connections and recreate DB
# This ensures the script doesn't fail if your app is currently connected to 'querymind'
echo "📂 Recreating database..."
psql -U $DB_USER -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" > /dev/null 2>&1
psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# 2. Schema and Data Injection
echo "🏗️  Applying schema and trend-biased dummy data..."

psql -U $DB_USER -d $DB_NAME <<EOF
-- Schema
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(category_id),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    region VARCHAR(50),
    signup_date DATE
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    total_amount DECIMAL(12, 2)
);

CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    product_id INT REFERENCES products(product_id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(5, 2) DEFAULT 0.00
);

-- Data for Trend Analysis
INSERT INTO categories (name) VALUES ('Electronics'), ('Apparel'), ('Kitchen');

INSERT INTO products (category_id, name, price, cost_price, stock_quantity) VALUES 
(1, 'Pro Tablet', 899.99, 600.00, 40),
(1, 'Wireless Buds', 149.99, 50.00, 100),
(2, 'Tech Jacket', 120.00, 45.00, 60);

INSERT INTO customers (first_name, last_name, email, region, signup_date) VALUES 
('Jean', 'Doe', 'jean@example.com', 'West', '2026-01-10'),
('Sasha', 'Lee', 'sasha@example.com', 'East', '2026-02-15');

-- Simulating a revenue spike in May 2026
INSERT INTO orders (customer_id, order_date, status, total_amount) VALUES 
(1, '2026-04-20 10:00:00', 'Completed', 149.99),
(2, '2026-05-01 12:00:00', 'Completed', 899.99),
(1, '2026-05-04 15:30:00', 'Completed', 1049.98);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES 
(1, 2, 1, 149.99),
(2, 1, 1, 899.99),
(3, 1, 1, 899.99),
(3, 2, 1, 149.99);

EOF

echo "✅ Success! '$DB_NAME' is ready."
echo "💡 Try asking Gemini: 'Compare our revenue growth between April and May 2026.'"