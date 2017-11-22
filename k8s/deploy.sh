#!/bin/bash

set -euf -o pipefail

export KUBECONFIG="$(pwd)/kubeconfig"

# Write out the certificate for the K8s API
export KUBE_CLUSTER_OPTIONS=
if [[ -n "$KUBE_CA_PEM" ]]; then
  echo "$KUBE_CA_PEM" > "$(pwd)/kube.ca.pem"
  export KUBE_CLUSTER_OPTIONS=--certificate-authority="$(pwd)/kube.ca.pem"
fi

# Set up kubectl for out cluster
chronic kubectl config set-cluster gitlab-deploy \
  --server="$KUBE_URL" \
  $KUBE_CLUSTER_OPTIONS

chronic kubectl config set-credentials gitlab-deploy \
  --token="$KUBE_TOKEN" \
  $KUBE_CLUSTER_OPTIONS

chronic kubectl config set-context gitlab-deploy \
  --cluster=gitlab-deploy \
  --user=gitlab-deploy \
  --namespace="$KUBE_NAMESPACE"

chronic kubectl config use-context gitlab-deploy

# Deploy stuff
# envsubst templates stdin with environment variables. 
# Its not part of standard tools so its use might be considered a bit risque in certain circles.

cat $(pwd)/k8s/yml/* | envsubst | kubectl apply -n $KUBE_NAMESPACE -f - --insecure-skip-tls-verify=true 
