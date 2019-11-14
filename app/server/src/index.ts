import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import * as net from 'net';
import * as websockets from 'ws';

const matrixConfig = require('../../matrix.config.json');

const httpsOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

const app = express();
const server = https.createServer(httpsOptions, app).listen(4000, '0.0.0.0', () => console.log('listening on port 4000'));
const wss = new websockets.Server({ noServer: true });

app.get('/api/config', (req, res, next) => {
  res.json(matrixConfig);
});


server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
  wss.handleUpgrade(request, socket, head, clientSocket => wss.emit('connection', clientSocket, request));
});

const liveSockets = new Set<websockets>([]);


wss.on('connection', (socket, req) => {
  console.log('new socket connection');
  liveSockets.add(socket);
  socket.on('pong', () => liveSockets.add(socket));

  socket.on('message', (data: Buffer) => {
    console.log('got a message!', data);
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
