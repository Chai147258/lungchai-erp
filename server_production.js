// ===== ERP V3 PRODUCTION SERVER =====
// Node.js + Express + Supabase PostgreSQL
// Supports: Auth, CRUD, Excel Import, Role-based Access
// Security: Input Validation, Rate Limiting, Helmet, Request Logging

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// ===== SECURITY MIDDLEWARE =====
app.use(helmet()); // Set security HTTP headers
app.use(morgan('combined')); // Request logging

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ===== RATE LIMITING =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // strict limit for auth
  message: 'Too many login attempts, please try again later.'
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit uploads
  message: 'Too many file uploads, please try again later.'
});

app.use('/api/', limiter);

// ===== MULTER SETUP =====
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// ===== SUPABASE SETUP =====
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be set in .env file and be at least 32 characters');
  process.exit(1);
}

// ===== VALIDATION SCHEMAS =====
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).required(),
  empId: Joi.string().required(),
  role: Joi.string().valid('Admin', 'Manager', 'Sales', 'HR', 'Technician', 'Employee')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const employeeSchema = Joi.object({
  code: Joi.string().required(),
  company_id: Joi.number().required(),
  branch_id: Joi.number().required(),
  department_id: Joi.number(),
  position_id: Joi.number(),
  first_name_th: Joi.string().required(),
  last_name_th: Joi.string().required(),
  email: Joi.string().email(),
  phone: Joi.string(),
  hire_date: Joi.date(),
  salary: Joi.number().positive()
});

const customerSchema = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  phone: Joi.string(),
  email: Joi.string().email(),
  tax_id: Joi.string(),
  address: Joi.string(),
  credit_term: Joi.string()
});

const productSchema = Joi.object({
  sku: Joi.string().required(),
  name: Joi.string().required(),
  category: Joi.string(),
  unit: Joi.string(),
  cost: Joi.number().positive(),
  price: Joi.number().positive(),
  min_stock: Joi.number().default(0)
});

// ===== HELPER FUNCTIONS =====
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid or expired token' });
  
  req.user = decoded;
  next();
};

const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    req.validatedBody = value;
    next();
  };
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message
  });
};

// ===== AUTH ROUTES =====
app.post('/api/auth/register', authLimiter, validateInput(registerSchema), async (req, res, next) => {
  try {
    const { email, password, fullName, empId, role } = req.validatedBody;
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        emp_id: empId,
        role: role || 'Employee',
        is_active: true
      }])
      .select();
    
    if (error) return res.status(400).json({ error: error.message });
    
    const user = data[0];
    const token = generateToken(user.id, user.email, user.role);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', authLimiter, validateInput(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (!data.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }
    
    const validPassword = await bcrypt.compare(password, data.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);
    
    const token = generateToken(data.id, data.email, data.role);
    
    res.json({
      token,
      user: {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// ===== COMPANY ROUTES =====
app.get('/api/company', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('company')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ===== BRANCH ROUTES =====
app.get('/api/branch', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('branch')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ===== EMPLOYEE ROUTES =====
app.get('/api/employee', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('employee')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/api/employee', authMiddleware, validateInput(employeeSchema), async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'HR') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { data, error } = await supabase
      .from('employee')
      .insert([req.validatedBody])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/employee/:id', authMiddleware, validateInput(employeeSchema), async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'HR') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { data, error } = await supabase
      .from('employee')
      .update(req.validatedBody)
      .eq('id', parseInt(req.params.id))
      .select();
    
    if (error) throw error;
    if (!data.length) return res.status(404).json({ error: 'Employee not found' });
    
    res.json(data[0]);
  } catch (err) {
    next(err);
  }
});

// ===== CUSTOMER ROUTES =====
app.get('/api/customer', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/api/customer', authMiddleware, validateInput(customerSchema), async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { data, error } = await supabase
      .from('customer')
      .insert([req.validatedBody])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// ===== PRODUCT ROUTES =====
app.get('/api/product', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('status', 'Active')
      .order('id', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/api/product', authMiddleware, validateInput(productSchema), async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { data, error } = await supabase
      .from('product')
      .insert([req.validatedBody])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// ===== QUOTATION ROUTES =====
app.get('/api/quotation', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('quotation')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/api/quotation', authMiddleware, async (req, res, next) => {
  try {
    if (!['Admin', 'Manager', 'Sales'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { data, error } = await supabase
      .from('quotation')
      .insert([req.body])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// ===== SALES ORDER ROUTES =====
app.get('/api/salesorder', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('sales_order')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/api/salesorder', authMiddleware, async (req, res, next) => {
  try {
    if (!['Admin', 'Manager', 'Sales'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { data, error } = await supabase
      .from('sales_order')
      .insert([req.body])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// ===== INVOICE ROUTES =====
app.get('/api/invoice', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('invoice')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ===== WORK ORDER ROUTES =====
app.get('/api/workorder', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('work_order')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/api/workorder', authMiddleware, async (req, res, next) => {
  try {
    if (!['Admin', 'Manager', 'Technician'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { data, error } = await supabase
      .from('work_order')
      .insert([req.body])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// ===== STOCK ROUTES =====
app.get('/api/stock', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('stock_balance')
      .select('*')
      .order('product_id', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/api/stock/in', authMiddleware, async (req, res, next) => {
  try {
    if (!['Admin', 'Manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { data, error } = await supabase
      .from('stock_in')
      .insert([req.body])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// ===== DASHBOARD ROUTES =====
app.get('/api/dashboard/metrics', authMiddleware, async (req, res, next) => {
  try {
    const { data: quotations } = await supabase.from('quotation').select('amount');
    const { data: customers } = await supabase.from('customer').select('id');
    const { data: products } = await supabase.from('product').select('id');
    const { data: invoices } = await supabase.from('invoice').select('amount, status');
    
    const totalSales = quotations?.reduce((sum, q) => sum + (q.amount || 0), 0) || 0;
    const paidInvoices = invoices?.filter(i => i.status === 'Paid').length || 0;
    const unpaidAmount = invoices?.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
    
    res.json({
      totalSales,
      totalCustomers: customers?.length || 0,
      totalProducts: products?.length || 0,
      paidInvoices,
      unpaidAmount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// ===== EXCEL IMPORT ROUTE =====
app.post('/api/import/excel', authMiddleware, uploadLimiter, upload.single('file'), async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only Admin can import data' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }
    
    if (jsonData.length > 10000) {
      return res.status(400).json({ error: 'Excel file exceeds maximum rows (10000)' });
    }
    
    res.json({
      message: 'File uploaded successfully',
      rowCount: jsonData.length,
      data: jsonData.slice(0, 10),
      importId: uuidv4()
    });
  } catch (err) {
    next(err);
  }
});

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== ERROR HANDLER =====
app.use(errorHandler);

// ===== START SERVER =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   ERP V3 PRODUCTION SERVER RUNNING    ║
  ║                                        ║
  ║   🚀 Server: http://localhost:${PORT}   ║
  ║   📊 API: /api/*                       ║
  ║   🔐 Auth: JWT Token Required          ║
  ║   🛡️  Security: Helmet + Rate Limit   ║
  ║                                        ║
  ║   PK Plus - Lungchai Chaiyo Panich   ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;