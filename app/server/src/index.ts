import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import * as net from 'net';
import * as websockets from 'ws';


const httpsOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

const app = express();
const server = https.createServer(httpsOptions, app).listen(4000, '0.0.0.0', () => console.log('listening on port 4000'));
const wss = new websockets.Server({ noServer: true });

app.get('/api/config', (req, res, next) => {
  next();
});


server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
  wss.handleUpgrade(request, socket, head, clientSocket => wss.emit('connection', clientSocket, request));
});

const liveSockets = new Set<websockets>([]);


wss.on('connection', async (socket, req) => {
  socket.on('pong', liveSockets.add.bind(liveSockets, socket));
  liveSockets.add(socket);

  socket.on('message', (data: string = '{}') => {
    if (typeof data === 'string' && data.length > 0 && data !== 'undefined') {
    }
  });

  socket.on('close', async (code, reason) => {
    console.log(`Socket was closed with code ${code} and reason: `, reason);
    console.log('live sockets left: ', liveSockets.size);
    // Shutdown logic here
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
