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

        stage('Deploy to GKE') {
            withCredentials([
                file(
                    credentialsId: 'gke-service-account-key',
                    variable: 'GCP_KEY'
                )
            ]) {
                sh '''
                    set -eu

                    export CLOUDSDK_CONFIG="$(mktemp -d)"
                    export KUBECONFIG="$(mktemp)"
                    trap 'rm -rf "$CLOUDSDK_CONFIG"; rm -f "$KUBECONFIG"' EXIT

                    # GCP 서비스 계정 인증
                    gcloud auth activate-service-account \
                    --key-file="$GCP_KEY"

                    gcloud config set project bookridge-cicd

                    # GKE 클러스터 연결
                    CLUSTER_NAME=$(gcloud container clusters list \
                    --project=bookridge-cicd \
                    --filter="location=asia-northeast3-a" \
                    --format="value(name)" | head -n 1)

                    test -n "$CLUSTER_NAME"

                    gcloud container clusters get-credentials \
                    "$CLUSTER_NAME" \
                    --zone asia-northeast3-a \
                    --project bookridge-cicd

                    # 새 Docker 이미지로 Deployment 업데이트
                    kubectl set image \
                    deployment/bookridge-backend \
                    bookridge-backend=riveryunny/bookridge-backend:${BUILD_NUMBER} \
                    -n bookridge

                    # 새 Pod가 정상적으로 준비됐는지 확인
                    kubectl rollout status \
                    deployment/bookridge-backend \
                    -n bookridge \
                    --timeout=180s
                '''
            }
        }
    }
}
