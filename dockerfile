FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 1337

ENV NODE_OPTIONS="--require ./instrumentation.js"

CMD ["npm", "run", "start"]
