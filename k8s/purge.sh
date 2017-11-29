#!/bin/bash

set -euf -o pipefail

export KUBECONFIG="$(pwd)/kubeconfig"
export KUBE_NAMESPACE=$1
export SERVICE_NAME=$1
export HOSTNAME=$(echo $CI_ENVIRONMENT_URL | sed -e "s/https:\/\///g")

# Get kubeconfig. The cluster name should perhaps be parameterised.
gcloud container clusters get-credentials prod-cluster --zone europe-west1-c

# lets get the usernames of the SQL user from the k8s secret so we can delete it.

sql_user=$(kubectl get secrets/cloudsql-db-credentials \
        -n $KUBE_NAMESPACE \
        --output=jsonpath="{.data..username}" \
        --insecure-skip-tls-verify=true | base64 -d )

# Delete the user from google cloud 

gcloud sql users delete $sql_user cloudsqlproxy~%\
        --instance=ico-claimants-data \
        --quiet

# Get the key id. This is a bit convoluted because its a
# field in a json object which is encoded in base64... sigh!

sql_key_id=$(kubectl get secrets/cloudsql-instance-credentials \
        -n $KUBE_NAMESPACE \
        -o yaml \
        --insecure-skip-tls-verify=true \
        --output=jsonpath="{['data']['*']}" \
        | base64 -d \
        | jq -r '.private_key_id')

# Delete the key

gcloud iam service-accounts keys delete "$sql_key_id" \
        --iam-account cloud-sql-client@sonorous-cacao-185213.iam.gserviceaccount.com \
        --quiet

# Delete the namespace

kubectl delete namespace $KUBE_NAMESPACE --insecure-skip-tls-verify=true



