# Run me like this $ docker build -t x . && docker run -ti -p 8080:8080 --env-file ./.env x

FROM node:9.1.0

WORKDIR /api-program

ADD . /api-program

EXPOSE 8080

RUN apt-get update && apt-get upgrade -y && apt-get install -y mysql-client && yarn

ENTRYPOINT env; yarn start
