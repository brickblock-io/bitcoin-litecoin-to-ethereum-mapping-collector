FROM node:9.1.0

WORKDIR /api-program

ADD . /api-program

EXPOSE 8080

ENTRYPOINT yarn start
