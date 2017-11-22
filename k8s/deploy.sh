#!/bin/bash

set -eufx -o pipefail

export KUBECONFIG="$(pwd)/kubeconfig"
export KUBE_NAMESPACE=$1
export SERVICE_NAME=$1
export HOSTNAME=$(echo $CI_ENVIRONMENT_HOSTNAME | sed -e "s/https:\/\///g")


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

# Deploy stuff
# envsubst templates stdin with environment variables. 
# Its not part of standard tools so its use might be considered a bit risque in certain circles.

env

# Namespace
cat $(pwd)/k8s/yml/namespace.yml | envsubst | kubectl apply -f - --insecure-skip-tls-verify=true

# Deployment
cat $(pwd)/k8s/yml/deployment.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f - --insecure-skip-tls-verify=true

# Service
cat $(pwd)/k8s/yml/service.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f - --insecure-skip-tls-verify=true

# Ingress
cat $(pwd)/k8s/yml/ingress.yml | envsubst
cat $(pwd)/k8s/yml/ingress.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f - --insecure-skip-tls-verify=true
