# 🏢 PK Plus ERP V3 Production System

**ระบบ Enterprise Resource Planning (ERP) สำหรับ ลุงชัย ไชโย พานิช**

---

## 📋 สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [ความต้องการของระบบ](#ความต้องการของระบบ)
3. [การติดตั้ง](#การติดตั้ง)
4. [การสมัครบัญชี](#การสมัครบัญชี)
5. [การใช้งาน](#การใช้งาน)
6. [วิธี Deploy](#วิธี-deploy)
7. [สิ่งที่ควรทราบ](#สิ่งที่ควรทราบ)

---

## ภาพรวม

ระบบ ERP V3 Production เป็นระบบบริหารจัดการองค์กรแบบครบวงจรที่พัฒนาเพื่อ**ลุงชัย ไชโย พานิช**

### ✨ คุณสมบัติหลัก:

- ✅ **ระบบเข้าสู่ระบบ** - Login ด้วยอีเมล + รหัสผ่าน
- ✅ **ระบบหลายบทบาท** - Admin, Manager, Sales, HR, Technician
- ✅ **จัดการลูกค้า** - CRUD + ค้นหา + Export CSV
- ✅ **จัดการสินค้า** - สต็อก, ราคา, หมวดหมู่
- ✅ **ใบเสนอราคา & ใบสั่งซื้อ** - เอกสารขาย + การอนุมัติ
- ✅ **ใบแจ้งหนี้ & การชำระเงิน** - บัญชีลูกค้า
- ✅ **ใบสั่งงาน** - การจัดการงานบริการ
- ✅ **แดชบอร์ด** - ตัวชี้วัด KPI ในเวลาจริง
- ✅ **นำเข้าข้อมูล** - Import จากไฟล์ Excel
- ✅ **ส่งออกข้อมูล** - Export เป็น CSV
- ✅ **ใช้งานจากทุกที่** - Cloud-based, ไม่ต้องเปิด PC 24/7

---

## ความต้องการของระบบ

### ✅ สำหรับการใช้งาน:

- ✓ **อินเทอร์เน็ต** - สอบการเชื่อมต่อ (ความเร็ว 1 Mbps ขึ้นไป)
- ✓ **เบราว์เซอร์** - Chrome, Firefox, Safari, Edge (เวอร์ชันล่าสุด)
- ✓ **บัญชี Supabase** - ฟรี (สร้างเลยไม่มีค่าใช้จ่าย)
- ✓ **บัญชี Vercel** - ฟรี (สำหรับ Deploy Frontend)
- ✓ **บัญชี GitHub** - ฟรี (สำหรับเก็บ Source Code)

### ❌ ไม่ต้องติดตั้งอะไร:

- ❌ ไม่ต้องติดตั้ง Database บนเครื่องของลุงชัย
- ❌ ไม่ต้องเปิด PC 24/7 เพื่อให้ระบบทำงาน
- ❌ ไม่มีค่าใช้จ่ายต่อเดือน (ฟรี 100%)
- ❌ ไม่ต้องซื้อ Server

---

## การติดตั้ง

### ขั้นตอนที่ 1: สร้างบัญชี (15 นาที)

#### 1.1 GitHub
1. ไปที่ [github.com](https://github.com)
2. คลิก **Sign up**
3. ใส่:
   - Username: `yourname` (เช่น pkplus-team)
   - Email: `your@email.com`
   - Password: ตั้งรหัสผ่านที่ปลอดภัย
4. ยืนยันอีเมล → เสร็จ!

#### 1.2 Supabase (PostgreSQL Database ฟรี)
1. ไปที่ [supabase.com](https://supabase.com)
2. คลิก **Start your project**
3. ล็อกอินด้วย GitHub
4. กดปุ่ม **New Project**
5. ใส่:
   - Project Name: `pk-plus-erp`
   - Database Password: ตั้งรหัสผ่าน (เก็บไว้ดี!)
   - Region: **Singapore** (ใกล้ที่สุด)
6. รอ 2-3 นาทีให้สร้าง Database
7. ไปที่ **Settings > API** เอา:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon public)
   - เก็บไว้ในไฟล์ `.env`

#### 1.3 Vercel (Frontend Hosting ฟรี)
1. ไปที่ [vercel.com](https://vercel.com)
2. คลิก **Sign Up**
3. เลือก **Continue with GitHub**
4. ให้ Vercel เข้าถึง GitHub repos ของลุงชัย
5. เสร็จ!

---

### ขั้นตอนที่ 2: Download Files (5 นาที)

1. สร้างโฟลเดอร์: `pk-plus-erp` บนเครื่องของลุงชัย
2. Download ไฟล์เหล่านี้จาก Package:
   ```
   server_production.js
   erp_app_production.jsx
   package.json
   .env.example
   database_schema.sql
   ```

3. คัดลอก `.env.example` → `.env` และแก้ไข:
   ```
   SUPABASE_URL=paste-url-here
   SUPABASE_KEY=paste-anon-key-here
   JWT_SECRET=something-very-random-and-long-12345678
   ```

---

### ขั้นตอนที่ 3: ติดตั้ง Database (5 นาที)

1. เข้า Supabase Dashboard
2. คลิก **SQL Editor** ด้านซ้าย
3. คลิก **New Query**
4. Copy-Paste ทั้งหมดจาก `database_schema.sql`
5. คลิก **Run** (รอสักครู่ให้เสร็จ)
6. ตรวจสอบ: ไปที่ **Table Editor** ควรเห็น 21 ตาราง

---

### ขั้นตอนที่ 4: Deploy Backend (10 นาที)

#### วิธี A: Deploy ที่ Vercel Functions (ฟรี + ง่าย)

1. Push code ไป GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial ERP V3"
   git push origin main
   ```

2. ในหน้า Vercel:
   - Import repository
   - Set Environment Variables:
     - `SUPABASE_URL`
     - `SUPABASE_KEY`
     - `JWT_SECRET`
   - Click **Deploy**

3. ได้ URL:
   ```
   https://your-repo.vercel.app/api/health
   ```

---

### ขั้นตอนที่ 5: Deploy Frontend (10 นาที)

1. ในไฟล์ React component, แก้:
   ```javascript
   const BACKEND_URL = 'https://your-backend-url.vercel.app';
   ```

2. Push ไป GitHub
3. Vercel auto-deploy เอง
4. ได้ URL: `https://pkplus-erp.vercel.app`

---

## การสมัครบัญชี

### สำหรับจำนวนหัวครัว:

1. **ครั้งแรก**: สมัครสมาชิกใหม่
   ```
   ชื่อเต็ม: สิทธิชัย แสงจู
   อีเมล: sithichai@pkplus.co.th
   รหัสผ่าน: ตั้งเอง (แนะนำ 8+ ตัว)
   รหัสพนักงาน: EMP001
   ```

2. **ครั้งต่อไป**: ล็อกอินด้วย email + password

3. **บทบาทอื่น**: ให้ Admin สร้างในภายหลัง

---

## การใช้งาน

### เข้าสู่ระบบ

```
URL: https://pkplus-erp.vercel.app
Email: sithichai@pkplus.co.thai
Password: your-password
```

### ฟีเจอร์หลัก

#### 📊 Dashboard
- ดูตัวชี้วัด: ยอดขาย, ลูกค้า, สินค้า, ใบแจ้งหนี้
- ทันทีที่กรอกข้อมูลลูกค้า ระบบจะอัปเดตอัตโนมัติ

#### 👥 จัดการลูกค้า
1. ไปที่ **Tab "👥 ลูกค้า"**
2. **เพิ่มใหม่**: กรอก code, name, phone, email, credit term
3. **ค้นหา**: ใช้ช่อง search (ค้นหาแบบจริงเวลา)
4. **ส่งออก**: Export เป็น CSV (เปิดด้วย Excel ได้)
5. **แก้ไข**: คลิกปุ่ม✏️
6. **ลบ**: คลิกปุ่ม🗑️

#### 📦 จัดการสินค้า
- เพิ่ม/แก้ไข: SKU, ชื่อ, หมวด, ต้นทุน, ราคาขาย, จำนวน min stock
- ระบบจะคำนวณกำไร: `ราคาขาย - ต้นทุน`

#### 📋 ใบเสนอราคา
1. เลือก **ลูกค้า** → **สินค้า** → **จำนวน**
2. ระบบจำนวณอัตโนมัติ:
   - ยอด = จำนวน × ราคา
   - VAT 7% = ยอด × 0.07
   - รวมสุทธิ = ยอด + VAT

#### 💰 ใบแจ้งหนี้
- Auto-link จาก Delivery Order
- ระบบติดตามสถานะ: Unpaid, Partial, Paid, Overdue
- ทำให้ง่ายต่อการเรียกเก็บเงิน

#### 🔧 ใบสั่งงาน
- กำหนด Technician
- ระบุประเภทงาน: Installation, Maintenance, Repair, Inspection
- ติดตามความคืบหน้า

---

## วิธี Deploy

### ชั้นที่ 1: ติดตั้งที่เครื่องตัวเอง (Local)

```bash
# 1. ติดตั้ง Node.js
Download จาก nodejs.org → ติดตั้ง

# 2. สร้างโฟลเดอร์ project
mkdir pk-plus-erp
cd pk-plus-erp

# 3. ติดตั้ง dependencies
npm install

# 4. ตั้ง .env file
cp .env.example .env
# แก้ไข SUPABASE_URL, SUPABASE_KEY, JWT_SECRET

# 5. รัน Backend
npm start
# ควรเห็น: "ERP V3 PRODUCTION SERVER RUNNING on port 3001"

# 6. รัน Frontend (terminal อื่น)
npm start (สำหรับ React App)
```

### ชั้นที่ 2: Deploy ไปยัง Cloud (Production)

**ตัวเลือก A: Deploy ที่ Vercel (แนะนำ - ฟรี)**

```bash
# 1. ลง Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. ตั้ง Environment Variables ใน Vercel Dashboard:
SUPABASE_URL
SUPABASE_KEY
JWT_SECRET

# 5. ได้ URL: https://your-project.vercel.app
```

**ตัวเลือก B: Docker Container**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

---

## สิ่งที่ควรทราบ

### ⚠️ ความปลอดภัย

1. **เปลี่ยน JWT_SECRET** ให้เป็นอย่างอื่น (ไม่ใช่ค่าเริ่มต้น)
2. **ไม่สาธารณะ .env file** ไปที่ GitHub
3. **ใช้ HTTPS เท่านั้น** ไม่ใช่ HTTP
4. **รีเซตรหัสผ่าน** เป็นระยะ

### 💾 Backup Data

```sql
-- Export ข้อมูลประจำวัน (ในหน้า Supabase)
1. ไปที่ Backups (ด้านขวา)
2. Click "Download"
3. เก็บไฟล์ SQL ไว้อย่างปลอดภัย
```

### 🔄 Update System

```bash
# Pull version ใหม่
git pull origin main

# ติดตั้ง dependencies ใหม่
npm install

# รีสตาร์ท server
npm start
```

### 📞 Support / ปัญหา

**หากเกิดข้อผิดพลาด:**

1. ตรวจสอบ **Connection String** (SUPABASE_URL)
2. ตรวจสอบ **Database Status** ใน Supabase
3. ล้าง Browser Cache (Ctrl+Shift+Delete)
4. รีสตาร์ท Backend server
5. ตรวจสอบ Network (ping api.supabase.co)

---

## 📊 ข้อมูล Sample

ระบบมี Sample Data ประกอบด้วย:

- **1 Company** (ลุงชัย ไชโย พานิช)
- **2 Branches** (หนองใหญ่, ชลบุรี)
- **3 Departments** (Admin, Operations, Warehouse)
- **3 Employees** (EMP001-003)
- **2 Customers** (AMATA, Thai Rung)
- **5 Products** (IT, Camera, PPE, etc)

---

## 📚 API Documentation

### Endpoints

```
POST   /api/auth/login             - เข้าสู่ระบบ
POST   /api/auth/register          - สมัครสมาชิก

GET    /api/customer               - ดูลูกค้า
POST   /api/customer               - สร้างลูกค้า
PUT    /api/customer/:id           - แก้ไขลูกค้า

GET    /api/product                - ดูสินค้า
POST   /api/product                - สร้างสินค้า

GET    /api/quotation              - ดูใบเสนอราคา
POST   /api/quotation              - สร้างใบเสนอราคา

GET    /api/invoice                - ดูใบแจ้งหนี้
GET    /api/dashboard/metrics      - ตัวชี้วัด

POST   /api/import/excel           - นำเข้า Excel
```

---

## 📞 ติดต่อ

**ลุงชัย ไชโย พานิช**
- 📧 Email: info@pkplus.co.th
- 📱 Phone: 038-111222
- 🌐 Website: pkplus.co.th

---

**Version:** 3.0.0 (Production)  
**Last Updated:** June 2026  
**License:** MIT

---

## ✅ Checklist ก่อน Go Live

- [ ] สร้างบัญชี Supabase + ได้ Connection String
- [ ] สร้างบัญชี Vercel
- [ ] ติดตั้ง Database Schema ใน Supabase
- [ ] Deploy Backend ไป Vercel
- [ ] Deploy Frontend ไป Vercel
- [ ] ทดสอบ Login/Register
- [ ] ทดสอบ CRUD (Customer, Product)
- [ ] ทดสอบ Dashboard Metrics
- [ ] ทดสอบ Export CSV
- [ ] Setup Backup Data
- [ ] สร้างบัญชี Admin ที่ 1
- [ ] บอกทีมใจต่อ URL ที่ใช้งาน
- [ ] ทำการฝึกอบรมพนักงาน

---

**Ready to Go! 🚀**
