FROM node:25-alpine

WORKDIR /app

RUN apk update && apk upgrade busybox busybox-binsh ssl_client

RUN npm install -g npm@11.8.0 && \
    rm -rf /usr/local/lib/node_modules/npm/node_modules/diff && \
    npm pack diff@8.0.3 && \
    tar -xzf diff-8.0.3.tgz -C /usr/local/lib/node_modules/npm/node_modules && \
    mv /usr/local/lib/node_modules/npm/node_modules/package /usr/local/lib/node_modules/npm/node_modules/diff && \
    rm diff-8.0.3.tgz

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ARG VERSION=unknown
ARG NODE_ENV=production

ENV VERSION=$VERSION
ENV NODE_ENV=$NODE_ENV

EXPOSE 8080

CMD ["node", "server.js"]