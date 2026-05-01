FROM node:22-alpine AS deps

WORKDIR /app

RUN apk update && apk upgrade busybox busybox-binsh ssl_client

COPY package*.json ./
RUN npm ci --only=production


FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /app

COPY --from=deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot . .

ARG VERSION=unknown
ARG NODE_ENV=production

ENV VERSION=$VERSION
ENV NODE_ENV=$NODE_ENV

EXPOSE 8080

CMD ["/app/server.js"]
