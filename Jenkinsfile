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
                sh 'sudo systemctl stop devback.service'
            }
        }

        stage('Remake Database') {
            steps {
                sh '''
                    export PGPASSWORD=Raccoon1
                    psql -U jenkins -h localhost -d postgres -c "DROP DATABASE IF EXISTS dev;"
                    psql -U jenkins -h localhost -d postgres -c "DROP USER IF EXISTS dev;"
                    psql -U jenkins -h localhost -d postgres -c "CREATE DATABASE dev;"
                    psql -U jenkins -h localhost -d postgres -c "CREATE USER dev WITH PASSWORD 'Raccoon1';"
                    psql -U jenkins -h localhost -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE dev TO dev;"
                '''
            }
        }
        stage('Start Service') { 
            steps {
                sh 'sudo systemctl start devback.service'
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
                    psql -U jenkins -h localhost -d dev -f /home/tom/web/backend_dev/init.sql
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
