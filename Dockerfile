FROM node:18.19-alpine as build

RUN apk add curl bash

RUN curl -sfL https://gobinaries.com/tj/node-prune | bash -s -- -b /usr/local/bin

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

# run node prune
RUN /usr/local/bin/node-prune

# remove unused dependencies
RUN rm -rf node_modules/rxjs/src/
RUN rm -rf node_modules/rxjs/bundles/
RUN rm -rf node_modules/rxjs/_esm5/
RUN rm -rf node_modules/rxjs/_esm2015/

FROM node:18.19-alpine AS deploy

WORKDIR /app

COPY --from=build /app/package*.json /app/
COPY --from=build /app/yarn.lock /app/
COPY --from=build /app/dist/ /app/dist/
COPY --from=build /app/node_modules/ /app/node_modules/
COPY /proto /app/proto
COPY config.yml /app/config.yml

CMD [ "node", "dist/main.js" ]
