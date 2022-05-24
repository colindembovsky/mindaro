FROM golang:1.14.15

# update certs
# RUN set -x && apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
#     ca-certificates && \
#     rm -rf /var/lib/apt/lists/* && \
#     update-ca-certificates

# Bundle app source
RUN mkdir /app
ADD /app /app
WORKDIR /app

# Get dependencies and build
RUN go get -d -v
RUN go build -o main . 

# Bind to port 80
EXPOSE 80

# Start Go server
ENTRYPOINT ["/app/main"]
