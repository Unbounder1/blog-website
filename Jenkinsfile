pipeline {
    agent {
        kubernetes {
            label 'kubectl-agent'
            yaml """
apiVersion: v1
kind: Pod
metadata:
  name: kubectl-agent
  labels:
    app: kubectl-agent
spec:
  containers:
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - sleep
    args:
    - infinity
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
                                '''
                            }
                        } catch (Exception e) {
                            echo "Error: ${e.message}"
                            currentBuild.result = 'FAILURE'
                        }
                    }
                }
            }
        }
    }
}