pipeline {
    agent {
        kubernetes {
            label 'kubectl-agent'
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: kubectl-agent
spec:
  containers:
  - name: kubectl
    image: d3fk/kubectl
    command:
    - cat
    tty: true
    volumeMounts:
    - name: kubeconfig
      mountPath: /root/.kube
  volumes:
  - name: kubeconfig
    hostPath:
      path: /home/jenkins/.kube
      type: Directory
"""
        }
    }
    stages {
        stage('Deploy to Kubernetes') {
            steps {
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