#!/bin/bash

set -euf -o pipefail

export KUBECONFIG="$(pwd)/kubeconfig"
export KUBE_NAMESPACE=$1
export SERVICE_NAME=$1
export HOSTNAME=$(echo $CI_ENVIRONMENT_URL | sed -e "s/https:\/\///g")

# Get kubeconfig. The cluster name should perhaps be parameterised.
gcloud container clusters get-credentials prod-cluster --zone europe-west1-c

# Namespace - This has to be created before anything else can happen.
cat $(pwd)/k8s/yml/namespace.yml | envsubst
cat $(pwd)/k8s/yml/namespace.yml | envsubst | kubectl apply -f -

# We will create a database user on the fly so that CI does not have to handle secrets.
# Lets create a user and password for the new database user
# Because these bits of YAML are so small and probably not subject to much change
# we will handle them inside the script.
# Maybe this is also more secure as secrets are not touching disk.

sql_user=$(echo $KUBE_NAMESPACE | md5sum | cut -c1-16) # Has to be under 16 chars
sql_password=$(date +%N | md5sum | awk '{print $1}') # Seems random enough.. ?

export SQL_USER=$sql_user
export SQL_PASSWORD=$sql_password

# $MYSQL_INSTANCE will look like 'sonorous-cacao-185213:europe-west1:ico-claimants-data' 
# but we need 'ico-claimants-data' hense the cludgy bit of awk.

gcloud sql users create $sql_user cloudsqlproxy~% \
	--instance=$(echo $MYSQL_INSTANCE | awk -F':' '{print $3}') \
	--password=$sql_password

# Drop our SQL user into a K8s secret. This is currently not encrypted which is probably bad.

cat << _EOF_ | kubectl apply -f - -n $KUBE_NAMESPACE
apiVersion: v1
data:
  password: $( printf $sql_password | base64 )
  username: $( printf $sql_user | base64 )
kind: Secret
metadata:
  name: cloudsql-db-credentials
type: Opaque
_EOF_


# The proxy requires a service account with the proper privileges for the Cloud SQL instance. 
# We are just creating extra keys for the cloud-sql-client service account. The service account was created manually.

{ # try

    gcloud iam service-accounts create $KUBE_NAMESPACE --display-name=$KUBE_NAMESPACE

} || { # catch
echo "gcloud iam service-accounts create failed but thats probably ok :)"
}

{
gcloud projects add-iam-policy-binding \
	sonorous-cacao-185213 \
	--member serviceAccount:$KUBE_NAMESPACE@sonorous-cacao-185213.iam.gserviceaccount.com \
	--role roles/cloudsql.client
} || {
echo "gcloud projects add-iam-policy-binding failed but thats probably ok :)"
}

key_json_base64=$(gcloud iam service-accounts keys create - \
            --iam-account $KUBE_NAMESPACE@sonorous-cacao-185213.iam.gserviceaccount.com \
            --no-user-output-enabled | base64 --wrap=0)


cat << _EOF_ | kubectl apply -f - -n $KUBE_NAMESPACE
apiVersion: v1
data:
  credentials.json: $key_json_base64
kind: Secret
metadata:
  name: cloudsql-instance-credentials
type: Opaque
_EOF_

# Create database. Dashes not suported!

/bin/bash $(pwd)/k8s/create_database.sh $MYSQL_DATABASE

# Deploy stuff
# envsubst templates stdin with environment variables.
# Its not part of standard tools so its use might be considered a bit risque in certain circles.
# envsubst is installed from the gettext-base package on debian

# Deployment
cat $(pwd)/k8s/yml/deployment.yml | envsubst
cat $(pwd)/k8s/yml/deployment.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f -

# Service
cat $(pwd)/k8s/yml/service.yml | envsubst
cat $(pwd)/k8s/yml/service.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f -

# Ingress
cat $(pwd)/k8s/yml/ingress.yml | envsubst
cat $(pwd)/k8s/yml/ingress.yml | envsubst | kubectl apply -n $KUBE_NAMESPACE -f -

# Check the status
kubectl rollout status -n "$KUBE_NAMESPACE" -w "deployment/$SERVICE_NAME"

echo "The application was deployed to $KUBE_NAMESPACE"

#kubectl get pods -n $KUBE_NAMESPACE -o wide --insecure-skip-tls-verify=true
#kubectl get service -n $KUBE_NAMESPACE -o wide --insecure-skip-tls-verify=true
#kubectl describe ingress -n $KUBE_NAMESPACE --insecure-skip-tls-verify=true

#fin
