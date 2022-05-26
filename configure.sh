minikube create
minikube start
#minikube addons enable ingress
eval $(minikube docker-env)

export INGRESSBASE="colindembovsky-mindaro-4vq99grfq65w-8080.githubpreview.dev"
export CHARTDIR="./samples/BikeSharingApp/charts/"
export BIKENS="bikeapp"

# traefik
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
   --set bikesharingweb.ingress.hosts={$fqdn} \
   --set bikesharingweb.ingress.annotations."kubernetes\.io/ingress\.class"=traefik \
   --dependency-update \
   --namespace $BIKENS \
   --timeout 9m \
   --atomic $HELMARGS

# test API
curl -iH"Host: $fqdn" http://localhost:8080/api/bike/availableBikes
# test web
