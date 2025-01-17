pipeline {
    agent {
        kubernetes {
            yaml """
            apiVersion: v1
            kind: Pod
            metadata:
              labels:
                jenkins: kubectl
            spec:
              containers:
              - name: kubectl
                image: bitnami/kubectl:latest
                command:
                - cat
                tty: true
                volumeMounts:
                - name: kube-config
                  mountPath: /root/.kube
              volumes:
              - name: kube-config
                hostPath:
                  path: /root/.kube
            """
        }
    }
    environment {
        KUBECONFIG = '/root/.kube/config'
    }
    stages {
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    withCredentials([string(credentialsId: 'k8s-token', variable: 'K8S_TOKEN')]) {
                        script {
                            // Set up kubectl with the token
                            sh '''
                            kubectl config set-cluster my-cluster --server=https://kubernetes.default.svc --insecure-skip-tls-verify=true
                            kubectl config set-credentials jenkins-user --token=$K8S_TOKEN
                            kubectl config set-context my-context --cluster=my-cluster --user=jenkins-user
                            kubectl config use-context my-context
                            '''
                            
                            // Run kubectl commands
                            sh 'kubectl get pods -n default'
                        }
                    }
                }
            }
        }
    }
}