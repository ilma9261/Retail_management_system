# RetailFlow — Enterprise Retail Inventory Management System

[![Agile Capstone Project](https://img.shields.io/badge/Project-Agile%20Capstone-blue.svg)](https://github.com)
[![Vite](https://img.shields.io/badge/Bundler-Vite%206-646CFF.svg)](https://vitejs.dev)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB.svg)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind%203.4-38B2AC.svg)](https://tailwindcss.com)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel%20SPA-000000.svg)](https://vercel.com)

**RetailFlow** is a complete, production-ready, enterprise-grade Retail Inventory Management System developed as an academic Agile Capstone project. It provides retail enterprises with a centralized operations dashboard to manage product catalogs across 6 industry verticals, track multi-facility warehouse stock, automate purchase orders and receiving lifecycles, orchestrate inter-warehouse inventory transfers, monitor supplier relationships, and generate real-time analytics reports with actual CSV data exports.

The application is completely self-contained on the client-side using `localStorage` persistence and automatic initial seed data, requiring zero external server configuration, MongoDB, or paid API keys.

---

## 🚀 Key Modules & Capabilities

### 1. 🔐 Authentication & Session Control
- Simulated enterprise authentication gateway with demo account credentials.
- Instant "Auto-Fill Credentials" one-click button for rapid evaluator login.
- Session persistence across reloads via `localStorage`.
- Protected application routes with automatic redirection for unauthenticated attempts.

### 2. 📊 Executive Operations Dashboard
- **8 Real-time Live Metric Cards**:
  - Total Catalog Products
  - Total Inventory Units
  - Total Portfolio Capital Value (INR ₹)
  - Low Stock Alerts (below threshold)
  - Out of Stock SKUs
  - Total Active Warehouses
  - Verified Suppliers
  - Pending Purchase Orders
- **4 Interactive Visualizations (Recharts)**:
  - *Inventory by Category* (Donut Chart with units & capital valuation tooltips)
  - *Monthly Stock Movement* (Inbound Stock In vs Outbound Stock Out bar chart)
  - *Inventory Valuation Trend* (Smooth area gradient curve)
  - *Warehouse Storage & Capacity* (Facility capacity limit vs occupied units bar chart)
- **Quick Action Bar**: Instant launch modals for Add Product, Stock In, Create PO, and Transfer Stock.
- **Audit Widgets**: Real-time recent transactions log, active purchase orders overview, and stock replenishment alert drawer.

### 3. 📦 Product Catalog Management
- Full CRUD (Create, Read, Update, Delete) with form validation.
- Auto-generating unique SKU code generator (e.g. `ELEC-MOU-8491`).
- Multi-dimensional filters: Search query, Category filter, Stock status filter, and Price/Stock/Date sorting.
- Comprehensive Product Detail Modal featuring gross margin calculation and multi-warehouse breakdown.
- Pre-seeded with 32+ realistic products across 6 product families (Electronics, Clothing, Grocery, Home & Kitchen, Personal Care, Accessories) using realistic Indian Rupee (₹) pricing.

### 4. 🏢 Multi-Warehouse Management
- Geographic facility administration for **Delhi Warehouse**, **Noida Warehouse**, and **Ghaziabad Warehouse**.
- Real-time capacity utilization progress bars with dynamic color alerting (normal, warning, critical).
- Facility inspect view displaying all product SKUs and physical quantities stored inside each location.
- **Data Integrity Protection**: Strict prevention against deleting any warehouse that currently holds active inventory units.

### 5. 🔄 Inter-Warehouse Stock Transfers
- Create point-to-point inventory transfers between origin and destination facilities.
- **Business Rule Enforcement**:
  - Source and destination facilities must be different.
  - Transfer quantity must be a positive integer.
  - Source warehouse must have sufficient stock (cannot transfer more than available).
  - Atomically deducts quantity from source and deposits into destination.
  - Generates audit transaction history records.

### 6. 🚚 Supplier Directory & Vendor Management
- Directory of commercial vendors with contact details, GST, and product line mappings.
- Detailed supplier profile modal displaying active supplied items and cumulative purchase order spend.
- **Vendor Protection Check**: Prevents deletion of suppliers with active or pending purchase orders.

### 7. 🛒 Purchase Orders & Inbound Receiving
- Dynamic multi-product line items with automatic unit cost calculation, subtotaling, and order summation.
- Status workflow: `Draft` ➔ `Pending` ➔ `Approved` ➔ `Received` / `Cancelled`.
- **Atomic Stock Receipt**: Marking an order as `Received` automatically updates warehouse inventory for all line items and logs `STOCK_IN` transactions.
- **Anti-Duplication**: Prevents receiving an order more than once or receiving cancelled orders.

### 8. 📈 Reports & Business Intelligence
- **8 Dedicated Tabbed Reports**:
  1. *Inventory Valuation Report* (capital distribution by merchandise line)
  2. *Product Stock Report* (complete stock status matrix)
  3. *Low Stock Alerts Report* (deficit gap calculation against threshold)
  4. *Out of Stock Report* (depleted SKU roster)
  5. *Warehouse Capacity Report* (facility load and asset values)
  6. *Stock Movement Report* (turnover analysis and audit trail)
  7. *Purchase Order Report* (procurement commitment overview)
  8. *Supplier Performance Report* (order volume and cumulative spend)
- **Real CSV Export**: Generates and downloads genuine formatted `.csv` files using client-side Blob generation with actual dataset values.

### 9. ⚙️ System Settings & Data Management
- Enterprise metadata configuration: Business Name, Address, Contact, and GSTIN.
- Global currency selection (default INR ₹) and low-stock notification threshold setting.
- **Pristine Reset**: One-click "Reset Demo Data" option with confirmation modal.
- **Data Portability**: Full JSON database export and backup restore capability.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 (Vite 6 SPA) |
| **Language** | JavaScript (ES6+ Modules) |
| **Styling** | Tailwind CSS 3.4 (Custom Navy/Slate theme) |
| **Routing** | React Router DOM 6.28 |
| **Icons** | Lucide React |
| **Charts** | Recharts 2.15 |
| **State Management** | React Context API (`InventoryContext`, `AuthContext`, `ToastContext`) |
| **Persistence** | Browser `localStorage` Service with JSON schema validation |
| **Deployment** | Vercel (`vercel.json` SPA rewrite rules) |

---

## 📁 Project Structure

*(No changes – section retained for reference.)*

## 📦 GitHub Repository Setup

1. **Create a new repository** on GitHub (public or private as you prefer).
2. In your terminal, add the remote and push the current code:
   ```bash
   cd C:\Users\Dell\.gemini\antigravity\scratch\retail-inventory-system
   git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```
   Replace `<YOUR_USERNAME>` and `<REPO_NAME>` with your GitHub username and the repository name you created.
3. Verify on GitHub that all source files (except `node_modules/` and `dist/`) are present.

## 🚀 Deploy to Vercel

There are two common ways to deploy this SPA on Vercel:

### 1️⃣ Via Vercel Dashboard (recommended for beginners)
1. Log in to the Vercel dashboard at https://vercel.com.
2. Click **"Add New Project"** → **"Import Git Repository"**.
3. Select the repository you just pushed.
4. Vercel will auto‑detect the **Vite** framework.
5. Ensure the following settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: leave blank (project root).
6. Click **Deploy**. Vercel will install dependencies, run the build, and give you a public URL (e.g., `https://your-repo-name.vercel.app`).

### 2️⃣ Via Vercel CLI (if you prefer command‑line)
```bash
npm install -g vercel   # install Vercel CLI globally (once)
vercel                 # run inside the project folder, answer prompts
vercel --prod          # deploy the production build
```
The CLI will create the same `vercel.json`‑based configuration and output a public URL.

## 🔐 Secrets & Environment Variables
- This project uses **no external APIs**, database connections, or secret keys.
- All credentials (demo admin email/password) are hard‑coded for demonstration only and are safe to be public.
- No `.env` files are present; the repository contains only client‑side code.

---
*The rest of the original README follows unchanged.*

```
retail-inventory-system/
├── index.html                    # Root HTML entry with custom SVG favicon and Inter font
├── package.json                  # Dependencies and build scripts
├── postcss.config.js             # PostCSS Tailwind plugins
├── tailwind.config.js            # Tailwind custom colors (brand & navy), fonts
├── vite.config.js                # Vite 6 React configuration
├── vercel.json                   # SPA routing fallback rewrite for Vercel
├── README.md                     # Comprehensive documentation
├── src/
│   ├── main.jsx                  # React application entry point
│   ├── App.jsx                   # Router, Context Providers & Protected Routes
│   ├── index.css                 # Global CSS and custom scrollbars
│   ├── assets/                   # Static assets
│   ├── components/
│   │   ├── common/               # Reusable enterprise UI primitives
│   │   │   ├── Badge.jsx         # Status pill with color variants
│   │   │   ├── Button.jsx        # Buttons with icons & loading state
│   │   │   ├── Card.jsx          # Styled container card with header & footer
│   │   │   ├── ConfirmDialog.jsx # Confirmation dialog for critical operations
│   │   │   ├── Input.jsx         # Form input with validation states
│   │   │   ├── Modal.jsx         # Accessible backdrop modal dialog
│   │   │   ├── Pagination.jsx    # Table page navigation
│   │   │   ├── Select.jsx        # Dropdown selection input
│   │   │   ├── StatCard.jsx      # Dashboard statistic card
│   │   │   └── Table.jsx         # Responsive data table with empty states
│   │   └── layout/
│   │       ├── AppLayout.jsx     # Master application shell
│   │       ├── Header.jsx        # Top navbar, global search, alerts menu
│   │       └── Sidebar.jsx       # Responsive collapsible navigation
│   ├── context/
│   │   ├── AuthContext.jsx       # Demo authentication state & credentials
│   │   ├── InventoryContext.jsx  # Central data layer with CRUD & business rules
│   │   └── ToastContext.jsx      # Toast alert dispatch system
│   ├── pages/
│   │   ├── Dashboard.jsx         # Analytics charts, metrics & quick actions
│   │   ├── Products.jsx          # Product catalog & SKU management
│   │   ├── Inventory.jsx         # Live stock control & audit log
│   │   ├── Warehouses.jsx        # Multi-facility management & capacity
│   │   ├── Transfers.jsx         # Inter-warehouse stock transfers
│   │   ├── Suppliers.jsx         # Vendor directory & orders
│   │   ├── PurchaseOrders.jsx    # Inbound PO creation & receiving
│   │   ├── Reports.jsx           # 8 business reports with CSV exports
│   │   └── Settings.jsx          # Business policies, reset & JSON backup
│   ├── services/
│   │   ├── exportService.js      # CSV format and client-side download utility
│   │   ├── mockData.js           # 32+ products, 3 warehouses, 6 suppliers, orders
│   │   ├── storageService.js     # Safe localStorage read/write/import/export
│   │   └── validationService.js  # Business rule validation logic
│   └── utils/
│       └── formatters.js         # Currency (INR), date, number & SKU helpers
```

---

## 🔑 Demo Administrator Credentials

The application uses a simulated local authentication system tailored for Agile capstone presentation:

- **Email**: `admin@retailflow.com`
- **Password**: `Admin@123`
- **Quick Action**: Click the **"Auto-Fill Credentials"** button on the login screen to immediately populate the form.

> *Note: This is a demonstration authentication implementation designed for academic evaluation and does not require a remote authentication backend.*

---

## 💻 Local Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) version 18.x or later
- npm version 9.x or later

### Step 1: Clone or Navigate to the Project Directory
```bash
cd retail-inventory-system
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` (or the port displayed in your terminal).

### Step 4: Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

### Step 5: Preview Production Build Locally
```bash
npm run preview
```

---

## ☁️ Deployment Instructions (Vercel)

The repository includes a pre-configured `vercel.json` file with single-page application (SPA) rewrites to guarantee seamless page refreshes and direct URL navigation without 404 errors.

### Deploying via Vercel CLI
```bash
# 1. Install Vercel CLI globally (if not already installed)
npm install -g vercel

# 2. Deploy from the project root
vercel

# 3. Deploy to production
vercel --prod
```

### Deploying via GitHub & Vercel Dashboard
1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset will auto-detect as **Vite**.
5. Keep Build Command as `npm run build` and Output Directory as `dist`.
6. Click **Deploy**. Your live site will be ready in under 60 seconds!

---

## 🧪 Verified Business Rules & Quality Assurances

1. **No Negative Stock**: Deductions through Stock Out or adjustments that would result in negative quantities are blocked with descriptive warning feedback.
2. **Transfer Integrity**: Quantities transferred from Source to Destination deduct at origin and deposit at destination atomically. The total catalog unit count remains conserved.
3. **Receiving PO Exactly Once**: Received purchase orders cannot be received again, preventing double-counting of procured inventory.
4. **Relational Deletion Protection**:
   - Cannot delete a warehouse containing active stock.
   - Cannot delete a supplier attached to active/pending purchase orders.
5. **Real-time Synchronization**: Every stock modification recalculates dashboard metrics, chart series, and valuation totals immediately.
6. **Data Persistence**: All created products, warehouses, orders, and transfers persist across browser refreshes through `localStorage`.

---

## ⚠️ Known Limitations & Future Roadmap

- **Single-client Storage**: Data is preserved per browser instance via `localStorage`. For multi-user enterprise synchronization, a REST or GraphQL backend (e.g. Node.js/Express with PostgreSQL) can easily be connected to the central service layer.
- **Simulated Auth**: Designed for Agile academic demonstration. Real production deployment would replace this with OAuth 2.0 / JWT tokens.

---

## 📄 Academic Project Details
- **Project**: Retail Inventory Management System
- **Domain**: Retail Operations & Supply Chain Analytics
- **Methodology**: Agile Scrum Framework
- **Deliverable**: Complete Production Full-Stack SPA Web Application
