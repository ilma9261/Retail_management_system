# Academic Capstone Project P_022: Retail Inventory Management System
## Agile Capstone Case Study & Technical Specification

**Project Code**: P_022  
**Target Architecture**: Full-Stack React + Node.js (Express) + MySQL 8.0 + Docker + K3s Kubernetes + Jenkins CI/CD + AWS  
**Project Budget**: **Strictly ₹0.00** (Open-Source & AWS Free Tier Compliant)  
**Methodology**: Agile Scrum (**Exactly 8 Epics & Exactly 15 Sprints**)  

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Modern multi-channel retail enterprises face significant operational inefficiencies due to fragmented inventory management. Typical symptoms include:
- Stock discrepancies across multi-facility geographic warehouses.
- Risk of negative stock overselling during simultaneous online and retail orders.
- Manual and error-prone inter-facility inventory transfers lacking audit trails.
- Delayed procurement order receiving leading to stockouts and lost revenue.
- High infrastructure overhead from paid cloud services that exceed project budgets.

### 1.2 Capstone Solution: RetailFlow
**RetailFlow** is an enterprise-grade Retail Inventory Management System designed to solve these problems through:
- A modern, responsive **React 18 SPA** user interface.
- A robust **Node.js Express REST API** with JWT authentication and Role-Based Access Control (RBAC).
- A normalized **MySQL 8.0 relational database** enforcing data integrity via Foreign Keys, Unique Indexes, and ACID Transactions (`START TRANSACTION`, `COMMIT`, `ROLLBACK`).
- Containerized local execution via **Docker Compose**.
- Production orchestration via **K3s (Lightweight Kubernetes)** with zero licensing fees.
- Automated release automation using a 7-stage **self-hosted Jenkins pipeline**.
- A **Strict ₹0 AWS Free Tier deployment model** on a single `t2.micro` / `t3.micro` EC2 instance with swap memory tuning.

---

## 2. Technology Stack Matrix

| Layer | Selected Technology | Version | Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend** | React.js + Vite | React 18.3 / Vite 6 | High-performance SPA with fast HMR and optimized production bundling |
| **Styling** | Tailwind CSS | 3.4 | Atomic utility design system with responsive layouts and dark/light modes |
| **Icons & Charts**| Lucide React & Recharts | Lucide 0.46 / Recharts 2.15 | Scalable SVG iconography and responsive executive analytics curves |
| **Backend** | Node.js + Express.js | Node 20 LTS / Express 4.19 | Non-blocking asynchronous REST API with modular routing and controllers |
| **Database** | MySQL Server | 8.0+ | Relational schema with ACID transaction isolation, foreign keys, and indexes |
| **DB Driver** | `mysql2` | 3.11 (`mysql2/promise`)| Connection pooling, prepared statements, and async/await syntax |
| **Auth** | JSON Web Tokens & bcryptjs | JWT 9.0 / bcryptjs 2.4 | Stateless cryptographic bearer authorization and salted password hashing |
| **Container** | Docker & Docker Compose | Docker 24+ / Compose v2 | Isolated multi-container environments across development and production |
| **Orchestration**| Kubernetes via K3s | K3s v1.28+ | Lightweight CNCF-certified Kubernetes engine suitable for 1 GB RAM nodes |
| **CI/CD** | Jenkins Automation Server | Jenkins 2.440+ LTS | 7-stage declarative pipeline (SCM checkout, build, test, docker, deploy, probe)|
| **Cloud** | Amazon Web Services (AWS) | AWS Free Tier | Single EC2 `t2.micro`/`t3.micro` instance with 2 GB Swap file (**Cost: ₹0.00**) |
| **Project Mgmt**| Jira Software | Free Tier / CSV Backlog | Agile Scrum backlog containing **Exactly 8 Epics & 15 Sprints** |

---

## 3. Relational Database Design (10 MySQL Tables)

```
                            ┌──────────────┐
                            │    users     │
                            └──────────────┘
                                   
   ┌────────────────┐       ┌──────────────┐       ┌────────────────┐
   │   categories   │◄──────┤   products   ├──────►│   suppliers    │
   └────────────────┘       └──────┬───────┘       └───────┬────────┘
                                   │                       │
                                   ▼                       ▼
   ┌────────────────┐       ┌──────────────┐       ┌────────────────┐
   │   warehouses   │◄──────┤  inventory   │       │purchase_orders │
   └───────┬────────┘       └──────────────┘       └───────┬────────┘
           │                                               │
           ▼                                               ▼
   ┌────────────────┐                             ┌────────────────┐
   │stock_transfers │                             │purchase_order_ │
   └───────┬────────┘                             │     items      │
           │                                      └────────────────┘
           ▼
   ┌────────────────┐       ┌────────────────────────┐
   │ stock_transfer_│       │ inventory_transactions │
   │     items      │       │     (Audit Ledger)     │
   └────────────────┘       └────────────────────────┘
```

### Table Dictionary
1. **`users`**: Administrative and operational users (`id`, `email`, `password_hash`, `role`, `first_name`, `last_name`, `created_at`).
2. **`categories`**: Catalog vertical categorization (`id`, `name`, `description`).
3. **`warehouses`**: Regional storage hubs (`id`, `code`, `name`, `location`, `manager_name`, `contact_number`, `storage_capacity`, `current_stock_units`, `status`).
4. **`suppliers`**: Commercial vendors (`id`, `code`, `name`, `company_name`, `email`, `phone`, `address`, `status`).
5. **`products`**: Master item records (`id`, `sku`, `name`, `description`, `category_id`, `purchase_price`, `selling_price`, `stock`, `min_stock_level`, `supplier_id`, `primary_warehouse_id`).
6. **`inventory`**: Composite matrix mapping unit distribution per warehouse (`id`, `product_id`, `warehouse_id`, `quantity`, `last_updated`).
7. **`purchase_orders`**: Inbound procurement headers (`id`, `po_number`, `supplier_id`, `target_warehouse_id`, `status`, `total_amount`, `order_date`, `expected_delivery`, `received_at`, `notes`).
8. **`purchase_order_items`**: Procurement line items (`id`, `purchase_order_id`, `product_id`, `quantity`, `unit_price`, `total_price`).
9. **`stock_transfers`**: Inter-warehouse transfer dispatches (`id`, `transfer_number`, `source_warehouse_id`, `destination_warehouse_id`, `status`, `notes`).
10. **`stock_transfer_items`**: Dispatched items per transfer (`id`, `stock_transfer_id`, `product_id`, `quantity`).
11. **`inventory_transactions`**: Immutable audit ledger (`id`, `product_id`, `warehouse_id`, `type`, `quantity`, `previous_stock`, `new_stock`, `reference_type`, `reference_id`, `notes`, `created_at`).

---

## 4. Exactly 8 Epics & 15 Sprints (Agile / Scrum Breakdown)

| Epic Code | Epic Title | Sprints Covered | Total SP |
| :--- | :--- | :--- | :--- |
| **RET-EPIC-1** | Project Initiation, Architecture & Environment Setup | Sprints 1, 2 | 20 SP |
| **RET-EPIC-2** | Authentication, Authorization & RBAC | Sprint 3 | 10 SP |
| **RET-EPIC-3** | Master Data Management (Categories, Warehouses, Suppliers) | Sprints 4, 5 | 20 SP |
| **RET-EPIC-4** | Product Catalog & Multi-Facility Inventory Tracking | Sprints 6, 7 | 20 SP |
| **RET-EPIC-5** | Inter-Warehouse Stock Transfers & Reconciliation | Sprints 8, 9 | 20 SP |
| **RET-EPIC-6** | Procurement Lifecycle & Automated Purchase Order Receiving | Sprints 10, 11 | 20 SP |
| **RET-EPIC-7** | Operational Analytics, Executive Dashboard & CSV Reporting | Sprints 12, 13 | 20 SP |
| **RET-EPIC-8** | DevOps Containerization, K3s Kubernetes, Jenkins & AWS | Sprints 14, 15 | 20 SP |

---

## 5. Docker Local Orchestration (Zero-Cost Setup)

Run the full stack locally with one command:

```bash
# Clone and enter directory
cd retail-inventory-system

# Build and start all 3 containers (MySQL 8.0 + Node API + React Frontend)
docker compose up --build -d

# Verify container health
docker compose ps
```

- **Frontend Application**: `http://localhost:80`
- **Backend Health Probe**: `http://localhost:5000/api/health`
- **MySQL Database Port**: `localhost:3306` (User: `root`, Password: `rootpassword`)

---

## 6. K3s Kubernetes Deployment (Zero-Cost Setup)

Deploying on local or cloud K3s cluster:

```bash
# 1. Apply namespace
kubectl apply -f k8s/01-namespace.yaml

# 2. Apply ConfigMap and Secrets
kubectl apply -f k8s/02-config-secret.yaml

# 3. Deploy MySQL 8.0 with Persistent Volume
kubectl apply -f k8s/03-mysql.yaml

# 4. Deploy Backend REST API (with liveness/readiness probes)
kubectl apply -f k8s/04-backend.yaml

# 5. Deploy Frontend Nginx Application
kubectl apply -f k8s/05-frontend.yaml

# 6. Apply Ingress Controller (Traefik)
kubectl apply -f k8s/06-ingress.yaml

# 7. Check rollout status
kubectl get pods -n retailflow
```

---

## 7. Jenkins CI/CD Pipeline Configuration

The included `Jenkinsfile` executes a 7-stage automated release pipeline:
1. **SCM Checkout**: Clones latest commit from GitHub repository.
2. **Install Dependencies**: Runs `npm ci` across root and backend.
3. **Frontend Build**: Builds optimized Vite production distribution.
4. **Backend Tests & Syntax**: Executes Node syntax checks on all server controllers.
5. **Docker Build**: Packages `retailflow-backend` and `retailflow-frontend` images.
6. **Deployment**: Deploys pods to K3s cluster via `kubectl apply` or Docker Compose.
7. **Health Verification**: Curls `/api/health` with automated status verification.

---

## 8. AWS Free Tier Deployment Guide (Strictly ₹0.00)

### Step 1: Launch Free Tier EC2 Instance
1. Go to **AWS EC2 Console** -> **Launch Instance**.
2. **Name**: `retailflow-server`
3. **OS**: Ubuntu 22.04 LTS (Free tier eligible).
4. **Instance Type**: `t2.micro` (or `t3.micro` if in ap-south-1).
5. **Key Pair**: Create new or select existing `.pem` key.
6. **Network Settings**: Allow SSH (22), HTTP (80), and Custom TCP (5000).
7. **Storage**: 20 GiB gp3 (within 30 GB free limit).
8. Click **Launch Instance**.

### Step 2: Configure 2 GB Swap File (Prevents Out-Of-Memory)
Connect to your EC2 instance via SSH and run:

```bash
# Create 2GB swap file on free EBS disk
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Step 3: Install Docker & Docker Compose
```bash
sudo apt update && sudo apt install -y docker.io docker-compose git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

### Step 4: Clone Repository & Run Stack
```bash
git clone https://github.com/ilma9261/Retail_management_system.git
cd Retail_management_system

# Launch production stack
sudo docker compose up --build -d

# Verify deployment
curl http://localhost/api/health
```

### Financial Audit: Total Monthly Invoiced AWS Cost = ₹0.00
- EC2 t2.micro (744 hours used / 750 free hours) = **$0.00**
- EBS 20 GB gp3 (20 GB used / 30 GB free) = **$0.00**
- Data transfer out (<5 GB used / 100 GB free) = **$0.00**
- **Net Invoiced Amount = ₹0.00**
