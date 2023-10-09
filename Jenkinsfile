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
                sh 'cp -r frontend/build/* /home/tom/web/dev.gruevy.com/'
            }
        }

        stage('Deploy Backend') {
            steps {
                sh 'cp -r backend/* /home/tom/web/backend_dev/'
            }
        }

        stage('Stop Service') { 
            steps {
                sh 'sudo systemctl stop devback.service'
            }
        }

        stage('Database Operations') {
            steps {
                sh '''
                    export PGPASSWORD=Raccoon1
                    psql -U jenkins -h localhost -d postgres -c "DROP DATABASE IF EXISTS dev;"
                    psql -U jenkins -h localhost -d postgres -c "DROP USER IF EXISTS dev;"
                    psql -U jenkins -h localhost -d postgres -c "CREATE DATABASE dev;"
                    psql -U jenkins -h localhost -d postgres -c "CREATE USER dev WITH PASSWORD 'Raccoon1';"
                    psql -U jenkins -h localhost -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE dev TO dev;"
                '''
                sh '''
                    export PGPASSWORD=Raccoon1
                    psql -U jenkins -h localhost -d dev -f /home/tom/web/backend_dev/init.sql
                '''
            }
        }

        stage('Start Service') { 
            steps {
                sh 'sudo systemctl start devback.service'
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