FROM node:20.18

RUN npm i -g @nestjs/cli

WORKDIR /app

COPY ./ ./

RUN yarn

EXPOSE 3000

CMD ["yarn", "start:dev"]
