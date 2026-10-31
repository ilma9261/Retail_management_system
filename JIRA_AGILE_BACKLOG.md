# Capstone Case Study P_022 — Comprehensive Jira Agile/Scrum Backlog

**Project Title**: RetailFlow — Retail Inventory Management System  
**Project Key**: `RET`  
**Methodology**: Agile / Scrum (15 Two-Week Sprints)  
**Total Epics**: **Exactly 8 Epics**  
**Total Sprints**: **Exactly 15 Sprints**  
**Total Estimated Story Points**: **150 SP** (~10 SP per Sprint)  

---

## 🏛️ Part 1: Exactly 8 Scrum Epics Breakdown

| Epic ID | Epic Name | Scope & Business Objective | Target Sprints | Story Points |
| :--- | :--- | :--- | :--- | :--- |
| **RET-EPIC-1** | Project Initiation, Architecture & Environment Setup | High-level system design, relational MySQL schema drafting, technology selection, and dev environment baseline. | Sprint 1, 2 | 20 SP |
| **RET-EPIC-2** | Authentication, Authorization & RBAC | Secure user registration, bcrypt password hashing, signed JWT issuance, and role-based permissions (`admin`, `manager`, `staff`). | Sprint 3 | 10 SP |
| **RET-EPIC-3** | Master Data Management (Categories, Warehouses, Suppliers) | Enterprise administrative directories for categories, geographic storage hubs, and verified vendor contacts. | Sprint 4, 5 | 20 SP |
| **RET-EPIC-4** | Product Catalog & Multi-Facility Inventory Tracking | SKU lifecycle management, pricing, low-stock threshold triggers, and real-time per-warehouse inventory breakdown. | Sprint 6, 7 | 20 SP |
| **RET-EPIC-5** | Inter-Warehouse Stock Transfers & Ledger Reconciliation | Dispatching units between facilities, row-level locking, negative inventory guards, and atomic ledger reconciliation. | Sprint 8, 9 | 20 SP |
| **RET-EPIC-6** | Procurement Lifecycle & Automated Purchase Order Receiving | Vendor purchase orders, multi-line pricing calculations, status transitions (`Draft` → `Received`), and atomic stock increment. | Sprint 10, 11 | 20 SP |
| **RET-EPIC-7** | Operational Analytics, Executive Dashboard & CSV Reporting | Real-time KPI metric cards, Recharts visual trends (category split, monthly movement), and client-side CSV data exports. | Sprint 12, 13 | 20 SP |
| **RET-EPIC-8** | DevOps Containerization, K3s Kubernetes, Jenkins CI/CD & AWS | Docker multi-container compose, lightweight K3s orchestration, automated Jenkins pipeline, and ₹0 AWS EC2 Free Tier deployment. | Sprint 14, 15 | 20 SP |

---

## 🏃 Part 2: Exactly 15 Sprints (Complete Story, Task & Acceptance Criteria)

### 🔹 Sprint 1: Project Initiation & Architectural Modeling (10 SP)
- **Sprint Goal**: Define system requirements, functional boundaries, architectural design, and the 10-table relational MySQL schema.
- **User Story RET-101**: *As a systems architect, I want to model the relational entity-relationship schema so that data consistency is guaranteed across all inventory workflows.* (5 SP)
  - **Tasks**:
    - [x] Draft ER diagram connecting Products, Warehouses, Suppliers, POs, and Inventory.
    - [x] Write `database/schema.sql` with foreign keys, indexes, and cascade constraints.
  - **Deliverable**: Verified MySQL 8.0 DDL SQL script.
  - **Acceptance Criteria**: Script runs cleanly on MySQL 8.0 with 0 syntax errors and establishes all 10 relational tables.
- **User Story RET-102**: *As a lead developer, I want to initialize the Node.js Express repository with ES module configuration so that the team can build modular endpoints.* (5 SP)
  - **Tasks**:
    - [x] Configure `backend/package.json` with Express, mysql2, cors, and dotenv.
    - [x] Implement database connection pool with health probes in `src/config/db.js`.
  - **Deliverable**: Express entry point connecting to MySQL pool.
  - **Acceptance Criteria**: `GET /api/health` returns status `200 OK`.

---

### 🔹 Sprint 2: Frontend Catalog Baseline & Component Library (10 SP)
- **Sprint Goal**: Preserve and establish the React 18 + Vite frontend foundation with Tailwind CSS and responsive layout shell.
- **User Story RET-201**: *As a UI engineer, I want a reusable atomic design system (buttons, modals, inputs, badges) so that all views maintain strict UI consistency.* (5 SP)
  - **Tasks**:
    - [x] Integrate Tailwind CSS 3.4 and Lucide React iconography.
    - [x] Build common UI primitives: `Badge`, `Button`, `Card`, `Modal`, `Table`, `Input`.
  - **Deliverable**: Shared UI library under `src/components/common/`.
  - **Acceptance Criteria**: All components render responsively across mobile, tablet, and desktop viewports.
- **User Story RET-202**: *As an operator, I want a navigation sidebar and header layout so that I can easily switch between management modules.* (5 SP)
  - **Tasks**:
    - [x] Implement `AppLayout.jsx`, `Sidebar.jsx`, and `Header.jsx`.
    - [x] Configure React Router v6 route skeleton for all 10 management views.
  - **Deliverable**: App shell with active navigation highlighting.
  - **Acceptance Criteria**: Clicking navigation links routes instantly without full page reloads.

---

### 🔹 Sprint 3: Authentication & Role-Based Access Control (10 SP)
- **Sprint Goal**: Implement secure authentication gateway with bcrypt password hashing and JWT token verification.
- **User Story RET-301**: *As a user, I want to register and log in with email and password so that my operations are authenticated.* (6 SP)
  - **Tasks**:
    - [x] Implement `POST /api/auth/register` with bcrypt salt rounds = 10.
    - [x] Implement `POST /api/auth/login` returning signed 7-day JWT tokens.
    - [x] Build `authMiddleware.js` protecting secure API routes.
  - **Deliverable**: Working auth controller and middleware.
  - **Acceptance Criteria**: Invalid credentials return HTTP 400; valid credentials return signed JWT and user metadata.
- **User Story RET-302**: *As a demo evaluator, I want an auto-fill button on the login screen so that I can evaluate the portal in one click.* (4 SP)
  - **Tasks**:
    - [x] Connect `Login.jsx` to `AuthContext.jsx`.
    - [x] Add "Auto-Fill Credentials" filling `admin@retailflow.com` / `Admin@123`.
  - **Deliverable**: One-click demo login screen.
  - **Acceptance Criteria**: Successful login stores token in localStorage and redirects to `/`.

---

### 🔹 Sprint 4: Category & Supplier Directory Management (10 SP)
- **Sprint Goal**: Implement backend CRUD and frontend interfaces for product categories and vendor suppliers.
- **User Story RET-401**: *As a procurement manager, I want to create, update, and review suppliers so that purchasing is connected to verified vendors.* (5 SP)
  - **Tasks**:
    - [x] Implement `supplierController.js` and `/api/suppliers` REST routes.
    - [x] Add business rule preventing deletion of suppliers with active purchase orders.
  - **Deliverable**: Supplier CRUD backend endpoints.
  - **Acceptance Criteria**: Unique email constraint enforced; deletion blocked if pending POs exist.
- **User Story RET-402**: *As a catalog admin, I want to manage product categories so that catalog browsing is organized.* (5 SP)
  - **Tasks**:
    - [x] Build category table and relationship mappings to products.
    - [x] Bind category filters dynamically on frontend catalog.
  - **Deliverable**: Category dropdown selector and database tables.
  - **Acceptance Criteria**: New categories immediately become selectable in product creation forms.

---

### 🔹 Sprint 5: Multi-Facility Warehouse Management (10 SP)
- **Sprint Goal**: Provide geographical warehouse tracking with storage capacity limits and occupancy percentages.
- **User Story RET-501**: *As an operations director, I want to manage warehouse facilities and manager contacts so that logistics hubs are monitored.* (6 SP)
  - **Tasks**:
    - [x] Implement `warehouseController.js` with CRUD endpoints.
    - [x] Calculate dynamic occupancy rates: `(currentUnits / storageCapacity) * 100`.
  - **Deliverable**: Multi-warehouse API.
  - **Acceptance Criteria**: API returns occupancy percentage and prevents facility deletion if units > 0.
- **User Story RET-502**: *As a supervisor, I want visual capacity utilization progress bars on the Warehouses page so that overloaded depots are identified.* (4 SP)
  - **Tasks**:
    - [x] Bind `Warehouses.jsx` to `/api/warehouses`.
    - [x] Implement dynamic color alert badges (Green: <70%, Yellow: 70-90%, Red: >90%).
  - **Deliverable**: Live capacity progress bars.
  - **Acceptance Criteria**: Progress bars dynamically reflect sum of inventory units stored in the warehouse.

---

### 🔹 Sprint 6: Product Catalog Administration (10 SP)
- **Sprint Goal**: Build product catalog management with automatic unique SKU validation and gross margin calculations.
- **User Story RET-601**: *As a store manager, I want to create and update products with purchase and selling prices so that inventory items are tracked.* (6 SP)
  - **Tasks**:
    - [x] Implement `productController.js` with `GET`, `POST`, `PUT`, `DELETE`.
    - [x] Validate uniqueness of SKU code (case-insensitive).
  - **Deliverable**: Product CRUD API.
  - **Acceptance Criteria**: Duplicate SKU submission rejected with clear HTTP 400 error.
- **User Story RET-602**: *As a retail associate, I want search query, category filtering, and stock status filtering on the Products page.* (4 SP)
  - **Tasks**:
    - [x] Connect `Products.jsx` table with real-time text search and category filter.
    - [x] Build Product Detail modal displaying markup margin `((selling - purchase) / selling) * 100`.
  - **Deliverable**: Interactive Products catalog UI.
  - **Acceptance Criteria**: Typing in search bar instantly filters visible rows without page reload.

---

### 🔹 Sprint 7: Multi-Warehouse Inventory Tracking & Adjustments (10 SP)
- **Sprint Goal**: Track inventory breakdown per warehouse and provide manual adjustment tools with audit logging.
- **User Story RET-701**: *As an inventory controller, I want to view stock distribution across all warehouses for any SKU so that regional shortages are visible.* (5 SP)
  - **Tasks**:
    - [x] Create relational `inventory` table linking `(product_id, warehouse_id, quantity)`.
    - [x] Populate per-warehouse stock map in `/api/products` response.
  - **Deliverable**: Warehouse inventory distribution matrix.
  - **Acceptance Criteria**: Sum of warehouse stock equals total product stock.
- **User Story RET-702**: *As a warehouse auditor, I want to perform manual stock adjustments (in, out, count) with mandatory notes.* (5 SP)
  - **Tasks**:
    - [x] Implement `POST /api/inventory/adjust` with ACID transaction.
    - [x] Enforce non-negative inventory constraint (`stock >= 0`).
    - [x] Write audit log entry in `inventory_transactions`.
  - **Deliverable**: Stock adjustment modal and controller.
  - **Acceptance Criteria**: Attempting to deduct more stock than available triggers validation failure.

---

### 🔹 Sprint 8: Inter-Warehouse Stock Transfer Dispatch (10 SP)
- **Sprint Goal**: Enable supervisors to dispatch stock between warehouses with validation and transaction locking.
- **User Story RET-801**: *As a logistics coordinator, I want to create a stock transfer request between two different facilities.* (5 SP)
  - **Tasks**:
    - [x] Implement `POST /api/stock-transfers` in `stockTransferController.js`.
    - [x] Validate source warehouse has sufficient inventory units before deduction.
  - **Deliverable**: Stock transfer creation API.
  - **Acceptance Criteria**: Transfer fails if source warehouse quantity < transfer quantity.
- **User Story RET-802**: *As a supervisor, I want to initiate transfers using an intuitive modal dialog on the Transfers page.* (5 SP)
  - **Tasks**:
    - [x] Connect `Transfers.jsx` form with destination dropdowns.
    - [x] Prevent selecting identical source and destination facility.
  - **Deliverable**: Inter-warehouse transfer modal.
  - **Acceptance Criteria**: Form validation disables submit button if source equals destination.

---

### 🔹 Sprint 9: Atomic Stock Transfer Reconciliation & Audit (10 SP)
- **Sprint Goal**: Execute stock transfer balance updates atomically and write paired ledger audit records.
- **User Story RET-901**: *As a database administrator, I want stock transfers to execute inside an ACID transaction so that units are never lost or duplicated.* (6 SP)
  - **Tasks**:
    - [x] Wrap source deduction and destination addition in `conn.beginTransaction()`.
    - [x] Insert paired `TRANSFER_OUT` and `TRANSFER_IN` rows in `inventory_transactions`.
  - **Deliverable**: Atomic transfer transaction logic.
  - **Acceptance Criteria**: Any simulated failure during transfer rolls back both source and destination balances.
- **User Story RET-902**: *As an auditor, I want a historical transfer ledger on the Transfers page showing timestamps and status.* (4 SP)
  - **Tasks**:
    - [x] Bind `Transfers.jsx` table to `GET /api/stock-transfers`.
    - [x] Display Transfer ID, SKU, Quantity, Source, and Destination.
  - **Deliverable**: Transfer audit trail table.
  - **Acceptance Criteria**: Completed transfers display green "Completed" status badge.

---

### 🔹 Sprint 10: Procurement Purchase Order Creation (10 SP)
- **Sprint Goal**: Enable purchasing agents to issue purchase orders with multiple line items and automated cost calculation.
- **User Story RET-1001**: *As a purchasing agent, I want to draft a purchase order to a supplier with multiple products and unit costs.* (5 SP)
  - **Tasks**:
    - [x] Implement `POST /api/purchase-orders` with `purchase_orders` and `purchase_order_items` tables.
    - [x] Auto-calculate line item totals and order grand total.
  - **Deliverable**: Multi-item Purchase Order API.
  - **Acceptance Criteria**: Grand total equals sum of `(quantity * unit_price)` across all line items.
- **User Story RET-1002**: *As an operator, I want an interactive modal to add and remove items dynamically when building a PO.* (5 SP)
  - **Tasks**:
    - [x] Connect `PurchaseOrders.jsx` modal with dynamic item rows.
    - [x] Include product picker, quantity input, unit price input, and live total calculation.
  - **Deliverable**: Purchase order builder UI.
  - **Acceptance Criteria**: Adding or removing rows updates the calculated grand total in real-time.

---

### 🔹 Sprint 11: Purchase Order Lifecycle & Automated Receiving (10 SP)
- **Sprint Goal**: Manage PO statuses (`Draft` → `Pending` → `Approved` → `Received`) and automate stock replenishment upon receipt.
- **User Story RET-1101**: *As a warehouse receiver, I want to mark an approved PO as 'Received' so that inventory is automatically replenished.* (6 SP)
  - **Tasks**:
    - [x] Implement `PATCH /api/purchase-orders/:id/status` receiving logic.
    - [x] Atomically increment product stock and warehouse inventory for each line item.
    - [x] Prevent duplicate receiving or cancelling already received orders.
  - **Deliverable**: Automated receiving transaction.
  - **Acceptance Criteria**: Marking order as "Received" updates product inventory count and writes `STOCK_IN` audit records.
- **User Story RET-1102**: *As an inventory lead, I want quick action buttons on the Purchase Orders page to transition order status.* (4 SP)
  - **Tasks**:
    - [x] Add "Receive Order" and "Cancel" buttons with confirmation prompts.
    - [x] Render status badges: Draft (gray), Pending (yellow), Approved (blue), Received (green).
  - **Deliverable**: PO status management buttons.
  - **Acceptance Criteria**: Click "Receive Order" triggers prompt, updates UI, and displays success toast.

---

### 🔹 Sprint 12: Executive Analytics & Recharts Data Visualization (10 SP)
- **Sprint Goal**: Aggregate enterprise metrics and render responsive visual analytics curves on the Executive Dashboard.
- **User Story RET-1201**: *As an executive, I want single-endpoint KPI analytics aggregating total products, valuation, and low-stock alerts.* (5 SP)
  - **Tasks**:
    - [x] Implement `GET /api/dashboard` computing counts, units, portfolio value, and category splits.
    - [x] Add low-stock alert query identifying products where `stock <= min_stock_level`.
  - **Deliverable**: Dashboard aggregation endpoint.
  - **Acceptance Criteria**: Response returns in <100ms with accurate financial and unit totals.
- **User Story RET-1202**: *As a business analyst, I want 4 interactive Recharts charts on the Dashboard.* (5 SP)
  - **Tasks**:
    - [x] Category Distribution Donut Chart with valuation tooltips.
    - [x] Monthly Movement Bar Chart (Stock In vs Stock Out).
    - [x] Warehouse Capacity vs Occupancy Bar Chart.
  - **Deliverable**: Interactive Recharts components on `Dashboard.jsx`.
  - **Acceptance Criteria**: Charts re-render cleanly upon window resize without throwing layout errors.

---

### 🔹 Sprint 13: Reports Generation & CSV Export Engine (10 SP)
- **Sprint Goal**: Provide tabular inventory valuations and real CSV file downloads for external reporting.
- **User Story RET-1301**: *As an accountant, I want to export product inventory and transaction ledgers to CSV files.* (5 SP)
  - **Tasks**:
    - [x] Build `exportService.js` converting JSON arrays to RFC 4180 compliant CSV format.
    - [x] Trigger browser client-side download with timestamped filename.
  - **Deliverable**: CSV export utility.
  - **Acceptance Criteria**: Downloaded CSV opens cleanly in Microsoft Excel / Google Sheets with proper column headers.
- **User Story RET-1302**: *As an auditor, I want a dedicated Reports view with date filters and category summaries.* (5 SP)
  - **Tasks**:
    - [x] Connect `Reports.jsx` to live products and transaction endpoints.
    - [x] Add summary cards for total capital tied up in inventory.
  - **Deliverable**: Reports management page.
  - **Acceptance Criteria**: Clicking "Export to CSV" generates and downloads `inventory-report-<date>.csv`.

---

### 🔹 Sprint 14: Docker Compose & K3s Kubernetes Manifests (10 SP)
- **Sprint Goal**: Containerize the entire application and provide K3s manifests for lightweight Kubernetes orchestration.
- **User Story RET-1401**: *As a DevOps engineer, I want Docker Compose to orchestrate MySQL 8.0, Backend, and Frontend locally.* (5 SP)
  - **Tasks**:
    - [x] Create `docker-compose.yml` with healthchecks and auto-init SQL volume mounts.
    - [x] Verify multi-stage frontend Dockerfile with Nginx reverse proxy.
  - **Deliverable**: Zero-cost local Docker Compose stack.
  - **Acceptance Criteria**: `docker compose up --build` launches full application accessible at `http://localhost:80`.
- **User Story RET-1402**: *As a cloud engineer, I want K3s Kubernetes manifests so that the application can run on lightweight Kubernetes.* (5 SP)
  - **Tasks**:
    - [x] Create `k8s/` directory with Namespace, ConfigMap, Secrets, PVC, Deployments, and Services.
    - [x] Add Traefik Ingress routing `/api` to backend and `/` to frontend.
  - **Deliverable**: 6 production-grade Kubernetes YAML manifests.
  - **Acceptance Criteria**: `kubectl apply -f k8s/` deploys all pods with readiness probes configured.

---

### 🔹 Sprint 15: Jenkins CI/CD & Zero-Cost AWS Deployment Runbook (10 SP)
- **Sprint Goal**: Implement an automated 7-stage Jenkins pipeline and document the ₹0 AWS Free Tier deployment procedure.
- **User Story RET-1501**: *As a release manager, I want a Jenkins declarative pipeline automating checkout, testing, building, and deployment.* (5 SP)
  - **Tasks**:
    - [x] Write `Jenkinsfile` with 7 stages (Checkout, Dependencies, Build, Tests, Docker Build, Deploy, Health Check).
    - [x] Include automated curl health probe verification on `/api/health`.
  - **Deliverable**: Automated Jenkinsfile.
  - **Acceptance Criteria**: Pipeline runs stages sequentially and fails immediately if unit tests fail.
- **User Story RET-1502**: *As a student presenting the project, I want a step-by-step ₹0 AWS EC2 Free Tier deployment guide.* (5 SP)
  - **Tasks**:
    - [x] Document single-instance `t2.micro` setup with 2 GB Swap file.
    - [x] Provide exact curl commands for K3s installation and `kubectl apply` commands.
  - **Deliverable**: AWS Zero-Cost Deployment Runbook in `README.md`.
  - **Acceptance Criteria**: Runbook contains zero paid AWS services, ensuring total spend is ₹0.

---

## 📊 Summary Metrics (College Compliance Check)

| Criteria | Required by Specification | Actual in Backlog | Status |
| :--- | :--- | :--- | :--- |
| **Total Epics** | **Exactly 8** | **8 Epics (RET-EPIC-1 to RET-EPIC-8)** | ✅ **100% Compliant** |
| **Total Sprints** | **Exactly 15** | **15 Sprints (Sprint 1 to Sprint 15)** | ✅ **100% Compliant** |
| **Story Points** | Continuous estimation | **150 SP (10 SP per Sprint)** | ✅ **Balanced Velocity** |
| **Hierarchy** | Epic → Story → Task | Fully structured with Acceptance Criteria | ✅ **Jira Ready** |
| **Database** | MySQL | MySQL 8.0 with `mysql2` & transactions | ✅ **100% Compliant** |
| **Cloud** | AWS (₹0 Budget) | AWS EC2 Free Tier + K3s (No paid EKS/RDS) | ✅ **100% Compliant** |
