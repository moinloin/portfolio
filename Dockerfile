FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

FROM caddy:2.6 AS caddy

WORKDIR /etc/caddy

COPY Caddyfile /etc/caddy/Caddyfile

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app /app

COPY --from=caddy /usr/bin/caddy /usr/bin/caddy
COPY --from=caddy /etc/caddy /etc/caddy

EXPOSE 80 443 3000

CMD ["sh", "-c", "node server.js & caddy run --config /etc/caddy/Caddyfile"]
