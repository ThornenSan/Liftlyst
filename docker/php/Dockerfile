# syntax=docker/dockerfile:1

# PHP 8.4 with FPM (FastCGI Process Manager) - no web server included
# php-fpm listens on port 9000 and nginx forwards PHP requests to it
FROM php:8.4-fpm

# C library headers needed to compile the PHP extensions below, plus git and
# unzip which Composer uses to fetch and extract packages.
#
# This is a single RUN on purpose: the apt cache must be removed in the same
# layer that created it. A separate cleanup layer frees nothing, because the
# earlier layer still carries the files in the final image.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libpq-dev \
    libicu-dev \
    libzip-dev \
&& rm -rf /var/lib/apt/lists/*

# Extensions bundled with the PHP source tree.
#   bcmath     arbitrary-precision math, expected by parts of Laravel
#   intl       localisation and Str helpers            (needs libicu-dev)
#   opcache    compiled-bytecode cache, large speed win
#   pcntl      signal handling for queue workers
#   pdo_pgsql  PDO driver for PostgreSQL               (needs libpq-dev)
#   pgsql      native PostgreSQL driver
#   zip        archive handling used by Composer       (needs libzip-dev)
#
# -j"$(nproc)" compiles them in parallel across all available cores.
RUN docker-php-ext-install -j"$(nproc)" \
    bcmath \
    intl \
    opcache \
    pcntl \
    pdo_pgsql \
    pgsql \
    zip

# redis is NOT bundled with PHP. It comes from PECL, and install it only
# compiles the module - docker-php-ext-enable writes the .ini that loads it.
RUN pecl install redis \
    && docker-php-ext-enable redis

# Composer, copied straight from its official image. Version-pinned to 2.x and
# no "curl | php" installer script whose checksum we would have to verify.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Laravel's public/ is mounted here by docker-compose and served by nginx.
WORKDIR /var/www/html
