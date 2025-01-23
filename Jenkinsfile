pipeline {
    agent {
        kubernetes {
            label 'astro-blog-dep'
            yaml """
apiVersion: v1
kind: Pod
metadata:
  name: astro-blog-dep
spec:
  containers:
  - name: docker
    image: docker.io/docker:latest
    tty: true
    securityContext:
        runAsUser: 0
    stdin: true
    command:
    - sleep
    args:
    - infinity
    volumeMounts:
    - name: github-repo-volume
      mountPath: /workspace/github-repo
  - name: kubectl
    image: docker.io/bitnami/kubectl:latest
    tty: true
    securityContext:
        runAsUser: 0
    stdin: true
    command:
    - sleep
    args:
    - infinity
    volumeMounts:
    - name: github-repo-volume
      mountPath: /workspace/github-repo
  - name: network-test
    image: docker.io/nicolaka/netshoot:latest
    tty: true
    securityContext:
        runAsUser: 0
    stdin: true
    command:
    - sleep
    args:
    - infinity
  volumes:
  - name: github-repo-volume
    emptyDir: {}
  imagePullSecrets:
  - name: docker-credentials
"""
        }
    }
    environment {
        GITHUB_REPO = "https://github.com/Unbounder1/blog-website.git"
        CLONE_DIR = "/workspace/github-repo"
        REGISTRY_URL = "localhost:5000" 
    stages {
        stage('Clone GitHub Repository') {
            steps {
                container('kubectl') {
                    script {
                        sh '''
                            echo "Cloning GitHub repository..."
                            if [ ! -d "${CLONE_DIR}" ]; then
                                mkdir -p ${CLONE_DIR}
                            fi
                            git clone ${GITHUB_REPO} ${CLONE_DIR}
                        '''
                    }
                }
            }
        }
        stage('Build and Deploy Docker Image') {
            steps {
                container('docker') {
                    script {
                        sh '''
                        ${CLONE_DIR}/dev-deployment/docker-build.sh docker all
                        '''
                        
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') { 
                    script {
                        try {
                            withKubeConfig([credentialsId: 'k8s-token', serverUrl: 'https://kubernetes.default.svc']) {
                                sh '''
                                    echo "Current Kubernetes Context:"
                                    kubectl config current-context
                                    
                                    echo "Getting all resources in blog-dev namespace:"
                                    kubectl get all -n blog-dev
                                    
                                    echo "Applying Kubernetes deployment..."
                                    kubectl apply -f ${CLONE_DIR}/script/dev-deployment -n blog-dev
                                '''
                            }
                        } catch (Exception e) {
                            echo "Error during deployment: ${e.message}"
                            currentBuild.result = 'FAILURE'
                        }
                    }
                }
            }
        }
        stage('Testing Connectivity') {
            steps {
                container('network-test') {
                    script {
                        try {
                            withKubeConfig([credentialsId: 'k8s-token', serverUrl: 'https://kubernetes.default.svc']) {
                                sh '''
                                    echo "Testing connectivity to frontend service:"
                                    curl -v http://frontend-dev-svc.blog-dev.svc.cluster.local:4321
                                '''
                            }
                        } catch (Exception e) {
                            echo "Connectivity test failed: ${e.message}"
                            currentBuild.result = 'FAILURE'
                        }
                    }
                }
            }
        }
    }
}