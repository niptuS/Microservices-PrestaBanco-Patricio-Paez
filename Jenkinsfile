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
    stage('SonarQube Analysis'){
      steps {
        withSonarQubeEnv("${env.SONARQUBE_ENV}"){
          script {
            def runCommand = { cmd -> isUnix() ? sh(cmd) : bat(cmd) }
            def lineContinuation = isUnix() ? '\\' : '^' // Detecta el carácter de continuación de línea
            def services = [
              'config-server', 'eureka-server', 'gateway-server',
              'ms-customer', 'ms-executive', 'ms-loan',
              'ms-request', 'ms-simulation'
            ]
            def sonarTasks = services.collectEntries { service ->
              ["${service}": {
                dir(service) {
                  runCommand("""
                    mvn sonar:sonar ${lineContinuation}
                    -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml ${lineContinuation}
                    -Dsonar.coverage.inclusions=**/service/*.java ${lineContinuation}
                    -Dsonar.exclusions=**/controller/** ${lineContinuation}
                    -Dsonar.externalIssuesReportPaths=target/sonar-pmd-report.json ${lineContinuation}
                    -Dsonar.dependencyCheck.jsonReportPath=dependency-check-report.json ${lineContinuation}
                    -Dsonar.dependencyCheck.htmlReportPath=dependency-check-report.html ${lineContinuation}
                    -Dsonar.dependencyCheck.xmlReportPath=dependency-check-report.xml ${lineContinuation}
                    -Dsonar.projectKey=${service} ${lineContinuation}
                    -Dsonar.projectName=${service}
                  """.stripIndent())
                }
              }]
            }
            parallel sonarTasks
          }
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
          def runCommand = { cmd -> isUnix() ? sh(cmd) : bat(cmd) }
          services.each { service ->
            dir(service) {
              runCommand("""
                docker build -t ${env.DOCKER_REGISTRY}/${service}:latest .
              """.stripIndent())
              withCredentials([usernamePassword(credentialsId: "${env.DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                def dockerLoginCommand = isUnix() ?
                  "docker login -u $DOCKER_USER -p $DOCKER_PASS" : // Unix/Linux
                  "docker login -u %DOCKER_USER% -p %DOCKER_PASS%" // Windows
                runCommand("""
                  ${dockerLoginCommand}
                  docker push ${env.DOCKER_REGISTRY}/${service}:latest
                """.stripIndent())
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

  post {
    failure {
      echo 'Error in pipeline.'
    }
    success {
      echo 'Pipeline completed successfully.'
    }
  }
}