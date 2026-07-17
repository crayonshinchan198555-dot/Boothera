FROM php:8.2-apache

# 安装 MySQL 扩展
RUN docker-php-ext-install mysqli pdo pdo_mysql

# 1. 复制整个项目根目录到 Apache 的工作目录
COPY . /var/www/html/

# 2. 赋予 Apache 运行用户 (www-data) 读取文件的权限
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80