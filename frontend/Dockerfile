FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV HMAC_API_KEY=
RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
