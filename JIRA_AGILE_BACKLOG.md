# Jira Agile Backlog — RetailFlow Capstone Project

**Project Name**: RetailFlow — Enterprise Retail Inventory Management  
**Project Key**: `RET`  
**Methodology**: Scrum (2-week Sprints)  
**Total Estimated Story Points**: 89 SP  

---

## 🏛️ Epic Breakdown

| Epic Key | Epic Name | Description | Total SP |
| :--- | :--- | :--- | :--- |
| **RET-EPIC-1** | Authentication & RBAC | User registration, JWT login, and role-based route guards. | 13 SP |
| **RET-EPIC-2** | Product Catalog & Categorization | Product lifecycle CRUD, unique SKU generation, and valuation tracking. | 18 SP |
| **RET-EPIC-3** | Warehouse & Stock Movement | Multi-warehouse tracking, capacity metrics, and inter-facility stock transfers. | 21 SP |
| **RET-EPIC-4** | Procurement & Purchase Orders | Vendor management, PO creation, approval lifecycles, and receipt stock-in. | 21 SP |
| **RET-EPIC-5** | Analytics & Operational Dashboard | Real-time KPI metrics, Recharts trends, low stock alerts, and CSV exports. | 16 SP |

---

## 🏃 Sprint 1: Foundation & Authentication (21 SP)

### RET-101: MongoDB Atlas Database Setup & Schema Design
- **Type**: Story | **Points**: 5 | **Priority**: High | **Epic**: RET-EPIC-1
- **User Story**: *As a backend engineer, I want to establish Mongoose domain schemas for Users, Products, Warehouses, Suppliers, Purchase Orders, and Stock Transactions, so that the application has a validated, relational-like document structure in MongoDB Atlas.*
- **Acceptance Criteria**:
  - [x] Schemas include field validations, enums, and timestamps.
  - [x] Unique index on SKU, email, and category names.
  - [x] Reference relationships established between models via ObjectId.

### RET-102: JWT Authentication API & Password Hashing
- **Type**: Story | **Points**: 5 | **Priority**: High | **Epic**: RET-EPIC-1
- **User Story**: *As a store manager or staff user, I want to securely log in with email and password to obtain a signed JWT token, so that only authorized users can access inventory operations.*
- **Acceptance Criteria**:
  - [x] `POST /api/auth/register` hashes passwords with bcrypt (salt rounds = 10).
  - [x] `POST /api/auth/login` returns signed JWT with 7-day expiration.
  - [x] Auth middleware validates Bearer token and attaches user identity to request object.

### RET-103: Frontend Login Screen & Auth Guard Integration
- **Type**: Story | **Points**: 3 | **Priority**: Medium | **Epic**: RET-EPIC-1
- **User Story**: *As a user, I want a clean, responsive login portal with one-click demo credentials and automatic redirect, so that testing and day-to-day operations are friction-free.*
- **Acceptance Criteria**:
  - [x] ProtectedRoute blocks unauthenticated access and redirects to `/login`.
  - [x] PublicRoute redirects logged-in users directly to `/`.
  - [x] "Demo Admin" auto-fill button populates pre-configured test credentials.

### RET-104: Docker Containerization for Backend & Frontend
- **Type**: Story | **Points**: 8 | **Priority**: Medium | **Epic**: RET-EPIC-1
- **User Story**: *As a DevOps engineer, I want Dockerfiles and a docker-compose orchestrator, so that the entire full-stack system can be launched locally or in cloud containers with single-command repeatability.*
- **Acceptance Criteria**:
  - [x] Backend Dockerfile builds lightweight Node alpine image.
  - [x] Frontend Dockerfile uses multi-stage build serving static assets with Nginx.
  - [x] `docker-compose.yml` networks frontend and backend with port mappings 80 and 5000.

---

## 🏃 Sprint 2: Core Inventory & Warehouse Operations (34 SP)

### RET-201: Product Catalog CRUD REST APIs
- **Type**: Story | **Points**: 8 | **Priority**: High | **Epic**: RET-EPIC-2
- **User Story**: *As an inventory manager, I want to create, read, update, and delete products with SKU, purchase price, selling price, and category, so that our catalog is always up to date.*
- **Acceptance Criteria**:
  - [x] Validation prevents duplicate SKUs.
  - [x] Initial stock creation automatically logs a `STOCK_IN` transaction.
  - [x] API populates supplier and warehouse relations.

### RET-202: Multi-Warehouse Management & Capacity Tracking
- **Type**: Story | **Points**: 8 | **Priority**: High | **Epic**: RET-EPIC-3
- **User Story**: *As an operations director, I want to register storage facilities, assign warehouse managers, and track capacity utilization, so that storage bottlenecks are prevented.*
- **Acceptance Criteria**:
  - [x] Warehouse schema includes storageCapacity and active status.
  - [x] Deletion is prevented if active stock exists in the facility.
  - [x] Occupancy percentage dynamically calculated in API.

### RET-203: Atomic Inter-Warehouse Stock Transfers
- **Type**: Story | **Points**: 10 | **Priority**: High | **Epic**: RET-EPIC-3
- **User Story**: *As a warehouse supervisor, I want to transfer stock from one warehouse to another with immediate ledger updates, so that no stock can be duplicated or lost in transit.*
- **Acceptance Criteria**:
  - [x] Validates source warehouse has sufficient stock.
  - [x] Source and destination cannot be identical.
  - [x] Emits paired `TRANSFER_OUT` and `TRANSFER_IN` audit transaction records.

### RET-204: Stock Adjustment & Manual Audit Logs
- **Type**: Story | **Points**: 8 | **Priority**: Medium | **Epic**: RET-EPIC-3
- **User Story**: *As an auditor, I want to perform manual stock adjustments (stock in, stock out, physical count adjustment) with mandatory notes, so that discrepancy reasons are permanently recorded.*
- **Acceptance Criteria**:
  - [x] Non-negative stock constraint enforced.
  - [x] Complete transaction history available via `GET /api/inventory/transactions`.

---

## 🏃 Sprint 3: Procurement, Analytics & CI/CD (34 SP)

### RET-301: Supplier Relationship Management
- **Type**: Story | **Points**: 5 | **Priority**: Medium | **Epic**: RET-EPIC-4
- **User Story**: *As a procurement officer, I want to maintain vendor records with contact details and company information, so that ordering is streamlined.*
- **Acceptance Criteria**:
  - [x] Unique company email validation.
  - [x] Deletion prevented if open purchase orders are linked.

### RET-302: Purchase Order Lifecycle & Automated Receiving
- **Type**: Story | **Points**: 8 | **Priority**: High | **Epic**: RET-EPIC-4
- **User Story**: *As a purchasing specialist, I want to issue purchase orders with multiple line items, transition statuses from Draft -> Pending -> Approved -> Received, and automatically update warehouse stock on receipt.*
- **Acceptance Criteria**:
  - [x] Total price calculated automatically per line item and total order.
  - [x] Receiving an order increments product stock and logs `STOCK_IN` audit records.
  - [x] Already received orders cannot be cancelled or received again.

### RET-303: Real-Time Executive Dashboard & Recharts Visualizations
- **Type**: Story | **Points**: 8 | **Priority**: High | **Epic**: RET-EPIC-5
- **User Story**: *As a C-level executive, I want a single-pane dashboard showing inventory valuation, low stock thresholds, monthly stock movements, and category breakdowns, so that business decisions are data-driven.*
- **Acceptance Criteria**:
  - [x] `GET /api/dashboard` aggregates key figures in single request.
  - [x] Low stock badge triggers when quantity <= minStock threshold.
  - [x] 4 responsive Recharts charts render smoothly without UI lag.

### RET-304: Jenkins CI/CD Pipeline & AWS Deployment Plan
- **Type**: Story | **Points**: 13 | **Priority**: High | **Epic**: RET-EPIC-5
- **User Story**: *As a release manager, I want an automated Jenkins pipeline that builds and tests both frontend and backend, packages Docker containers, and deploys to AWS ECS, so that code releases are zero-downtime and continuous.*
- **Acceptance Criteria**:
  - [x] Declarative Jenkinsfile with syntax check, build, and Docker stages.
  - [x] AWS Deployment documentation covering ECR, ECS Fargate, ALB, and Secrets Manager.
