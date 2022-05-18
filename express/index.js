require('dotenv').config();
const express = require('express');
const ws = require('ws');
const app = express();

var clients = [];


const wsServer = new ws.Server({ noServer: true });
const server = app.listen(3001);

server.on('request', function(request) {
  var connection = request.accept('any-protocol', request.origin);
  clients.push(connection);

  connection.on('message', function(message) {
    //broadcast the message to all the clients
    clients.forEach(function(client) {
      client.send(message.utf8Data);
    });
  });
});

const backend = new ws(process.env.PETTERI);

backend.addEventListener('error', function (event) {
  console.log('WebSocket error: ', event);
});

backend.on('open', () => {
  console.log("connected to " + backend._url);
  clients.forEach(function(client) {
      client.send(    JSON.stringify({
        type: 'connection',
        connected: true,
        url: backend._url,
        message:  "Connected to Petteri"
    }));
    });
});

wsServer.on('connection', socket => {
  clients.push(socket);
  console.log("new client connected");
  if (backend.OPEN){
      socket.send(
          JSON.stringify({
              type: 'connection',
              connected: true,
              url: backend._url,
              message:  "Connected to Petteri"
          })
      );
  }
  else {
    socket.send(
      JSON.stringify({
          type: 'connection',
          connected: false,
          url: null,
          message:  "Waiting for Petteri (not connected)"
      })
  );
  }

  socket.on('message', message => {
    backend.send(message);
    console.log(message);
  });

  backend.on('message', message => {
      console.log(message.toString());
      socket.send(
        JSON.stringify({
            type: 'message',
            connected: true,
            url: backend._url,
            message: message.toString()
        })
    );
  });
});

backend.on('message', message => {
  clients.forEach(function(client) {
    //client.send(message);
  });
});



server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});
