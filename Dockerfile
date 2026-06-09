FROM node:26-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:css \
    && npm prune --omit=dev

FROM node:26-alpine

RUN apk upgrade --no-cache

WORKDIR /app

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
COPY --from=build --chown=node:node /app/public/css/tailwind.min.css ./public/css/tailwind.min.css

ARG VERSION=unknown
ARG NODE_ENV=production

ENV VERSION=$VERSION
ENV NODE_ENV=$NODE_ENV
ENV PORT=8080

EXPOSE 8080

USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:' + (process.env.PORT || 8080) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "/app/server.js"]
