pipeline {
  agent any
  tools {
    nodejs "nodejs"
    maven "maven"
  }
  stages{
    stage('Checkout SCM'){
      steps {
        checkout scm
      }
    }
    stage('Build'){
      steps {
        script {
          def runCommand = { cmd -> isUnix() ? sh(cmd) : bat(cmd)}
          def services = [
            'config-server', 'eureka-server', 'gateway-server',
            'ms-customer', 'ms-executive', 'ms-loan',
            'ms-request', 'ms-simulation', 'frontend-ms'
          ]
          def buildTasks = services.collectEntries { service ->
            ["${service}": {
              dir(service) {
                if (service == 'frontend-ms') {
                  runCommand("npm install")
                  runCommand("npm run build")
                } else {
                  runCommand("mvn clean install -DskipTests")
                }
              }
            }]
          }
          parallel buildTasks
        }
      }
    }
    stage('Docker Build and Push') {
      steps {
        script {
          def services = [
            'config-server', 'eureka-server', 'gateway-server',
            'ms-customer', 'ms-executive', 'ms-loan',
            'ms-request', 'ms-simulation', 'frontend-ms'
          ]

          services.each { service ->
            dir(service) {
              // Usa el plugin Docker Pipeline para construir
              docker.build("${env.DOCKER_REGISTRY}/${service}:latest", ".")

              // Autenticación y push con credenciales
              withCredentials([usernamePassword(
                credentialsId: "${env.DOCKER_CREDENTIALS_ID}",
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
              ]) {
                docker.withRegistry("https://${env.DOCKER_REGISTRY}", "${env.DOCKER_CREDENTIALS_ID}") {
                  docker.image("${env.DOCKER_REGISTRY}/${service}:latest").push()
                }
              }
            }
          }
        }
      }
    }

    stage('Run Docker Containers') {
      steps {
        script {
          def runCommand = { cmd -> isUnix() ? sh(cmd) : bat(cmd) }
          runCommand("""
            docker-compose || exit 0
            docker-compose up -d
          """.stripIndent())
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
    }
    success {
      echo 'Pipeline completed successfully.'
    }
  }
}