pipeline {
  agent any
  environment {
    // ZAP Configuration
    ZAP_VERSION = '2.16.1'
    ZAP_API_KEY = "${UUID.randomUUID().toString()}"
    ZAP_HOME = "${env.WORKSPACE}/.security-cache/zap"
  }
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
    stage('Build + OWASP Dependency Check'){
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
        script {
          def runCommand = { cmd -> isUnix() ? sh(cmd) : bat(cmd) }
          def pythonCmd = isUnix() ? "python3" : "python"
          runCommand("""
            ${pythonCmd} -c '
              import json
              with open("dependency-check-report.json", "r") as file:
                data = json.load(file)
              if "cvssv4 in data":
                del data["cvssv4"]
              with open("dependency-check-report.json", "w") as file:
                json.dump(data, file, indent=4)
            '
          """)
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
            dir(service) {
              def pythonCmd = isUnix() ? "python3" : "python"
              runCommand("${pythonCmd} ${env.WORKSPACE}${isUnix() ? '/' : '\\'}PMD_TO_SQ.py")
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
    /*
    stage('Trivy Scan'){
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
              if (isUnix()) {
                def trivyOutput = sh(script: "trivy image --severity HIGH,CRITICAL --exit-code 1 --no-progress ${env.DOCKER_REGISTRY}/${service}:latest", returnStdout: true).trim()
                println trivyOutput
              } else {
                def trivyOutput = bat(script: "trivy image --severity HIGH,CRITICAL --exit-code 1 --no-progress ${env.DOCKER_REGISTRY}/${service}:latest", returnStdout: true).trim()
                println trivyOutput
              }
            }
          }
        }
      }

    }*/
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
  // DAST or other stages...
    stage('DAST with OWASP ZAP') {
    steps {
        script {
        if (isUnix()) {
            // Linux commands
            sh '''
                if [ ! -d "$WORKSPACE/.security-cache/zap/ZAP_${ZAP_VERSION}" ]; then
                    echo "Installing OWASP ZAP..."
                    mkdir -p $WORKSPACE/.security-cache/zap
                    cd $WORKSPACE/.security-cache/zap
                    wget -q https://github.com/zaproxy/zaproxy/releases/download/v${ZAP_VERSION}/ZAP_${ZAP_VERSION}_Linux.tar.gz
                    tar -xzf ZAP_${ZAP_VERSION}_Linux.tar.gz
                    chmod +x ZAP_${ZAP_VERSION}/zap.sh
                fi
            '''
            sh '''
                echo "Starting ZAP daemon..."
                $WORKSPACE/.security-cache/zap/ZAP_${ZAP_VERSION}/zap.sh -daemon -host 0.0.0.0 -port 8090 -config api.key=${ZAP_API_KEY} &
                ZAP_PID=$!
                echo $ZAP_PID > zap.pid
                timeout 60 bash -c 'until curl -s http://localhost:8090 >/dev/null; do sleep 2; done'
            '''
            sh '''
                echo "Running ZAP baseline scan..."
                python3 $WORKSPACE/.security-cache/zap/ZAP_${ZAP_VERSION}/zap-baseline.py \
                -t http://localhost:8080 \
                -g gen.conf \
                -r zap-baseline-report.html \
                -J zap-baseline-report.json \
                -w zap-baseline-report.md \
                -z "-config api.key=${ZAP_API_KEY}"
            '''
            sh '''
                echo "Running ZAP full scan on critical endpoints..."
                python3 $WORKSPACE/.security-cache/zap/ZAP_${ZAP_VERSION}/zap-full-scan.py \
                -t http://localhost:8080/api \
                -g gen.conf \
                -r zap-full-report.html \
                -J zap-full-report.json \
                -w zap-full-report.md \
                -z "-config api.key=${ZAP_API_KEY}" \
                -I
            '''
        } else {
        // Windows commands
            bat '''
                echo Downloading OWASP ZAP...
                if not exist "%WORKSPACE%\\.security-cache\\zap\\ZAP_${ZAP_VERSION}" (
                    mkdir "%WORKSPACE%\\.security-cache\\zap"
                    cd "%WORKSPACE%\\.security-cache\\zap"
                    powershell -Command "Invoke-WebRequest https://github.com/zaproxy/zaproxy/releases/download/v${ZAP_VERSION}/ZAP_${ZAP_VERSION}_Crossplatform.zip -OutFile ZAP_${ZAP_VERSION}_Crossplatform.zip"
                    powershell -Command "Expand-Archive -Force ZAP_${ZAP_VERSION}_Crossplatform.zip ZAP_${ZAP_VERSION}"
                    del ZAP_${ZAP_VERSION}_Crossplatform.zip
                    cd ZAP_${ZAP_VERSION}/ZAP_${ZAP_VERSION}
                    echo Starting ZAP daemon...
                    .\\zap.bat -daemon -host 0.0.0.0 -port 8090 -config api.key=${ZAP_API_KEY}
                )
            '''
            bat '''
                echo Running ZAP baseline scan...
                python "%WORKSPACE%\\.security-cache\\zap\\ZAP_${ZAP_VERSION}\\zap-baseline.py" ^
                -t http://localhost:8080 ^
                -g gen.conf ^
                -r zap-baseline-report.html ^
                -J zap-baseline-report.json ^
                -w zap-baseline-report.md ^
                -z "-config api.key=${ZAP_API_KEY}"
            '''
            bat '''
                echo Running ZAP full scan on critical endpoints...
                python "%WORKSPACE%\\.security-cache\\zap\\ZAP_${ZAP_VERSION}\\zap-full-scan.py" ^
                -t http://localhost:8080/api ^
                -g gen.conf ^
                -r zap-full-report.html ^
                -J zap-full-report.json ^
                -w zap-full-report.md ^
                -z "-config api.key=${ZAP_API_KEY}" ^
                -I
            '''
        }
    }
  }
  post {
    always {
      script {
        if (isUnix()) {
          sh '''
            if [ -f zap.pid ]; then
            kill $(cat zap.pid) || true
            rm -f zap.pid
            fi
          '''
        } else {
          bat '''
            if exist zap.pid (
            for /F "usebackq" %%i in ("zap.pid") do taskkill /PID %%i /F
            del zap.pid
            )
          '''
        }
      }
      archiveArtifacts artifacts: 'zap-*-report.*', allowEmptyArchive: true
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: '.',
        reportFiles: 'zap-*-report.html',
        reportName: 'OWASP ZAP DAST Report'
      ])
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
