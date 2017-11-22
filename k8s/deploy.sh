#!/bin/bash

set -eufx -o pipefail

export KUBECONFIG="$(pwd)/kubeconfig"

# Enable Globbing
shopt -s extglob

# Do we have all the variables we need?
: "${debug:?Environment variable debug needs to be set before running this script}"
: "${NAME:?You need to pass the name of the service (e.g. 'platform-frontend') as an argument to the deploy script (e.g. ./deploy.sh platform-frontend)}"
: "${GITLAB_USER_EMAIL:?Environment variable GITLAB_USER_EMAIL needs to be set before running this script}"
: "${CI_REGISTRY:?Environment variable CI_REGISTRY needs to be set before running this script}"
: "${CI_REGISTRY_USER:?Environment variable CI_REGISTRY_USER needs to be set before running this script}"
: "${CI_REGISTRY_PASSWORD:?Environment variable CI_REGISTRY_PASSWORD needs to be set before running this script}"
: "${CI_REGISTRY_IMAGE:?Environment variable CI_REGISTRY_IMAGE needs to be set before running this script}"
#: "${CI_REGISTRY_TAG:?Environment variable CI_REGISTRY_TAG needs to be set before running this script}"
: "${CI_ENVIRONMENT_SLUG:?Environment variable CI_ENVIRONMENT_SLUG needs to be set before running this script}"
: "${CI_ENVIRONMENT_URL:?Environment variable CI_ENVIRONMENT_URL needs to be set before running this script}"
: "${CI_ENVIRONMENT_HOSTNAME:?Environment variable CI_ENVIRONMENT_HOSTNAME needs to be set before running this script}"
: "${CI_PIPELINE_ID:?Environment variable CI_PIPELINE_ID needs to be set before running this script}"
: "${CI_JOB_ID:?Environment variable CI_JOB_ID needs to be set before running this script}"
: "${CI_COMMIT_REF_NAME:?Environment variable CI_COMMIT_REF_NAME needs to be set before running this script}"
: "${KUBE_NAMESPACE:?Environment variable KUBE_NAMESPACE needs to be set before running this script}"
: "${KUBE_URL:?Environment variable KUBE_URL needs to be set before running this script}"

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

# Deploy stuff
# envsubst templates stdin with environment variables. 
# Its not part of standard tools so its use might be considered a bit risque in certain circles.

# Deployment
cat $(pwd)/k8s/yml/deployment.yml | envsubst
cat $(pwd)/k8s/yml/deployment.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f - --insecure-skip-tls-verify=true

# Service
cat $(pwd)/k8s/yml/service.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f - --insecure-skip-tls-verify=true

# Ingress
cat $(pwd)/k8s/yml/ingress.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f - --insecure-skip-tls-verify=true
