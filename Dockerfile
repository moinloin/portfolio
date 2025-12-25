FROM node:25-alpine

WORKDIR /app

RUN apk update && apk upgrade busybox busybox-binsh ssl_client

RUN npm install -g npm@11.7.0

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ARG VERSION=unknown
ARG NODE_ENV=production

ENV VERSION=$VERSION
ENV NODE_ENV=$NODE_ENV

EXPOSE 8080

CMD ["node", "server.js"]