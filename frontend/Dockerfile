FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ARG HMAC_API_KEY
ENV HMAC_API_KEY=${HMAC_API_KEY}

RUN npm run build

EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
