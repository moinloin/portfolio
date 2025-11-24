FROM node:25-alpine

WORKDIR /app

# Update Alpine packages including BusyBox to fix CVE-2024-58251 and CVE-2025-46394
RUN apk update && apk upgrade busybox busybox-binsh ssl_client

# Update npm to 11.6.3 for tar CVE fix
RUN npm install -g npm@11.6.3

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ARG VERSION=unknown
ARG NODE_ENV=production

ENV VERSION=$VERSION
ENV NODE_ENV=$NODE_ENV

EXPOSE 8080

CMD ["node", "server.js"]