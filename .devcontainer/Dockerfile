# Note: You can use any Debian/Ubuntu based image you want. 
FROM mcr.microsoft.com/vscode/devcontainers/base:0-bullseye

# Enable new "BUILDKIT" mode for Docker CLI
ENV DOCKER_BUILDKIT=1

# node
ENV NODE_VERSION=16.15.0

# Options
ARG INSTALL_ZSH="true"
ARG UPGRADE_PACKAGES="false"
ARG USE_MOBY="true"
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID
# Install needed packages and setup non-root user. Use a separate RUN statement to add your own dependencies.
COPY library-scripts/*.sh /tmp/library-scripts/
# set welcome message
COPY welcome-message.txt /usr/local/etc/vscode-dev-containers/first-run-notice.txt

RUN apt-get update && /bin/bash /tmp/library-scripts/common-debian.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" "${UPGRADE_PACKAGES}" "true" "true" \
    && /bin/bash /tmp/library-scripts/docker-in-docker-debian.sh "true" "${USERNAME}" "${USE_MOBY}" \ 
    && /bin/bash /tmp/library-scripts/kubectl-helm-debian.sh "latest" "latest" "latest" \
    && /bin/bash /tmp/library-scripts/node-install.sh "${USERNAME}" "${NODE_VERSION}" \
    # install terraform
    && apt-get install -y software-properties-common \
    && curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add - \
    && apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" \
    && apt-get update && apt-get install terraform \
    # install k9s
    && curl -L -O https://github.com/derailed/k9s/releases/download/v0.25.18/k9s_Linux_x86_64.tar.gz \
    && tar -zxvf k9s_Linux_x86_64.tar.gz \
    && mv k9s /usr/local/bin \
    # prep minikube
    && mkdir -p /home/${USERNAME}/.minikube \
    && chown ${USERNAME} /home/${USERNAME}/.minikube \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/* /tmp/library-scripts/

VOLUME [ "/var/lib/docker" ]

# Setting the ENTRYPOINT to docker-init.sh will start up the Docker Engine 
# inside the container "overrideCommand": false is set in devcontainer.json. 
# The script will also execute CMD if you need to alter startup behaviors.
ENTRYPOINT [ "/usr/local/share/docker-init.sh" ]
CMD [ "sleep", "infinity" ]