-- Textile ERP Database Schema
-- Fresh database initialization

-- Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    rating DECIMAL(3, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- Materials/Products
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_of_measure VARCHAR(20),
    quantity_in_stock INT DEFAULT 0,
    reorder_level INT DEFAULT 100,
    unit_cost DECIMAL(10, 2),
    supplier_id UUID REFERENCES suppliers(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Materials
CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(code);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    total_amount DECIMAL(12, 2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Purchase Orders
CREATE INDEX IF NOT EXISTS idx_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);

-- Purchase Order Items
CREATE TABLE IF NOT EXISTS po_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2),
    line_total DECIMAL(12, 2),
    received_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for PO Items
CREATE INDEX IF NOT EXISTS idx_po_items_po_id ON po_items(po_id);

-- Inventory Transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id),
    transaction_type VARCHAR(50),
    quantity INT NOT NULL,
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Inventory Transactions
CREATE INDEX IF NOT EXISTS idx_inv_material ON inventory_transactions(material_id);
CREATE INDEX IF NOT EXISTS idx_inv_type ON inventory_transactions(transaction_type);

-- Production Plans/Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wo_number VARCHAR(50) UNIQUE NOT NULL,
    product_id UUID REFERENCES materials(id),
    quantity INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Work Orders
CREATE INDEX IF NOT EXISTS idx_wo_number ON work_orders(wo_number);
CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(status);

-- Production Logs
CREATE TABLE IF NOT EXISTS production_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id),
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity_produced INT,
    quantity_defective INT,
    notes TEXT,
    logged_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quality Control
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES materials(id),
    work_order_id UUID REFERENCES work_orders(id),
    check_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Pending',
    checked_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Quality Checks
CREATE INDEX IF NOT EXISTS idx_qc_status ON quality_checks(status);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    credit_limit DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Customers
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(code);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- Sales Orders
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    so_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    total_amount DECIMAL(12, 2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Sales Orders
CREATE INDEX IF NOT EXISTS idx_so_number ON sales_orders(so_number);
CREATE INDEX IF NOT EXISTS idx_so_status ON sales_orders(status);

-- Sales Order Items
CREATE TABLE IF NOT EXISTS so_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    so_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2),
    line_total DECIMAL(12, 2),
    shipped_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Sales Order Items
CREATE INDEX IF NOT EXISTS idx_so_items_so_id ON so_items(so_id);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100),
    operation VARCHAR(50),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Audit Log
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);

-- Create Full-Text Search Indexes
CREATE INDEX IF NOT EXISTS idx_materials_gist ON materials USING GIST (name gist_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_gist ON suppliers USING GIST (name gist_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customers_gist ON customers USING GIST (name gist_trgm_ops);

-- Create Views for Reporting

-- Sales Summary View
CREATE OR REPLACE VIEW sales_summary AS
SELECT 
    DATE(o.order_date) as order_date,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_sales,
    COUNT(CASE WHEN o.status = 'Delivered' THEN 1 END) as delivered_count
FROM sales_orders o
GROUP BY DATE(o.order_date)
ORDER BY order_date DESC;

-- Inventory Summary View
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
    m.code,
    m.name,
    m.category,
    m.quantity_in_stock,
    m.reorder_level,
    m.unit_cost,
    CASE 
        WHEN m.quantity_in_stock <= m.reorder_level THEN 'Low Stock'
        WHEN m.quantity_in_stock > m.reorder_level * 3 THEN 'High Stock'
        ELSE 'Optimal'
    END as stock_status
FROM materials m
WHERE m.is_active = TRUE;

-- Production Summary View
CREATE OR REPLACE VIEW production_summary AS
SELECT 
    DATE(wo.created_at) as production_date,
    COUNT(wo.id) as total_work_orders,
    COUNT(CASE WHEN wo.status = 'Completed' THEN 1 END) as completed_orders,
    SUM(CASE WHEN pl.quantity_produced > 0 THEN pl.quantity_produced ELSE 0 END) as total_produced
FROM work_orders wo
LEFT JOIN production_logs pl ON wo.id = pl.work_order_id
GROUP BY DATE(wo.created_at)
ORDER BY production_date DESC;

-- Insert Default Admin User
INSERT INTO users (username, email, full_name, hashed_password, is_admin, is_active)
VALUES ('admin', 'admin@textile-erp.com', 'Administrator', '$2b$12$K6LL/g7VkK9w3E2Q3L5Z8examplehashedpassword', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;

-- Create Triggers for Updated Timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER users_update_timestamp BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER suppliers_update_timestamp BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER materials_update_timestamp BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER purchase_orders_update_timestamp BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER work_orders_update_timestamp BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER sales_orders_update_timestamp BEFORE UPDATE ON sales_orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Grant Permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erp_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO erp_user;

COMMIT;
