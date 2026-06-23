FROM debian:12

RUN apt-get update && \
    apt-get install -y apache2 && \
    apt-get clean

RUN a2enmod rewrite
RUN sed -i 's/AllowOverride None/AllowOverride All/g' \
    /etc/apache2/apache2.conf

EXPOSE 80

CMD ["apachectl", "-D", "FOREGROUND"]


