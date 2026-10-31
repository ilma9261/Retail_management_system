# AWS Production Deployment Guide — RetailFlow

This guide provides end-to-end instructions for deploying the **RetailFlow Inventory Management System** (React SPA Frontend + Express Node.js Backend + MongoDB Atlas Database) on Amazon Web Services (AWS) using containerized infrastructure.

---

## 🏗️ Architecture Overview

```
                      Internet
                         │
                         ▼
             [ Route 53 (DNS / SSL) ]
                         │
                         ▼
          [ Application Load Balancer (ALB) ]
           │                               │
           ▼ (Path: /*)                    ▼ (Path: /api/*)
[ ECS Fargate: Frontend (Nginx) ]    [ ECS Fargate: Backend (Node.js) ]
 (Port 80 -> HTML/JS/CSS assets)      (Port 5000 -> REST API / JWT)
                                                   │
                                                   ▼ TLS 1.3 / Port 27017
                                        [ MongoDB Atlas M10+ Cluster ]
                                        (Encrypted at rest + in transit)
```

### Key AWS Services Used
1. **Amazon ECS (Elastic Container Service) with AWS Fargate**: Serverless container execution for zero EC2 management.
2. **Amazon ECR (Elastic Container Registry)**: Private Docker registry for versioned container images.
3. **Application Load Balancer (ALB)**: Path-based routing (`/` to frontend, `/api/*` to backend) with AWS Certificate Manager (ACM) HTTPS SSL termination.
4. **AWS Secrets Manager & Parameter Store**: Secure storage for `MONGODB_URI` and `JWT_SECRET`.
5. **MongoDB Atlas (VPC Peering / IP Whitelisting)**: Managed MongoDB cluster with automated backups and multi-region replication.
6. **Amazon CloudWatch**: Centralized log aggregation for container stdout/stderr and latency alarms.

---

## 📋 Step-by-Step Deployment Instructions

### 1. Amazon ECR Repository Setup
Create repositories for both services:
```bash
# Authenticate Docker to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name retailflow-backend --region us-east-1
aws ecr create-repository --repository-name retailflow-frontend --region us-east-1
```

### 2. Build & Push Docker Images
```bash
# Build and push backend
docker build -t retailflow-backend:latest ./backend
docker tag retailflow-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/retailflow-backend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/retailflow-backend:latest

# Build and push frontend
docker build -t retailflow-frontend:latest .
docker tag retailflow-frontend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/retailflow-frontend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/retailflow-frontend:latest
```

### 3. Store Environment Secrets in AWS Secrets Manager
```bash
aws secretsmanager create-secret \
  --name "retailflow/production/backend" \
  --secret-string '{"MONGODB_URI":"mongodb+srv://...","JWT_SECRET":"..."}' \
  --region us-east-1
```

### 4. Configure ECS Task Definitions
Create task definitions using Fargate launch type:
- **Backend Task**: 0.5 vCPU, 1 GB RAM, Container Port 5000, Environment secrets injected from Secrets Manager.
- **Frontend Task**: 0.25 vCPU, 0.5 GB RAM, Container Port 80.

### 5. Application Load Balancer (ALB) Routing
Configure ALB listener on Port 443 (HTTPS):
- **Rule 1**: Path pattern `/api/*` -> Forward to `retailflow-backend-tg` (Health check: `/api/health`).
- **Rule 2**: Default rule `*` -> Forward to `retailflow-frontend-tg` (Health check: `/`).

### 6. MongoDB Atlas Network Access
In the MongoDB Atlas console:
1. Navigate to **Network Access** -> **IP Access List**.
2. Add the NAT Gateway Elastic IPs of the ECS VPC or configure AWS VPC Peering between the ECS VPC and Atlas VPC.

---

## 🔄 CI/CD Automation with Jenkins

The included `Jenkinsfile` automates:
1. Git checkout on commit to `main`.
2. Backend lint and dependency vulnerability scanning.
3. React production build.
4. Docker build and tagging with build numbers.
5. Pushing to Amazon ECR.
6. Triggering zero-downtime rolling deployment via `aws ecs update-service --force-new-deployment`.
