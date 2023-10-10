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

        stage('Stop Service') { 
            steps {
                sh 'sudo systemctl stop qaback.service'
            }
        }

        stage('Remake Database') {
            steps {
                sh '''
                    export PGPASSWORD=Raccoon1
                    psql -U jenkins -h localhost -d postgres -c "DROP DATABASE IF EXISTS qa;"
                    psql -U jenkins -h localhost -d postgres -c "DROP USER IF EXISTS qa;"
                    psql -U jenkins -h localhost -d postgres -c "CREATE DATABASE qa;"
                    psql -U jenkins -h localhost -d postgres -c "CREATE USER qa WITH PASSWORD 'Raccoon1';"
                    psql -U jenkins -h localhost -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE qa TO qa;"
                '''
            }
        }
        stage('Start Service') { 
            steps {
                sh 'sudo systemctl start qaback.service'
            }
        }
        stage('Wait for DB Initialization') {
            steps {
                sh 'sleep 30'
            }
        }
        stage('Populate Database Test Data') {
            steps {
                sh '''
                    export PGPASSWORD=Raccoon1
                    psql -U jenkins -h localhost -d qa -f /home/tom/web/backend_qa/init.sql
                '''
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
