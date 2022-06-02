#!/bin/bash

# this runs after Codespace is created and assigned to a user

echo "post-create start"
echo "$(date)    post-create start" >> "$HOME/status"

echo "set env"
eval $(minikube docker-env)

echo "build the containers"
docker-compose build

echo "update charts"
export CHARTDIR="./samples/BikeSharingApp/charts/"
helm dependency build "$CHARTDIR"

helm upgrade bikesharingapp --install "$CHARTDIR" \
   --values "$CHARTDIR"/dev-values.yaml \
   --dependency-update \
   --namespace bikeapp \
   --timeout 2m \
   --atomic

echo "post-create complete"
echo "$(date +'%Y-%m-%d %H:%M:%S')    post-create complete" >> "$HOME/status"