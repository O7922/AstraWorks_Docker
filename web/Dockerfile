# Build
FROM node:22-alpine AS build

WORKDIR /app

COPY src/package*.json ./
RUN npm install

COPY src/ ./

RUN npm run build

# Apache
FROM debian:12

RUN apt-get update && \
    apt-get install -y apache2 && \
    apt-get clean

COPY --from=build /app/dist /var/www/html

EXPOSE 80

CMD ["apachectl", "-D", "FOREGROUND"]