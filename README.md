# RetailFlow — Enterprise Retail Inventory Management System

[![Node.js](https://img.shields.io/badge/Backend-Node.js%2020%20%7C%20Express-339933.svg?logo=node.js)](https://nodejs.org)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20Mongoose-47A248.svg?logo=mongodb)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%206-61DAFB.svg?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind%203.4-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Containers-Docker%20%7C%20Compose-2496ED.svg?logo=docker)](https://www.docker.com)
[![Jenkins](https://img.shields.io/badge/CI%2FCD-Jenkins%20Pipeline-D24939.svg?logo=jenkins)](https://www.jenkins.io)
[![AWS](https://img.shields.io/badge/Cloud-AWS%20ECS%20Fargate-FF9900.svg?logo=amazon-aws)](https://aws.amazon.com)

**RetailFlow** is a complete, enterprise-grade, full-stack Retail Inventory Management System designed to streamline product catalog management, multi-warehouse logistics, purchase order procurement lifecycles, and real-time operational analytics for modern retail enterprises.

---

## 🏗️ Architecture & Technology Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                    Client Browser                      │
   │      React 18 SPA + Vite 6 + Tailwind CSS + Recharts    │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / JSON (JWT Auth)
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             Backend REST API Server (Node / Express)   │
   │  Controllers, Routers, Mongoose ORM, bcrypt, JWT Auth  │
   └───────────────────────────┬────────────────────────────┘
                               │ TLS 1.3 / Port 27017
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             MongoDB Atlas Cloud Database               │
   │  Collections: Users, Products, Warehouses, Suppliers,  │
   │      PurchaseOrders, StockTransfers, Transactions      │
   └────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, React Router v6, Tailwind CSS, Lucide React Icons, Recharts data visualization.
- **Backend**: Node.js 20, Express 4, Mongoose 8 (MongoDB Atlas ODM), JSON Web Tokens (JWT), bcryptjs password hashing.
- **Database**: MongoDB Atlas Cloud Cluster.
- **DevOps**: Docker, Docker Compose, Jenkins CI/CD Pipeline, AWS ECS Fargate, Amazon ECR, Application Load Balancer.

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Active MongoDB Atlas Cluster (connection URI configured)

### 1. Backend Setup & Seed

```bash
cd backend
npm install

# Verify your backend/.env has the following:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.../retailflow
# JWT_SECRET=<secure_random_hex>
# PORT=5000

# Seed the database with initial demo data (users, products, warehouses, suppliers):
npm run seed

# Start the backend server:
npm run dev
# Server will run on http://localhost:5000
```

### 2. Frontend Setup

In another terminal window:

```bash
# In the project root:
npm install

# Start Vite dev server:
npm run dev
# Frontend will run on http://localhost:5173
```

### 3. Demo Login Credentials

The database is seeded with ready-to-use accounts:
- **Email**: `admin@retailflow.com`
- **Password**: `Admin@123`
- **Role**: Admin

*(A convenient "Auto-Fill Credentials" button is available directly on the login screen for instant access.)*

---

## 🐳 Docker Setup

To run both frontend and backend in isolated production containers using Docker Compose:

```bash
# Build and start all services:
docker-compose up --build -d

# Check service health:
docker-compose ps

# Access the application:
# Frontend: http://localhost:80
# Backend API: http://localhost:5000/api/health
```

---

## 📡 REST API Reference

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | GET | No | Backend health check probe |
| `/api/auth/register` | POST | No | Register new user account |
| `/api/auth/login` | POST | No | Authenticate user & return JWT token |
| `/api/dashboard` | GET | Yes | Aggregated KPI stats, charts, & metrics |
| `/api/products` | GET / POST | Yes | List all products / Create new product |
| `/api/products/:id` | GET / PUT / DELETE | Yes | Product details / Update / Delete |
| `/api/warehouses` | GET / POST | Yes | List / Register warehouse facilities |
| `/api/warehouses/:id` | GET / PUT / DELETE | Yes | Warehouse details / Update / Delete |
| `/api/suppliers` | GET / POST | Yes | List / Register vendor suppliers |
| `/api/suppliers/:id` | GET / PUT / DELETE | Yes | Supplier details / Update / Delete |
| `/api/purchase-orders` | GET / POST | Yes | List / Create procurement purchase orders |
| `/api/purchase-orders/:id/status` | PATCH | Yes | Transition PO status (Approved, Received) |
| `/api/stock-transfers` | GET / POST | Yes | Transfer stock between warehouses atomically |
| `/api/inventory` | GET | Yes | Inventory catalog overview |
| `/api/inventory/transactions` | GET | Yes | Complete audit ledger of all stock movements |
| `/api/inventory/adjust` | POST | Yes | Manual stock adjustments (in, out, count) |

---

## 🔒 Security & Environment Configuration

### Backend `.env` (`backend/.env`)
```ini
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.g9etklb.mongodb.net/retailflow?retryWrites=true&w=majority
JWT_SECRET=b1c06b140e1770e98e5d5ca03b3538cc50a9a73e9efc43558cc2ad6dfa315b1640e15da679e6282631f32b8c4ed7e81ebe4bfb74aa74d23b4b53fae1cc949279
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend `.env` (`.env`)
```ini
VITE_API_URL=http://localhost:5000/api
```

> **Security Note**: Both root and backend `.gitignore` strictly ignore `.env` files. Secrets are never checked into version control.

---

## ☁️ Cloud & DevOps Deliverables

- **AWS Production Deployment**: See [AWS_DEPLOYMENT.md](file:///C:/Users/Dell/.gemini/antigravity/scratch/retail-inventory-system/AWS_DEPLOYMENT.md) for AWS ECS Fargate, ECR, ALB, and Secrets Manager architecture.
- **CI/CD Pipeline**: See [Jenkinsfile](file:///C:/Users/Dell/.gemini/antigravity/scratch/retail-inventory-system/Jenkinsfile) for automated test, build, containerization, and AWS deployment.
- **Agile Scrum Backlog**: See [JIRA_AGILE_BACKLOG.md](file:///C:/Users/Dell/.gemini/antigravity/scratch/retail-inventory-system/JIRA_AGILE_BACKLOG.md) for 5 Epics, 11 User Stories, Acceptance Criteria, and Story Point estimations.
