#!/bin/bash

# this runs after Codespace is started

echo "post-create start"
echo "$(date)    post-start start" >> "$HOME/status"

echo "start minikube"
nohup bash -c 'minikube start &' > minikube.log 2>&1

echo "set the default namespace for kubectl"
kubectl config set-context --current --namespace bikeapp

echo "post-start complete"
echo "$(date +'%Y-%m-%d %H:%M:%S')    post-start complete" >> "$HOME/status"