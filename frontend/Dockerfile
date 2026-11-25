
FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    PORT=40101

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

USER node

EXPOSE 40101

CMD ["node", "app.js"]
