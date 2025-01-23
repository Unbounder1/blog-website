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
  imagePullSecrets:
  - name: docker-credentials
"""
        }
    }
    stages {
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
                                    
                                    # Clone or pull the latest code
                                    if [ ! -d "./blog-website" ]; then
                                        echo "Cloning repository..."
                                        git clone https://github.com/Unbounder1/blog-website
                                    else
                                        echo "Pulling latest changes..."
                                        cd blog-website
                                        git pull
                                    fi
                                    
                                    # Apply the Kubernetes deployment
                                    kubectl apply -f ./blog-website/script/dev-deployment -n blog-dev
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
                                    curl -v http://frontend-dev-svc.blog-dev.svc.cluster.local
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

def cleanup() {
    sh '''
    echo "Cleaning up"
    '''
}