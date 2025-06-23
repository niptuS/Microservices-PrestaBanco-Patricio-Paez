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
    stage('OWASP Dependency Check'){
      steps {
        script {
          def runCommand = { cmd -> isUnix() ? sh(cmd) : bat(cmd)}
          def services = [
            'config-server', 'eureka-server', 'gateway-server',
            'ms-customer', 'ms-executive', 'ms-loan',
            'ms-request', 'ms-simulation', 'frontend-ms'
          ]
          services.each { service ->
            dir(service) {
              dependencyCheck(
                additionalArguments: '''
                --scan .
                --format JSON
                --disableYarnAudit
                --prettyPrint
                ''',
                nvdCredentialsId: 'token-nvd-api-key',
                odcInstallation: 'owasp-dc-devsecops-pep3'
              )
              dependencyCheckPublisher(
                pattern: '**/dependency-check-report.xml'
              )
            }
          }
        }
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
    stage('Unit Testing'){
      steps {
        script {
          def runCommand = {cmd -> isUnix() ? sh(cmd) : bat(cmd)}
          def services = [
            'ms-customer', 'ms-executive', 'ms-loan',
            'ms-request', 'ms-simulation'
          ]
          def testTasks = services.collectEntries { service ->
            ["${service}": {
              dir(service) {
                runCommand("mvn test jacoco:report")
              }
            }]
          }
          parallel testTasks
        }
      }
    }
    stage('PMD Analysis'){
      steps {
        script {
          def runCommand = { cmd -> isUnix() ? sh(cmd) : bat(cmd) }
          def services = [
            'config-server', 'eureka-server', 'gateway-server',
            'ms-customer', 'ms-executive', 'ms-loan',
            'ms-request', 'ms-simulation'
          ]

          def pmdTasks = services.collectEntries { service ->
            ["${service}": {
              dir(service) {
                runCommand("mvn pmd:pmd")
              }
            }]
          }
          parallel pmdTasks

          services.each { service -> 
            dir(service){
              runCommand("python ${env.WORKSPACE}\\PMD_TO_SQ.py")
            }
          }
        }
      }
    }
    stage('SonarQube Analysis'){
      steps {
        withSonarQubeEnv("${env.SONARQUBE_ENV}"){
          script {
            def runCommand = { cmd -> isUnix() ? sh(cmd) : bat(cmd) }
            def services = [
              'config-server', 'eureka-server', 'gateway-server',
              'ms-customer', 'ms-executive', 'ms-loan',
              'ms-request', 'ms-simulation'
            ]
            def sonarTasks = services.collectEntries { service ->
              ["${service}": {
                dir(service) {
                  runCommand("""
                    mvn sonar:sonar ^
                    -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml ^
                    -Dsonar.coverage.inclusions=**/service/*.java ^
                    -Dsonar.exclusions=**/controller/** ^
                    -Dsonar.externalIssuesReportPaths=target/sonar-pmd-report.json
                    -Dsonar.dependencyCheck.jsonReportPath=dependency-check-report.json ^
                    -Dsonar.dependencyCheck.htmlReportPath=dependency-check-report.html ^
                    -Dsonar.dependencyCheck.xmlReportPath=dependency-check-report.xml ^
                    -Dsonar.projectName=${service} ^
                    -Dsonar.projectKey=${service}
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
    stage('Trivy Scan'){
      steps {
        script {
          def runCommand = { cmd -> isUnix() ? sh(cmd) : bat(".\\${cmd}") }
          def services = [
            'config-server', 'eureka-server', 'gateway-server',
            'ms-customer', 'ms-executive', 'ms-loan',
            'ms-request', 'ms-simulation', 'frontend-ms'
          ]
          services.each { service ->
            dir(service) {
              runCommand("""
                trivy image --exit-code 1 --severity HIGH,CRITICAL ${env.DOCKER_REGISTRY}/${service}:latest || exit 0
              """.stripIndent())
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
  post {
    failure {
      echo 'Error in pipeline.'
    }
    success {
      echo 'Pipeline completed.'
    }
  }
}