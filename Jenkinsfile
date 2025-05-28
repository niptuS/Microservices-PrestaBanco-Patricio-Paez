pipeline {
    agent any
    tools {
        maven "maven"
    }
    stages {
        stage('Check') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                script {
                    def services = [
                        'config-server',
                        'eureka-server',
                        'gateway-server',
                        'ms-customer',
                        'ms-executive',
                        'ms-loan',
                        'ms-request',
                        'ms-simulation',
                        'frontend-ms'
                    ]
                    services.each { service ->
                        dir(service) {
                            if (service == 'frontend-ms') {
                                bat "npm install"
                                bat "npm run build"
                            } else {
                                bat "mvn clean install -DskipTests"
                            }
                        }
                    }
                }
            }
        }
        stage('Docker Build and Push') {
            steps {
                script {
                    def services = [
                        'config-server',
                        'eureka-server',
                        'gateway-server',
                        'ms-customer',
                        'ms-executive',
                        'ms-loan',
                        'ms-request',
                        'ms-simulation',
                        'frontend-ms'
                    ]
                    services.each { service ->
                        dir(service) {
                            bat "docker build -t ${env.DOCKER_REGISTRY}/${service}:latest ."
                            withCredentials([usernamePassword(credentialsId: "${env.DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                                bat "docker login -u %DOCKER_USER% -p %DOCKER_PASS%"
                                bat "docker push ${env.DOCKER_REGISTRY}/${service}:latest"
                            }
                        }
                    }
                }
            }
        }
        stage('Run Docker Containers') {
            steps {
                script {
                    bat "docker-compose down || exit 0"
                    bat "docker-compose up -d"
                }
            }
        }
        stage('Deploy Falco Security') {
            steps {
                script {
                    bat "docker stop falco || exit 0"
                    bat "docker rm falco || exit 0"

                    bat """
                        docker run -d ^
                            --name falco ^
                            --privileged ^
                            -v //var/run/docker.sock:/host/var/run/docker.sock ^
                            -v //dev:/host/dev ^
                            -v //proc:/host/proc:ro ^
                            -v //boot:/host/boot:ro ^
                            -v //lib/modules:/host/lib/modules:ro ^
                            -v //usr:/host/usr:ro ^
                            -v //etc:/host/etc:ro ^
                            falcosecurity/falco
                    """

                    sleep(time: 10, unit: 'SECONDS')
                    bat "docker logs falco --tail 50"
                }
            }
        }
    }
    post {
        failure {
            echo 'Error in pipeline.'
            bat "docker logs falco --tail 100 || exit 0"
        }
        success {
            echo 'Pipeline completed successfully.'
            bat "docker exec falco falco --list || exit 0"
        }
    }
}