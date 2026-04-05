FROM node:20-bullseye

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 5000

RUN ["node", "server.js"]