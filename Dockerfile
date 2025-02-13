FROM node:20 AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY tsconfig.json ./

RUN yarn install

COPY . .

RUN apt-get update && apt-get install -y ffmpeg

RUN yarn build

RUN yarn global add pm2

RUN mkdir -p ./tempMedia && mkdir -p ./uploads

EXPOSE 3000

CMD ["pm2-runtime", "dist/main.js"]