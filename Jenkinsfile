node {
    def app

    stage('Clone repository') {
        checkout scm
    }

    stage('Build image') {
        app = docker.build("riveryunny/bookridge-backend:${env.BUILD_NUMBER}")
    }

    stage('Test image') {
        app.inside {
            sh 'npm test'
        }
    }

    if (env.BRANCH_NAME == 'main' && !env.CHANGE_ID) {
        stage('Push image') {
            docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                app.push("${env.BUILD_NUMBER}")
                app.push("latest")
            }
        }
    }
}
