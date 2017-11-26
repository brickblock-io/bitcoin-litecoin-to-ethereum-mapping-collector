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

# Namespace - This has to be created before anything else can happen.
cat $(pwd)/k8s/yml/namespace.yml | envsubst
cat $(pwd)/k8s/yml/namespace.yml | envsubst | kubectl apply -f - --insecure-skip-tls-verify=true

# We will create a database user on the fly so that CI does not have to handle secrets.
# Lets create a user and password for the new database user
# Because these bits of YAML are so small and probably not subject to much change
# we will handle them inside the script.
# Maybe this is also more secure as secrets are not touching disk.

sql_user=$(echo $KUBE_NAMESPACE | md5sum | cut -c1-16) # Has to be under 16 chars
sql_password=$(date +%N | md5sum | awk '{print $1}') # Seems random enough.. ?

{ # try
    gcloud sql users create $sql_user cloudsqlproxy~% --instance=ico-claimants-data --password=$sql_password
} || { # catch
    gcloud sql users set-password $sql_user cloudsqlproxy~% --instance=ico-claimants-data --password=$sql_password
}

cat << _EOF_ | kubectl apply -f - -n $KUBE_NAMESPACE --insecure-skip-tls-verify=true
apiVersion: v1
data:
  password: $( printf $sql_password | base64 )
  username: $( printf $sql_user | base64 )
kind: Secret
metadata:
  name: cloudsql-db-credentials
type: Opaque
_EOF_

#kubectl create secret generic cloudsql-db-credentials-1 \
#            --insecure-skip-tls-verify=true \
#	    --from-literal=username=$sql_user \
#       	    --from-literal=password=$sql_password

#kubectl create secret generic cloudsql-db-credentials-2 \
#	    --insecure-skip-tls-verify=true \
#	    --from-literal=username="testing123" \
#	    --from-literal=password="testing123"
	


# The proxy requires a service account with the proper privileges for the Cloud SQL instance. 
# We are just creating extra keys for the cloud-sql-client service account. The service account was created manually.

key_json_base64=$(gcloud iam service-accounts keys create - \
            --iam-account cloud-sql-client@sonorous-cacao-185213.iam.gserviceaccount.com \
            --no-user-output-enabled | base64 --wrap=0)


cat << _EOF_ | kubectl apply -f - -n $KUBE_NAMESPACE --insecure-skip-tls-verify=true
apiVersion: v1
data:
  credentials.json: $key_json_base64
kind: Secret
metadata:
  name: cloudsql-instance-credentials
type: Opaque
_EOF_

# Deploy stuff
# envsubst templates stdin with environment variables.
# Its not part of standard tools so its use might be considered a bit risque in certain circles.
# envsubst is installed from the gettext-base package on debian

# Deployment
cat $(pwd)/k8s/yml/deployment.yml | envsubst
cat $(pwd)/k8s/yml/deployment.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f - --insecure-skip-tls-verify=true

# Service
cat $(pwd)/k8s/yml/service.yml | envsubst
cat $(pwd)/k8s/yml/service.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f - --insecure-skip-tls-verify=true

# Ingress
cat $(pwd)/k8s/yml/ingress.yml | envsubst
cat $(pwd)/k8s/yml/ingress.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f - --insecure-skip-tls-verify=true

# Check the status
kubectl rollout status -n "$KUBE_NAMESPACE" -w "deployment/$SERVICE_NAME" --insecure-skip-tls-verify=true

echo "The application was deployed to $KUBE_NAMESPACE"

#kubectl get pods -n $KUBE_NAMESPACE -o wide --insecure-skip-tls-verify=true
#kubectl get service -n $KUBE_NAMESPACE -o wide --insecure-skip-tls-verify=true
#kubectl describe ingress -n $KUBE_NAMESPACE --insecure-skip-tls-verify=true

#fin
