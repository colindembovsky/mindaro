#!/bin/bash

# this runs after Codespace creation when a codespace is assigned to a user

echo "post-create start"
echo "$(date)    post-create start" >> "$HOME/status"

echo "set up port forwarding"
kubectl port-forward svc/traefik 8080:80 &
kubectl port-forward $(kubectl get pods --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000 &

echo "post-create complete"
echo "$(date +'%Y-%m-%d %H:%M:%S')    post-create complete" >> "$HOME/status"