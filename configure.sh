minikube start
minikube addons enable ingress
eval $(minikube docker-env)

# traefik
helm repo add traefik https://helm.traefik.io/traefik
helm repo update
helm install traefik traefik/traefik --set service.type=ClusterIP

# port forward
kubectl port-forward $(kubectl get pods --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000

# !!VERY IMPORTANT!! The trailing slash is MANDATORY!!
# navigate to $host:9000/dashboard/. 

# install chart
INGRESSBASE="colindembovsky-mindaro-4vq99grfq65w-8080.githubpreview.dev"
CHARTDIR="./samples/BikeSharingApp/charts/"
BIKENS="bikeapp"
helm install bikesharingapp "$CHARTDIR" \
   --set bikesharingweb.ingress.hosts={$INGRESSBASE} \
   --set gateway.ingress.hosts={$INGRESSBASE} \
   --set bikesharingweb.ingress.annotations."kubernetes\.io/ingress\.class"=traefik \
   --set gateway.ingress.annotations."kubernetes\.io/ingress\.class"=traefik \
   --dependency-update \
   --namespace $BIKENS \
   --timeout 9m \
   --atomic $HELMARGS