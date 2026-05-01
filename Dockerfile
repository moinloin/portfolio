FROM node:22-alpine AS deps

WORKDIR /app

RUN apk update && apk upgrade busybox busybox-binsh ssl_client

COPY package*.json ./
RUN npm ci --only=production


FROM alpine:3.21

RUN apk update && apk upgrade \
    && apk add --no-cache nodejs ca-certificates \
    && addgroup -S node && adduser -S node -G node

WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

ARG VERSION=unknown
ARG NODE_ENV=production

ENV VERSION=$VERSION
ENV NODE_ENV=$NODE_ENV

EXPOSE 8080

USER node

CMD ["node", "/app/server.js"]
