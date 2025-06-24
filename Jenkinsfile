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
  stages {
    stage('Checkout SCM') {
      steps {
        checkout scm
      }
    }
    stage('Nuclei DAST Scan') {
      steps {
        script {
          def runCommand = { cmd -> isUnix() ? sh(script: cmd, returnStdout: true).trim() : bat(script: cmd, returnStdout: true).trim() }
          // Instala wget si no está presente
          runCommand('which wget || (apt-get update && apt-get install -y wget)')
          // Descarga e instala Nuclei si no está presente
          runCommand('which nuclei || (curl -s https://api.github.com/repos/projectdiscovery/nuclei/releases/latest | grep "browser_download_url.*linux_amd64.zip" | cut -d \\" -f 4 | xargs wget -O nuclei.zip && unzip nuclei.zip && mv nuclei /usr/local/bin/)')
          // Busca puertos abiertos por procesos Java (Spring Boot)
          def ports = runCommand("lsof -iTCP -sTCP:LISTEN -P -n | grep java | awk '{print \$9}' | grep -oE '[0-9]{4,5}' | sort -u")
          if (!ports) {
            error("No se detectaron puertos abiertos por procesos Java.")
          }
          def targets = ports.split('\n').collect { "http://localhost:${it}" }
          targets.each { url ->
            runCommand("nuclei -u ${url} -o nuclei-report-${url.replaceAll('[^a-zA-Z0-9]', '_')}.txt")
          }
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