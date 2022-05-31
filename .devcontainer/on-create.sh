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

echo "kubectl config bash"
echo 'alias k=kubectl' >>~/.bashrc
echo 'complete -F __start_kubectl k' >>~/.bashrc
echo 'export KUBE_EDITOR="code -w"' >>~/.bashrc

echo "kubectl config zsh"
echo 'alias k=kubectl' >>~/.zshrc
echo 'source <(kubectl completion zsh)' >>~/.zshrc
echo 'export KUBE_EDITOR="code -w"' >>~/.zshrc

echo "on-create complete"
echo "$(date +'%Y-%m-%d %H:%M:%S')    on-create complete" >> "$HOME/status"