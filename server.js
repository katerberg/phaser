const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

const players = {};

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

io.on('connection', (socket) => {
  console.log('a user connected'); //eslint-disable-line no-console
  // Create a new player and add it to our players object
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: Math.floor(Math.random() * 2) === 0 ? 'red' : 'blue',
  };
  // Send the players object to the new player
  socket.emit('currentPlayers', players);
  // Update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  socket.on('disconnect', () => {
    console.log('user disconnected'); //eslint-disable-line no-console
    // Remove this player from our players object
    delete players[socket.id];
    // Emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`); //eslint-disable-line no-console
});
