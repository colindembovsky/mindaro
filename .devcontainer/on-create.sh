#!/bin/bash

# this runs at Codespace creation - not part of pre-build

echo "on-create start"
echo "$(date)    on-create start" >> "$HOME/status"

echo "create minikube cluster"
minikube start
eval $(minikube docker-env)

echo "install traefik"
helm repo add traefik https://helm.traefik.io/traefik
helm repo update
helm install traefik traefik/traefik \
   --namespace bikeapp --create-namespace \
   --set ingressClass.enabled=true \
   --set ingressClass.isDefaultClass=true \
   --set service.type=ClusterIP

echo "build the containers"
docker-compose build

echo "update charts"
export CHARTDIR="./samples/BikeSharingApp/charts/"
helm dependency build "$CHARTDIR"

helm install bikesharingapp "$CHARTDIR" \
   --dependency-update \
   --namespace bikeapp

echo "on-create complete"
echo "$(date +'%Y-%m-%d %H:%M:%S')    on-create complete" >> "$HOME/status"