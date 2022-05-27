#!/bin/bash

# this runs after Codespace is created and assigned to a user

echo "post-create start"
echo "$(date)    post-create start" >> "$HOME/status"

echo "start minikube"
minikube start

echo "kubectl setup"
alias k="kubectl"
source /usr/share/bash-completion/bash_completion
export KUBE_EDITOR="code -w"

echo "set the default namespace for kubectl"
k config set-context --current --namespace bikeapp

echo "set up port forwarding"
kubectl port-forward svc/traefik 8080:80 &
kubectl port-forward $(kubectl get pods --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000 &

echo "post-create complete"
echo "$(date +'%Y-%m-%d %H:%M:%S')    post-create complete" >> "$HOME/status"