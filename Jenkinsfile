pipeline {
    agent any 

    tools {
        nodejs 'node' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install and Build Frontend') {
            steps {
                dir('frontend') {  
                    sh 'npm install'
                    sh '''
                        unset CI
                        npm run build
                    '''
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh 'cp -r frontend/build/* /home/tom/web/qa.gruevy.com/'
            }
        }

        stage('Deploy Backend') {
            steps {
                sh 'cp -r backend/* /home/tom/web/backend_qa/'
            }
        }

        stage('Restart Service') { 
            steps {
                sh 'sudo systemctl restart devback.service'
            }
        }
    }

    post {
        success {
            echo 'Build and deployment were successful!'
        }
        failure {
            echo 'Build or deployment failed.'
        }
    }
}
