FROM alpine:latest

WORKDIR /home

# Update, install dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache curl bash && \
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin

CMD [ "/bin/bash" ]