# Cloud Native CodeSpaces Development

Developing cloud native applications can be challenging for the "inner loop". CodeSpaces allows developers to set up a full, config-as-code development environment in the cloud that developers can connect to with a browser.

### Config

The base image is defined in a `Dockerfile` in the `.devcontainer` folder, along with the `devcontainer.json` config file. Various scripts are excuted when the image is built, as well as on the lifecycle (`onCreate`, `postCreate` and `postStart`) to configure the enviroment for development after the image is created.

This image includes:
- Docker, kubectl and minikube
- Azure CLI
- NodeJS
- DotNet

### Commands

Various commands are stored in the `launch.json` and `tasks.json` files in the `.vscode` folder. These incluse commands to:
- build docker images
- deploy helm charts
- port-forward for debugging

## Script

### Problem

If you browse to this repo on the `main` branch, you will see that it has a couple of sample applications. Getting started looks intimidating since there is NodeJS, DotNet and Go code in the BikeSharing app. There is a `bridge-quickstart.sh` script, but this looks like it only works if you have the application running in an AKS cluster! How do you do local development for this application?

Digging in a little, we see a `configure.sh` script. There are quite a few commands there, including running `minikube`, `kubectl` and `helm`. We don't see how to build the containers.

### Step 1: Open `main` in a CodeSpace

1. Show the files and the terminal. Run `dotnet` to show that the terminal actually works!
1. Show how the apps are container apps - there are plenty of `Dockerfiles`
> TODO
1. Add the `devcontainer` config in the command palette and build a docker environment
1. Run `minikube start` to spin up a k8s environment
1. Run `dockercompose build` to show building the containers
1. ?? Try run `node` - no bueno, so we could enhance the container

All this is great - but we can codify these steps and make it even easier for the dev team.

### Step 2: Open `<other>` in a CodeSpace (do this before the demo to warm it up)

1. Show how we've enhanced the `devcontainer.json` file and `Dockerfile` to create the full environment.
1. Show the command palette `Run Task` commands
1. Make sure minikube is running (`k get po`). Run `minikube start` if not
1. Run Task -> helm deploy
1. Run Task -> k8s: fwd dashboard - browse to it
1. Run Task -> k8s: fwd ingress - browse to it

All this is great - but how do we debug?

### Step 3: Local nodejs debug

1. Debug -> Launch nodejs. Switch to the `DEBUG CONSOLE` and see that the app fails to start
1. Since we have mondoDB running in the minikube cluster, we can use that!
1. Run Task -> k8s: fwd mongo and relaunch nodejs
1. Open `samples/BikeSharingApp/Bikes/server.js` and set a breakpoint at the `app.get('/api/allbikes')` function (around line 126)
1. Open a terminal and run
    ```sh
    curl -H"x-contoso-request-id:e6192a2d-7745-4f5f-a76b-5d88e71a5dff" localhost:3000/api/allbikes
    ```

All this is great - but what if want to debug inside the container?

### Step 4: Local container debug

1. Run Task -> k8s: fwd ingress
1. Debug -> Launch "Attach Kubernetes (core)"
1. When it is attached, set a breakpoint in `samples/BikeSharingApp/ReservationEngine/Controllers/ReservationEngineController.cs` in the `UpdateReservation()` method
1. Browse to the website and log in as Arelia Briggs.
1. Click on a bike and click "Reserve"

All this is great - but what if we want to debug to an instance of the service in a "real" cluster?

### Step 5: AKS debug using Bridge

We can use `Bridge to K8s` to connect to a K8s cluster - including redirecting traffic to a single application.

### Infra as Code

```sh
cd samples/BikeSharingApp/Infrastructure
tf plan
```