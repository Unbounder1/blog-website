pipeline {
    agent any
    environment {
        KUBECONFIG = '/root/.kube/config'
    }
    stages {
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'k8s-token', serverUrl: 'https://kubernetes.default.svc']) {
                    sh 'kubectl get all -n blog-dev'
                }
            }  
        }
    }
}