// ===== ERP V3 PRODUCTION FRONTEND =====
// React + Vite + Supabase
// Features: Dashboard, CRUD, Excel Export, Role-based UI

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// ===== AXIOS CONFIG =====
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== MAIN APP COMPONENT =====
function ERPApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <LoginComponent onLogin={handleLogin} loading={loading} error={error} />;
  }

  return (
    <div className="erp-app">
      <header className="header">
        <h1>🏢 PK Plus ERP V3</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <small>({user.role})</small>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <nav className="sidebar">
        <ul>
          <li><button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>📊 Dashboard</button></li>
          <li><button onClick={() => setActiveTab('employee')} className={activeTab === 'employee' ? 'active' : ''}>👥 Employee</button></li>
          <li><button onClick={() => setActiveTab('customer')} className={activeTab === 'customer' ? 'active' : ''}>🤝 Customer</button></li>
          <li><button onClick={() => setActiveTab('product')} className={activeTab === 'product' ? 'active' : ''}>📦 Product</button></li>
          <li><button onClick={() => setActiveTab('quotation')} className={activeTab === 'quotation' ? 'active' : ''}>💼 Quotation</button></li>
          <li><button onClick={() => setActiveTab('salesorder')} className={activeTab === 'salesorder' ? 'active' : ''}>📋 Sales Order</button></li>
          <li><button onClick={() => setActiveTab('invoice')} className={activeTab === 'invoice' ? 'active' : ''}>💰 Invoice</button></li>
          <li><button onClick={() => setActiveTab('stock')} className={activeTab === 'stock' ? 'active' : ''}>📦 Stock</button></li>
          {user.role === 'Admin' && (
            <li><button onClick={() => setActiveTab('import')} className={activeTab === 'import' ? 'active' : ''}>📥 Import Excel</button></li>
          )}
        </ul>
      </nav>

      <main className="content">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'employee' && <EmployeeTab userRole={user.role} />}
        {activeTab === 'customer' && <CustomerTab userRole={user.role} />}
        {activeTab === 'product' && <ProductTab userRole={user.role} />}
        {activeTab === 'quotation' && <QuotationTab userRole={user.role} />}
        {activeTab === 'salesorder' && <SalesOrderTab userRole={user.role} />}
        {activeTab === 'invoice' && <InvoiceTab userRole={user.role} />}
        {activeTab === 'stock' && <StockTab userRole={user.role} />}
        {user.role === 'Admin' && activeTab === 'import' && <ImportTab />}
      </main>
    </div>
  );
}

// ===== LOGIN COMPONENT =====
function LoginComponent({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>PK Plus ERP</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ===== DASHBOARD TAB =====
function DashboardTab() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/dashboard/metrics');
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-tab">
      <h2>📊 Dashboard</h2>
      <div className="metrics-grid">
        <MetricCard title="Total Sales" value={metrics?.totalSales || 0} icon="💰" />
        <MetricCard title="Total Customers" value={metrics?.totalCustomers || 0} icon="🤝" />
        <MetricCard title="Total Products" value={metrics?.totalProducts || 0} icon="📦" />
        <MetricCard title="Paid Invoices" value={metrics?.paidInvoices || 0} icon="✅" />
        <MetricCard title="Unpaid Amount" value={metrics?.unpaidAmount || 0} icon="⏳" />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-info">
        <p className="metric-title">{title}</p>
        <p className="metric-value">{value}</p>
      </div>
    </div>
  );
}

// ===== EMPLOYEE TAB =====
function EmployeeTab({ userRole }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get('/employee');
        setEmployees(data);
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="tab-content">
      <h2>👥 Employee Management</h2>
      {['Admin', 'HR'].includes(userRole) && <button className="btn-primary">+ Add Employee</button>}
      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.code}</td>
              <td>{emp.first_name_th} {emp.last_name_th}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td><span className="badge">{emp.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== CUSTOMER TAB =====
function CustomerTab({ userRole }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get('/customer');
        setCustomers(data);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="tab-content">
      <h2>🤝 Customer Management</h2>
      {['Admin', 'Manager'].includes(userRole) && <button className="btn-primary">+ Add Customer</button>}
      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Tax ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => (
            <tr key={cust.id}>
              <td>{cust.code}</td>
              <td>{cust.name}</td>
              <td>{cust.email}</td>
              <td>{cust.phone}</td>
              <td>{cust.tax_id}</td>
              <td><span className="badge">{cust.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== PRODUCT TAB =====
function ProductTab({ userRole }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/product');
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="tab-content">
      <h2>📦 Product Management</h2>
      {['Admin', 'Manager'].includes(userRole) && <button className="btn-primary">+ Add Product</button>}
      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Cost</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.sku}</td>
              <td>{prod.name}</td>
              <td>{prod.category}</td>
              <td>฿{prod.cost?.toFixed(2)}</td>
              <td>฿{prod.price?.toFixed(2)}</td>
              <td>{prod.current_stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== QUOTATION TAB =====
function QuotationTab({ userRole }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const { data } = await api.get('/quotation');
        setQuotations(data);
      } catch (err) {
        console.error('Error fetching quotations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="tab-content">
      <h2>💼 Quotation Management</h2>
      {['Admin', 'Manager', 'Sales'].includes(userRole) && <button className="btn-primary">+ New Quotation</button>}
      <table className="data-table">
        <thead>
          <tr>
            <th>Quo. No</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((quo) => (
            <tr key={quo.id}>
              <td>{quo.quo_no}</td>
              <td>{quo.quo_date}</td>
              <td>฿{quo.amount?.toFixed(2)}</td>
              <td><span className="badge">{quo.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== SALES ORDER TAB =====
function SalesOrderTab({ userRole }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/salesorder');
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="tab-content">
      <h2>📋 Sales Order Management</h2>
      {['Admin', 'Manager', 'Sales'].includes(userRole) && <button className="btn-primary">+ New Sales Order</button>}
      <table className="data-table">
        <thead>
          <tr>
            <th>SO No</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.so_no}</td>
              <td>{order.order_date}</td>
              <td>฿{order.total?.toFixed(2)}</td>
              <td><span className="badge">{order.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== INVOICE TAB =====
function InvoiceTab({ userRole }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data } = await api.get('/invoice');
        setInvoices(data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="tab-content">
      <h2>💰 Invoice Management</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoice_no}</td>
              <td>{inv.invoice_date}</td>
              <td>฿{inv.amount?.toFixed(2)}</td>
              <td><span className={`badge ${inv.status === 'Paid' ? 'paid' : 'unpaid'}`}>{inv.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== STOCK TAB =====
function StockTab({ userRole }) {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const { data } = await api.get('/stock');
        setStock(data);
      } catch (err) {
        console.error('Error fetching stock:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="tab-content">
      <h2>📦 Stock Balance</h2>
      {['Admin', 'Manager'].includes(userRole) && <button className="btn-primary">+ Stock In</button>}
      <table className="data-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Stock In</th>
            <th>Stock Out</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((s) => (
            <tr key={s.id}>
              <td>{s.product_id}</td>
              <td>{s.stock_in}</td>
              <td>{s.stock_out}</td>
              <td><strong>{s.balance}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== IMPORT TAB =====
function ImportTab() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/import/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(`✅ Import successful! ${data.rowCount} rows processed.`);
      setFile(null);
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <h2>📥 Import Excel Data</h2>
      <div className="import-box">
        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading} className="btn-primary">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default ERPApp;