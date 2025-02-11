FROM balenalib/raspberrypi3-node:20

# Turn on devices
ENV UDEV=1

RUN mkdir /app
WORKDIR /app

# Install python and other native module dependencies
RUN install_packages make gcc g++ python3

COPY . .

RUN npm ci --omit=dev

CMD exit 0
