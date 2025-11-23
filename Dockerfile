FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ARG VERSION=unknown
ARG NODE_ENV=production

ENV VERSION=$VERSION
ENV NODE_ENV=$NODE_ENV

EXPOSE 8080

CMD ["node", "server.js"]