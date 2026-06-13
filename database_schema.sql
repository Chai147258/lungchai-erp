-- ===== ERP V3 PRODUCTION DATABASE SCHEMA =====
-- PostgreSQL for Supabase
-- Run these queries in Supabase SQL Editor

-- ===== 1. COMPANY TABLE =====
CREATE TABLE IF NOT EXISTS company (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name_th VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  tax_id VARCHAR(50),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 2. BRANCH TABLE =====
CREATE TABLE IF NOT EXISTS branch (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES company(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  province VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 3. DEPARTMENT TABLE =====
CREATE TABLE IF NOT EXISTS department (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name_th VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  company_id INTEGER REFERENCES company(id) ON DELETE CASCADE,
  branch_id INTEGER REFERENCES branch(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 4. POSITION TABLE =====
CREATE TABLE IF NOT EXISTS position (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name_th VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 5. USER/LOGIN TABLE =====
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  emp_id VARCHAR(50),
  role VARCHAR(50) DEFAULT 'Employee',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 6. EMPLOYEE TABLE =====
CREATE TABLE IF NOT EXISTS employee (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  company_id INTEGER REFERENCES company(id) ON DELETE CASCADE,
  branch_id INTEGER REFERENCES branch(id) ON DELETE CASCADE,
  department_id INTEGER REFERENCES department(id),
  position_id INTEGER REFERENCES position(id),
  title_th VARCHAR(50),
  first_name_th VARCHAR(100),
  last_name_th VARCHAR(100),
  first_name_en VARCHAR(100),
  last_name_en VARCHAR(100),
  nickname VARCHAR(100),
  gender VARCHAR(10),
  birth_date DATE,
  id_card VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  hire_date DATE,
  salary DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'Active',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 7. CUSTOMER TABLE =====
CREATE TABLE IF NOT EXISTS customer (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  tax_id VARCHAR(50),
  contact_person VARCHAR(100),
  contact_phone VARCHAR(20),
  address TEXT,
  credit_term VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 8. SUPPLIER TABLE =====
CREATE TABLE IF NOT EXISTS supplier (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(50),
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 9. PRODUCT TABLE =====
CREATE TABLE IF NOT EXISTS product (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(50),
  cost DECIMAL(12,2),
  price DECIMAL(12,2),
  min_stock INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 10. QUOTATION TABLE =====
CREATE TABLE IF NOT EXISTS quotation (
  id SERIAL PRIMARY KEY,
  quo_no VARCHAR(50) UNIQUE NOT NULL,
  quo_date DATE,
  customer_id INTEGER REFERENCES customer(id) ON DELETE CASCADE,
  sales_id INTEGER REFERENCES employee(id),
  subtotal DECIMAL(12,2),
  vat_amount DECIMAL(12,2),
  total DECIMAL(12,2),
  amount DECIMAL(12,2),
  vat DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'Draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 11. QUOTATION DETAIL TABLE =====
CREATE TABLE IF NOT EXISTS quotation_detail (
  id SERIAL PRIMARY KEY,
  quotation_id INTEGER REFERENCES quotation(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES product(id),
  quantity INTEGER,
  unit_price DECIMAL(12,2),
  amount DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 12. SALES ORDER TABLE =====
CREATE TABLE IF NOT EXISTS sales_order (
  id SERIAL PRIMARY KEY,
  so_no VARCHAR(50) UNIQUE NOT NULL,
  quotation_id INTEGER REFERENCES quotation(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customer(id) ON DELETE CASCADE,
  order_date DATE,
  delivery_date DATE,
  subtotal DECIMAL(12,2),
  vat_amount DECIMAL(12,2),
  total DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'Draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 13. DELIVERY ORDER TABLE =====
CREATE TABLE IF NOT EXISTS delivery_order (
  id SERIAL PRIMARY KEY,
  do_no VARCHAR(50) UNIQUE NOT NULL,
  so_id INTEGER REFERENCES sales_order(id) ON DELETE CASCADE,
  delivery_date DATE,
  delivered_by INTEGER REFERENCES employee(id),
  received_by VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 14. INVOICE TABLE =====
CREATE TABLE IF NOT EXISTS invoice (
  id SERIAL PRIMARY KEY,
  invoice_no VARCHAR(50) UNIQUE NOT NULL,
  do_id INTEGER REFERENCES delivery_order(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customer(id) ON DELETE CASCADE,
  invoice_date DATE,
  due_date DATE,
  subtotal DECIMAL(12,2),
  vat_amount DECIMAL(12,2),
  total DECIMAL(12,2),
  amount DECIMAL(12,2),
  vat DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'Unpaid',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 15. PAYMENT TABLE =====
CREATE TABLE IF NOT EXISTS payment (
  id SERIAL PRIMARY KEY,
  payment_no VARCHAR(50) UNIQUE NOT NULL,
  invoice_id INTEGER REFERENCES invoice(id) ON DELETE CASCADE,
  payment_date DATE,
  amount DECIMAL(12,2),
  method VARCHAR(50),
  bank_name VARCHAR(100),
  reference_no VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 16. STOCK IN TABLE =====
CREATE TABLE IF NOT EXISTS stock_in (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
  reference_no VARCHAR(100),
  quantity INTEGER,
  cost DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 17. STOCK OUT TABLE =====
CREATE TABLE IF NOT EXISTS stock_out (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
  reference_no VARCHAR(100),
  quantity INTEGER,
  type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 18. STOCK BALANCE TABLE =====
CREATE TABLE IF NOT EXISTS stock_balance (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES product(id) UNIQUE ON DELETE CASCADE,
  stock_in INTEGER DEFAULT 0,
  stock_out INTEGER DEFAULT 0,
  balance INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 19. WORK ORDER TABLE =====
CREATE TABLE IF NOT EXISTS work_order (
  id SERIAL PRIMARY KEY,
  wo_no VARCHAR(50) UNIQUE NOT NULL,
  so_id INTEGER REFERENCES sales_order(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customer(id) ON DELETE CASCADE,
  job_type VARCHAR(100),
  assigned_to INTEGER REFERENCES employee(id),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'Open',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 20. ATTENDANCE TABLE =====
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employee(id) ON DELETE CASCADE,
  attendance_date DATE,
  check_in_time TIME,
  check_out_time TIME,
  status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 21. LEAVE TABLE =====
CREATE TABLE IF NOT EXISTS leave_request (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employee(id) ON DELETE CASCADE,
  leave_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  number_of_days INTEGER,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  approved_by INTEGER REFERENCES employee(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== AUDIT LOG TABLE =====
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255),
  table_name VARCHAR(100),
  record_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_employee_company ON employee(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_branch ON employee(branch_id);
CREATE INDEX IF NOT EXISTS idx_employee_email ON employee(email);
CREATE INDEX IF NOT EXISTS idx_customer_status ON customer(status);
CREATE INDEX IF NOT EXISTS idx_product_sku ON product(sku);
CREATE INDEX IF NOT EXISTS idx_quotation_date ON quotation(quo_date);
CREATE INDEX IF NOT EXISTS idx_invoice_customer ON invoice(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON invoice(status);
CREATE INDEX IF NOT EXISTS idx_workorder_status ON work_order(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);

-- ===== RLS POLICIES =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ===== GRANT PERMISSIONS =====
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;