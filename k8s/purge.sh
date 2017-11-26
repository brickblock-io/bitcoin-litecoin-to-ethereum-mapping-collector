#!/bin/bash

set -euf -o pipefail

export KUBECONFIG="$(pwd)/kubeconfig"
export KUBE_NAMESPACE=$1
export SERVICE_NAME=$1
export HOSTNAME=$(echo $CI_ENVIRONMENT_URL | sed -e "s/https:\/\///g")


# Enable Globbing
shopt -s extglob

# Write out the certificate for the K8s API
export KUBE_CLUSTER_OPTIONS=
if [[ -n "$KUBE_CA_PEM" ]]; then
  echo "$KUBE_CA_PEM" > "$(pwd)/kube.ca.pem"
  export KUBE_CLUSTER_OPTIONS=--certificate-authority="$(pwd)/kube.ca.pem"
fi

# Set up kubectl for out cluster
kubectl config set-cluster gitlab-deploy \
        --server="$KUBE_URL" \
        $KUBE_CLUSTER_OPTIONS

kubectl config set-credentials gitlab-deploy \
        --token="$KUBE_TOKEN" \
        $KUBE_CLUSTER_OPTIONS

kubectl config set-context gitlab-deploy \
        --cluster=gitlab-deploy \
        --user=gitlab-deploy \
        --namespace="$KUBE_NAMESPACE"

kubectl config use-context gitlab-deploy

# lets get the usernames of the SQL user from the k8s secret so we can delete it.

sql_user=$(kubectl get secrets/cloudsql-db-credentials \
        -n $KUBE_NAMESPACE \
        --output=jsonpath="{.data..username}" \
        --insecure-skip-tls-verify=true | base64 -d )

# Delete the user from google cloud 

gcloud sql users delete $sql_user cloudsqlproxy~%\
        --instance=ico-claimants-data
        --quiet

# Get the key id. This is a bit convoluted because its a
# field in a json object which is encoded in base64... sigh!

sql_key_id=$(kubectl get secrets/cloudsql-instance-credentials \
        -n $KUBE_NAMESPACE \
        -o yaml \
        --insecure-skip-tls-verify=true \
        --output=jsonpath="{['data']['*']}" \
        | base64 -d \
        | jq '.private_key_id')

# Delete the key

gcloud iam service-accounts keys delete $sql_key_id \
        --iam-account cloud-sql-client@sonorous-cacao-185213.iam.gserviceaccount.com \
        --quiet

# Delete the namespace

kubectl delete namespace $KUBE_NAMESPACE --insecure-skip-tls-verify=true



