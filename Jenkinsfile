pipeline {
    agent {
        docker {
            image 'bitnami/kubectl:latest'
            args '-v /root/.kube:/root/.kube' // Mount kubeconfig if needed
        }
    }
    environment {
        KUBECONFIG = '/root/.kube/config'
    }
    stages {
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'k8s-token', variable: 'K8S_TOKEN')]) {
                        // Set up kubectl with the token
                        sh '''
                        kubectl config set-cluster my-cluster --server=https://kubernetes.default.svc --insecure-skip-tls-verify=true
                        kubectl config set-credentials jenkins-user --token=$K8S_TOKEN
                        kubectl config set-context my-context --cluster=my-cluster --user=jenkins-user
                        kubectl config use-context my-context
                        '''
                        
                        sh 'kubectl get pods -n default'
                    }
                }
            }
        }
    }
}