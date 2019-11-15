import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import * as net from 'net';
import * as websockets from 'ws';
import {
  GpioMapping,
  LedMatrix,
  LedMatrixUtils,
  MatrixOptions,
  PixelMapperType,
  RuntimeOptions,
} from 'rpi-led-matrix';

const matrixConfig = require('../../matrix.config.json');

const matrixOptions: MatrixOptions = {
  ...LedMatrix.defaultMatrixOptions(),
  ...matrixConfig,
  cols: 64,
  chainLength: 2,
  hardwareMapping: GpioMapping.Regular,
  parallel: 3,
  pixelMapperConfig: LedMatrixUtils.encodeMappers(
    { type: PixelMapperType.Chainlink }
  ),
};

export const runtimeOptions: RuntimeOptions = {
  ...LedMatrix.defaultRuntimeOptions(),
  gpioSlowdown: 1,
};

const httpsOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

const app = express();
const server = https.createServer(httpsOptions, app).listen(4000, '0.0.0.0', () => console.log('listening on port 4000'));
const wss = new websockets.Server({ noServer: true });
const liveSockets = new Set<websockets>([]);

app.get('/api/config', (req, res, next) => {
  res.json(matrixConfig);
});

server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
  wss.handleUpgrade(request, socket, head, clientSocket => wss.emit('connection', clientSocket, request));
});

const matrix = new LedMatrix(matrixOptions, runtimeOptions).brightness(100);

wss.on('connection', (socket, req) => {
  console.log('new socket connection');
  liveSockets.add(socket);
  socket.on('pong', () => liveSockets.add(socket));
  const expectedBufferSize = 3 * matrix.height() * matrix.width();

  socket.on('message', (data: Buffer) => {
    if (data.length !== expectedBufferSize) {
      console.warn(`Buffer is not the right length! Got ${data.length}, expected ${expectedBufferSize}`);
    }
    else {
      matrix.drawBuffer(data).sync();
    }
  });

  socket.on('close', async code => {
    liveSockets.delete(socket);
    console.log(`Socket closed with code ${code}, ${liveSockets.size} sockets left`);
  });
});

setInterval(
  () => wss.clients.forEach(socket => {
    if (!liveSockets.has(socket)) socket.terminate();
    liveSockets.delete(socket);
    socket.ping(() => { });
  }),
  1000
);
