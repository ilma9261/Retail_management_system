pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "123456789012.dkr.ecr.us-east-1.amazonaws.com"
        BACKEND_IMAGE   = "retailflow-backend"
        FRONTEND_IMAGE  = "retailflow-frontend"
        IMAGE_TAG       = "${BUILD_NUMBER}"
        AWS_DEFAULT_REGION = "us-east-1"
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo 'Checking out source repository...'
                checkout scm
            }
        }

        stage('Backend Dependencies & Lint') {
            steps {
                dir('backend') {
                    echo 'Installing backend dependencies...'
                    sh 'npm ci'
                    echo 'Backend syntax and module check...'
                    sh 'node --check src/server.js'
                }
            }
        }

        stage('Frontend Dependencies & Build') {
            steps {
                echo 'Installing frontend dependencies...'
                sh 'npm ci'
                echo 'Building production bundle...'
                sh 'npm run build'
            }
        }

        stage('Security & Audit Scan') {
            steps {
                echo 'Running npm audit...'
                sh 'npm audit --audit-level=high || true'
                dir('backend') {
                    sh 'npm audit --audit-level=high || true'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Backend Docker Image...'
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"

                echo 'Building Frontend Docker Image...'
                sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
            }
        }

        stage('Push to AWS ECR') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo 'Authenticating with AWS ECR...'
                    sh 'aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${DOCKER_REGISTRY}'
                    
                    echo 'Tagging and pushing Backend image...'
                    sh "docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker tag ${BACKEND_IMAGE}:latest ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest"
                    sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest"

                    echo 'Tagging and pushing Frontend image...'
                    sh "docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker tag ${FRONTEND_IMAGE}:latest ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest"
                    sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest"
                }
            }
        }

        stage('Deploy to AWS ECS') {
            when {
                branch 'main'
            }
            steps {
                echo 'Triggering rolling deployment to AWS ECS Cluster...'
                sh 'aws ecs update-service --cluster retailflow-cluster --service retailflow-backend-svc --force-new-deployment --region ${AWS_DEFAULT_REGION}'
                sh 'aws ecs update-service --cluster retailflow-cluster --service retailflow-frontend-svc --force-new-deployment --region ${AWS_DEFAULT_REGION}'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "CI/CD Pipeline succeeded for build #${BUILD_NUMBER}!"
        }
        failure {
            echo "CI/CD Pipeline failed for build #${BUILD_NUMBER}. Please check logs."
        }
    }
}
