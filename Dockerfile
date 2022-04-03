FROM balenalib/raspberrypi3-alpine-node:16

# Turn on devices
ENV UDEV=1

RUN mkdir /app
WORKDIR /app

# Install python and other native module dependencies
RUN apk add --no-cache make gcc g++ python3

# Copy all the things
COPY ./binding.gyp ./binding.gyp
COPY ./fonts ./fonts
COPY ./package-lock.json ./package-lock.json
COPY ./package.json ./package.json
COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json
COPY ./vendor ./vendor

# Install and build
RUN npm ci --prod

CMD exit 0
