#!/usr/bin/env bash

USERNAME=${1:-"automatic"}
NODE_VERSION=${2:-"16.15.0"}
HOMEPATH="/home/${USERNAME}"
NVMPATH="${HOMEPATH}/.nvm"

set -e

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
mv ~/.nvm $HOMEPATH

source "${NVMPATH}/nvm.sh" && nvm install ${NODE_VERSION}
source "${NVMPATH}/nvm.sh" && nvm use v${NODE_VERSION}
source "${NVMPATH}/nvm.sh" && nvm alias default v${NODE_VERSION}

node --version
npm --version