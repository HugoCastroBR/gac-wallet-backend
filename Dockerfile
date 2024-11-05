FROM node:22.11-alpine


WORKDIR /app

RUN mkdir -p /app

COPY package.json /app/

RUN yarn cache clean \
  rm node_modules/ \
  yarn install --frozen-lockfile

COPY . .

CMD [ "yarn", "start:dev" ]