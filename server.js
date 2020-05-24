const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const uuid = require('uuid').v4;

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

const players = {};
const bots = {};

io.on('connection', (socket) => {
  console.log('a user connected', socket.id); //eslint-disable-line no-console
  // Create a new player and add it to our players object
  players[socket.id] = {
    angle: 0,
    x: Math.floor(Math.random() * 988) + 200,
    y: Math.floor(Math.random() * 540) + 100,
    playerId: socket.id,
  };
  // Send the players object to the new player
  socket.emit('currentPlayers', players);
  socket.emit('currentBots', bots);
  // Update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id); //eslint-disable-line no-console
    delete players[socket.id];
    delete bots[socket.id];
    // Emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  socket.on('projectileFiring', ({x, y, speed, angle, id, projectileType}) => {
    if (players[socket.id]) {
      socket.broadcast.emit('projectileFired', {x, y, speed, angle, playerId: socket.id, id, projectileType});
    }
  });

  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      players[socket.id].angle = movementData.angle;
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

  socket.on('botMovement', (movementData) => {
    if (players[socket.id]) {
      bots[socket.id][movementData.botId].x = movementData.x;
      bots[socket.id][movementData.botId].y = movementData.y;
      bots[socket.id][movementData.botId].angle = movementData.angle;
      socket.broadcast.emit('botMoved', bots[socket.id]);
    }
  });

  socket.on('projectileHit', ({playerId, damage, projectileId, botId}) => {
    if (players[playerId]) {
      socket.broadcast.emit('projectileDestroyed', {projectileId});
      if (botId) {
        io.emit('botDamaged', {playerId, botId, damage});
      } else {
        socket.broadcast.emit('playerDamaged', {playerId, damage});
      }
    }
  });

  socket.on('playerDying', ({playerId}) => {
    if (players[playerId]) {
      delete players[socket.id];
      delete bots[socket.id];
      io.emit('disconnect', socket.id);
    }
  });

  socket.on('spawnBot', ({playerId}) => {
    if (players[playerId]) {
      if (!bots[playerId]) {
        bots[playerId] = {};
      }
      const botId = uuid();
      bots[playerId][botId] = {
        angle: 0,
        x: Math.floor(Math.random() * 988) + 200,
        y: Math.floor(Math.random() * 540) + 100,
        botId,
        playerId,
      };
      io.emit('newBot', bots[playerId][botId]);
    }
  });

  socket.on('destroyBot', ({playerId, botId}) => {
    if (bots[playerId]) {
      delete bots[playerId][botId]
      io.emit('botRemoved', {playerId, botId});
    }
  })
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`); //eslint-disable-line no-console
});
