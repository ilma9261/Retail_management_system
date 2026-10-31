# RetailFlow — Retail Inventory Management System
### Academic Capstone Project P_022 (Agile Capstone Case Study)

[![Technology](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MySQL-blue.svg)](https://react.dev)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0%20%7C%20mysql2-orange.svg?logo=mysql)](https://www.mysql.com)
[![DevOps](https://img.shields.io/badge/DevOps-Docker%20%7C%20K3s%20Kubernetes-326CE5.svg?logo=kubernetes)](https://k3s.io)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins%20Pipeline-D24939.svg?logo=jenkins)](https://www.jenkins.io)
[![Agile](https://img.shields.io/badge/Agile-8%20Epics%20%7C%2015%20Sprints-green.svg)](JIRA_AGILE_BACKLOG.md)
[![Cloud](https://img.shields.io/badge/Cloud-AWS%20Free%20Tier%20(₹0)-FF9900.svg?logo=amazon-aws)](CAPSTONE_SPECIFICATION_P022.md)

**RetailFlow** is a production-ready, full-stack Retail Inventory Management System built to fulfill the college capstone specification **P_022**. It features a modern React 18 single-page application, an Express.js REST API using `mysql2`, a normalized 10-table MySQL 8.0 relational schema with ACID database transactions, Docker containerization, lightweight K3s Kubernetes manifests, an automated Jenkins CI/CD pipeline, and a Jira Agile backlog structured into **exactly 8 Epics and 15 Sprints**.

---

## 🏛️ System Architecture

```
   ┌────────────────────────────────────────────────────────┐
   │                    Client Browser                      │
   │      React 18 SPA + Vite 6 + Tailwind CSS + Recharts    │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / JSON (JWT Auth)
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             Backend REST API Server (Node / Express)   │
   │      mysql2 Pool, Controllers, JWT Auth, Transactions   │
   └───────────────────────────┬────────────────────────────┘
                               │ TCP / Port 3306 (ACID)
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             MySQL 8.0 Relational Database              │
   │  10 Relational Tables: users, products, categories,    │
   │  warehouses, inventory, suppliers, purchase_orders,    │
   │  po_items, stock_transfers, stock_transfer_items, txns │
   └────────────────────────────────────────────────────────┘
```

---

## 📋 Technology Specification Compliance

| Requirement | Required by College | Implemented Solution |
| :--- | :--- | :--- |
| **Frontend** | React / Angular / Vue | **React.js 18 + Vite 6 + Tailwind CSS** |
| **Backend** | Node.js or Java Spring Boot | **Node.js 20 LTS + Express.js 4** |
| **Database** | MySQL or PostgreSQL | **MySQL 8.0** using `mysql2/promise` with ACID transactions |
| **DevOps** | Docker / Kubernetes | **Docker Compose** & **K3s Kubernetes** manifests |
| **CI/CD** | Jenkins | **Jenkinsfile** (7-stage automated declarative pipeline) |
| **Project Mgmt** | Jira | **Jira CSV Backlog** with **Exactly 8 Epics & 15 Sprints** |
| **Cloud** | AWS or Azure | **AWS EC2 Free Tier** (`t2.micro`/`t3.micro`) with **Strict ₹0 Budget** |

---

## ⚡ Quick Start: Local Execution with Docker Compose

Run the entire application (MySQL 8.0 + Node Backend + React Frontend) with one command:

```bash
# 1. Clone the repository
git clone https://github.com/ilma9261/Retail_management_system.git
cd Retail_management_system

# 2. Start the full-stack container environment
docker compose up --build -d

# 3. Check running containers
docker compose ps
```

- **Frontend Application**: `http://localhost:80`
- **Backend API Health Probe**: `http://localhost:5000/api/health`
- **MySQL Database**: `localhost:3306` (User: `root`, Password: `rootpassword`, Database: `retailflow_db`)

### Default Demo Credentials
- **Email**: `admin@retailflow.com`
- **Password**: `Admin@123`
- *(Or click the one-click **"Auto-Fill Credentials"** button directly on the login screen.)*

---

## ☸️ Lightweight K3s Kubernetes Deployment

Deploy the application to any K3s or Kubernetes cluster:

```bash
# 1. Create dedicated namespace
kubectl apply -f k8s/01-namespace.yaml

# 2. Create ConfigMap and Secrets
kubectl apply -f k8s/02-config-secret.yaml

# 3. Deploy MySQL 8.0 with Persistent Volume Claim
kubectl apply -f k8s/03-mysql.yaml

# 4. Deploy Backend REST API (with health & readiness probes)
kubectl apply -f k8s/04-backend.yaml

# 5. Deploy Frontend Nginx Application
kubectl apply -f k8s/05-frontend.yaml

# 6. Apply Ingress (Traefik)
kubectl apply -f k8s/06-ingress.yaml

# 7. Check pod status
kubectl get pods -n retailflow
```

---

## 🔄 Jenkins CI/CD Pipeline

The included [`Jenkinsfile`](Jenkinsfile) runs automated builds for free self-hosted Jenkins instances:
1. **SCM Checkout**: Clones latest Git commit.
2. **Install Dependencies**: Runs `npm ci` for backend and frontend.
3. **Frontend Build**: Compiles production React distribution via Vite.
4. **Backend Tests**: Syntax verification and route checks.
5. **Docker Build**: Builds and tags `retailflow-backend` and `retailflow-frontend` images.
6. **Deployment**: Deploys to K3s cluster via `kubectl apply` or Docker Compose.
7. **Health Verification**: Curls `/api/health` with automated status verification.

---

## ☁️ AWS Free Tier Deployment (Strictly ₹0.00)

See [`CAPSTONE_SPECIFICATION_P022.md`](CAPSTONE_SPECIFICATION_P022.md) for the exact step-by-step AWS deployment procedure:
- Uses **1 single `t2.micro` or `t3.micro` EC2 instance** (750 free hours/month).
- Uses **20 GB gp3 EBS root volume** (within 30 GB free allowance).
- Configures a **2 GB Swap file** on the EBS volume to support K3s, MySQL, Node, and Nginx on 1 GB physical RAM without memory crashes.
- **Zero paid services**: No paid Amazon EKS ($73/mo), no paid RDS, no paid Load Balancers ($18/mo), and no NAT Gateways.
- **Total Monthly Cost: ₹0.00**.

---

## 📊 Agile Scrum Backlog (Exactly 8 Epics & 15 Sprints)

The complete Scrum backlog is detailed in [`JIRA_AGILE_BACKLOG.md`](JIRA_AGILE_BACKLOG.md) and importable into Jira via [`jira-backlog-p022.csv`](jira-backlog-p022.csv):
- **RET-EPIC-1**: Project Initiation, Architecture & Environment Setup (Sprints 1, 2)
- **RET-EPIC-2**: User Authentication, Authorization & RBAC (Sprint 3)
- **RET-EPIC-3**: Master Data Management (Categories, Warehouses, Suppliers) (Sprints 4, 5)
- **RET-EPIC-4**: Product Catalog & Multi-Facility Inventory Tracking (Sprints 6, 7)
- **RET-EPIC-5**: Inter-Warehouse Stock Transfers & Reconciliation (Sprints 8, 9)
- **RET-EPIC-6**: Procurement Lifecycle & Automated Purchase Order Receiving (Sprints 10, 11)
- **RET-EPIC-7**: Operational Analytics, Executive Dashboard & CSV Reporting (Sprints 12, 13)
- **RET-EPIC-8**: DevOps Containerization, K3s Kubernetes, Jenkins & AWS (Sprints 14, 15)
