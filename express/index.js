require('dotenv').config()
const express = require('express')
const ws = require('ws');
const app = express()

const wsServer = new ws.Server({ noServer: true });
const server = app.listen(3000);

const backend = new ws(process.env.PETTERI);
var backendURL = null;
var petteriConnection = false;

backend.on('open', () => {
    backendURL = backend._url;
    petteriConnection = true;
  });

wsServer.on('connection', socket => {
    if (petteriConnection){
        socket.send(
            JSON.stringify({
                type: 'connection',
                connected: true,
                url: backendURL,
                message:  "Connected to Petteri"
            })
        );
    }
  socket.on('message', message => {
    backend.send(message);
  });
  backend.on('message', message => {
      console.log(message.toString());
      socket.send(
        JSON.stringify({
            type: 'message',
            connected: true,
            url: backendURL,
            message: message.toString()
        })
    );
  });
});

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});
