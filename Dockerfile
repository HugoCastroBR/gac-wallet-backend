FROM node:22.11-alpine


WORKDIR /app

RUN mkdir -p /app

COPY package.json /app/

RUN yarn global add @nestjs/cli

RUN yarn add prisma @prisma/client

RUN yarn cache clean \
  rm node_modules/ \
  yarn install 

COPY . .

RUN yarn prisma generate


CMD [ "yarn", "start:dev" ]