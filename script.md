# Cloud Native CodeSpaces Development

Developing cloud native applications can be challenging for the "inner loop". Codespaces allows developers to set up a full, config-as-code development environment in the cloud that developers can connect to with a browser. This demo shows how to run a complex, fully-featured application (including debugging) in Codepaces.

### Config

The base image is defined in a `Dockerfile` in the `.devcontainer` folder, along with the `devcontainer.json` config file. Various scripts are excuted when the image is built, as well as on the lifecycle (`onCreate`, `postCreate` and `postStart`) to configure the enviroment for development after the image is created.

This image includes:
- Docker, kubectl and minikube
- Azure CLI
- NodeJS
- DotNet
- Building the microservices in the solution
- Deploying `traefik` ingress controller
- Deploying the `helm` chart of the application

When a user starts up the Codespace, they should have a complete, working application from the start! They can now get productive immediately.

### Commands

Various commands are stored in the `launch.json` and `tasks.json` files in the `.vscode` folder. These incluse commands to:
- build docker images
- deploy helm charts
- port-forward for testing/debugging

## Problem

This repo was copied from [Microsoft Mindaro](https://github.com/microsoft/mindaro). How would you start developing against the BikeSharingApp if you just joined the team?

Let's navigate to the [Microsoft Mindaro](https://github.com/microsoft/mindaro) and open a Codespace on the default branch.

When the Codespace opens, you will see that it has a couple of sample applications (the focus of this demo is the [BikeSharingApp](./samples/BikeSharingApp). Getting started looks intimidating since there is NodeJS, DotNet and Go code in the app. There is a `bridge-quickstart.sh` script, but this looks like it only works if you have the application running in an AKS cluster! How do you do _local development_ for this application?

Digging in a little, we see a `configure.sh` script. There are quite a few commands there, including running `minikube`, `kubectl` and `helm`. There are no commands that tell you how to even build the containers.

We could write a cleaner "setup" script that would guide the user to set up a local development environment. Ideally we need to:

- Create a minikube cluster that can run the microservices
- Create a `traefik` ingress controller, since that is how the application runs in production
- Deploy the images to a k8s cluster
- Build the container images
- Enable debugging for development

We can do this all through code so that developers don't have to!

## Solution

Shut down the Codespace running on the Microsoft repo and return to this repo. Open a Codespace on `main` - give it as much CPU as you can (at least 4 CPUs).

1. Examine the `devcontainer.json` file and `Dockerfile` that was used to create the full environment.
1. Hit Cntr/Cmd-P and type `Run Task` - see the commands that are preconfigured for the user
1. Examine the containers that are running by typing `k get po` in the terminal.
2. If there are no containers or there are errors, you can run `minikube start`
3. Run Task -> helm deploy
4. Run Task -> k8s: fwd dashboard - browse to it (you have to add `/dashboard/` to the URL to get to the `traefik` dashboard once the browser opens)
5. Run Task -> k8s: fwd ingress - browse to it to see the running application. You can log in as either User and see the bikes.

All this is great - but how do we debug?

## Local nodejs debug

We can debug code from within the Codespace.

1. Click `Debug`, change the profile to `Launch nodejs` and press the `Play` button.
1. Switch to the `DEBUG CONSOLE` and after about 30 seconds you will see that the app fails to start. It is trying to connect to a mongoDB but there isn't one at the address it is trying.
1. Since we have mondoDB running in the minikube cluster, we can use that! Use the Command Palette to `Run Task -> k8s: fwd mongo` and relaunch nodejs in the Debug tab
1. Open [samples/BikeSharingApp/Bikes/app.js](samples/BikeSharingApp/Bikes/app.js) and set a breakpoint at `function handleGetAvailableBikes()` (around line 62)
1. The application is running on port 3000.
1. Open a terminal and run
    ```sh
    curl -H"x-contoso-request-id:e6192a2d-7745-4f5f-a76b-5d88e71a5dff" localhost:3000/api/allbikes
    ```
1. You should see your breakpoint hit.

This is great - but what if want to debug _inside the container_?

## Local container debug

1. In the command palette, `Run Task -> k8s: fwd ingress` to forward the ingress service.
1. Now run `Debug -> Launch "Attach Kubernetes (core)"`. This will attach the code from the Codespace to a running container.
1. When prompted, select `ReservationEngine` as the project to debug. Then in the list of containers, select the `ReservationEngine` pod.
3. When it is attached, set a breakpoint in [samples/BikeSharingApp/ReservationEngine/Controllers/ReservationEngineController.cs](samples/BikeSharingApp/ReservationEngine/Controllers/ReservationEngineController.cs) in the `UpdateReservation()` method.
4. Browse to the website that opened in step 1 and log in as Arelia Briggs.
5. Click on a bike and click "Reserve".
6. You should hit the breakpoint and can debug the code that is running inside the container.
