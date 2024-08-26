ARG GO_VERSION=1.23
ARG PNPM_VERSION=9.8.0
ARG NODE_VERSION=20.17.0

FROM mcr.microsoft.com/vscode/devcontainers/go:1-$GO_VERSION-bullseye

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl \
    git \ 
    protobuf-compiler \
    libprotobuf-dev \
    make \
    build-essential libsqlite3-dev \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV TZ=Etc/UTC

ENV NODE_VERSION=20.17.0
ENV NVM_DIR /usr/local/nvm

RUN curl --silent -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.31.2/install.sh | bash 

RUN . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV CI=true

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN npm i -g pnpm@$PNPM_VERSION
RUN npm i -g @biomejs/biome@latest
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
RUN go install github.com/mitranim/gow@latest
RUN export PATH="$PATH:$(go env GOPATH)/bin"