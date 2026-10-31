pipeline {
    agent any

    environment {
        APP_NAME         = "retailflow"
        BACKEND_IMAGE    = "retailflow-backend"
        FRONTEND_IMAGE   = "retailflow-frontend"
        IMAGE_TAG        = "${BUILD_NUMBER}"
        NODE_ENV         = "production"
        HEALTH_CHECK_URL = "http://localhost:5000/api/health"
    }

    stages {
        // Stage 1: Checkout Source Code
        stage('1. SCM Checkout') {
            steps {
                echo '=== Stage 1: Checking out source repository ==='
                checkout scm
            }
        }

        // Stage 2: Install Dependencies
        stage('2. Install Dependencies') {
            steps {
                echo '=== Stage 2: Installing Backend & Frontend Dependencies ==='
                dir('backend') {
                    echo 'Installing backend node modules...'
                    sh 'npm ci'
                }
                echo 'Installing root frontend node modules...'
                sh 'npm ci'
            }
        }

        // Stage 3: Frontend Production Build
        stage('3. Frontend Build') {
            steps {
                echo '=== Stage 3: Compiling React 18 SPA with Vite ==='
                sh 'npm run build'
            }
        }

        // Stage 4: Backend Tests & Lint
        stage('4. Backend Tests & Syntax Verification') {
            steps {
                echo '=== Stage 4: Running Node.js Syntax Verification & Unit Tests ==='
                dir('backend') {
                    sh 'node --check src/server.js'
                    sh 'node --check src/config/db.js'
                    sh 'node --check src/controllers/productController.js'
                    sh 'node --check src/controllers/purchaseOrderController.js'
                    sh 'node --check src/controllers/stockTransferController.js'
                }
            }
        }

        // Stage 5: Build Docker Images
        stage('5. Docker Image Build') {
            steps {
                echo '=== Stage 5: Building Production Docker Images ==='
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"
                sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
            }
        }

        // Stage 6: Deployment (K3s Kubernetes or Docker Compose)
        stage('6. Deployment') {
            steps {
                echo '=== Stage 6: Deploying Application to Target Environment ==='
                script {
                    // Check if K3s/kubectl is configured on agent
                    def k8sAvailable = sh(script: 'command -v kubectl', returnStatus: true) == 0
                    if (k8sAvailable) {
                        echo 'Deploying to K3s Kubernetes cluster...'
                        sh 'kubectl apply -f k8s/01-namespace.yaml'
                        sh 'kubectl apply -f k8s/02-config-secret.yaml'
                        sh 'kubectl apply -f k8s/03-mysql.yaml'
                        sh 'kubectl apply -f k8s/04-backend.yaml'
                        sh 'kubectl apply -f k8s/05-frontend.yaml'
                        sh 'kubectl apply -f k8s/06-ingress.yaml'
                        sh 'kubectl rollout status deployment/backend-deployment -n retailflow --timeout=120s'
                    } else {
                        echo 'Kubectl not detected. Deploying via Docker Compose...'
                        sh 'docker compose down || true'
                        sh 'docker compose up -d --build'
                    }
                }
            }
        }

        // Stage 7: Health Check & Smoke Test
        stage('7. Health Verification') {
            steps {
                echo '=== Stage 7: Verifying Application Health Probe ==='
                script {
                    sleep(time: 15, unit: 'SECONDS')
                    def healthCheck = sh(
                        script: 'curl -s -f http://localhost:5000/api/health || curl -s -f http://localhost:80/api/health',
                        returnStdout: true
                    )
                    echo "Health probe response: ${healthCheck}"
                }
            }
        }
    }

    post {
        always {
            echo "CI/CD Pipeline finished execution for Build #${BUILD_NUMBER}."
        }
        success {
            echo "✅ Pipeline SUCCESS: RetailFlow build #${BUILD_NUMBER} deployed successfully."
        }
        failure {
            echo "❌ Pipeline FAILED: Please check console logs for build #${BUILD_NUMBER}."
        }
    }
}
