# prefs
alias k=kubectl
export KUBE_EDITOR="code -w"

# minikube
minikube create
minikube start
eval $(minikube docker-env)

export INGRESSBASE="colindembovsky-mindaro-4vq99grfq65w-8080.githubpreview.dev"
export CHARTDIR="./samples/BikeSharingApp/charts/"
export BIKENS="bikeapp"

# install traefik
helm repo add traefik https://helm.traefik.io/traefik
helm repo update
helm install traefik traefik/traefik \
   --namespace $BIKENS --create-namespace \
   --set ingressClass.enabled=true \
   --set ingressClass.isDefaultClass=true \
   --set service.type=ClusterIP \
   --set fullnameOverride=$INGRESSNAME \
   $HELMARGS

# ingress port-forward
kubectl port-forward svc/traefik 8080:80

# dashboard
# port forward
kubectl port-forward $(kubectl get pods --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000
# !!VERY IMPORTANT!! The trailing slash is MANDATORY!!
# navigate to $host:9000/dashboard/. 

# install chart
helm dependency build "$CHARTDIR"
helm install bikesharingapp "$CHARTDIR" \
   --dependency-update \
   --namespace $BIKENS \
   --timeout 9m \
   --atomic $HELMARGS

# test API
curl -iH"Host: $fqdn" http://localhost:8080/api/host
curl -iH"Host: $fqdn" http://localhost:8080/api/bike/availableBikes
curl -iH"Host: $fqdn" http://localhost:8080/api/user/allUsers

# test web
curl -iH"Host: $fqdn" http://localhost:8080/