#!/bin/bash

# this runs after Codespace is created and assigned to a user

echo "post-create start"
echo "$(date)    post-create start" >> "$HOME/status"

echo "start minikube"
minikube start

echo "set env"
eval $(minikube docker-env)

echo "post-create complete"
echo "$(date +'%Y-%m-%d %H:%M:%S')    post-create complete" >> "$HOME/status"