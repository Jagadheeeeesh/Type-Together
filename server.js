const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const PARAGRAPHS = [
  "JavaScript developers love solving problems with code every single day at their favorite desk.",
  "The quick brown fox jumps over the lazy dog while typing fast and learning new tricks daily.",
  "Typing games improve your speed and accuracy with every word you practice in a fun environment.",
  "Socket.IO enables real-time communication for multiplayer games and collaborative web projects.",
  "Modern web apps use glassmorphism and neumorphism for beautiful, soft, and engaging user interfaces.",
  "Developers enjoy coding challenges that test their logic, creativity, and problem-solving skills daily.",
  "A good typing game motivates players to compete, improve, and celebrate every small achievement.",
  "Frontend and backend work together to deliver seamless multiplayer experiences for all users online.",
  "Learning to type quickly and accurately is a valuable skill for programmers and writers everywhere.",
  "Every developer should practice typing to boost productivity and reduce errors in their daily workflow."
];

function getRandomParagraph() {
  // Pick a random paragraph from the list
  return PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
}

let rooms = {};
let roomCounter = 1;
let readyPlayers = {};

function findAvailableRoom() {
  for (const roomId in rooms) {
    if (Object.keys(rooms[roomId].users).length < 2 && !rooms[roomId].started) {
      return roomId;
    }
  }
  return null;
}

io.on('connection', (socket) => {
  socket.on('findRoom', (username) => {
    let roomId = findAvailableRoom();
    if (!roomId) {
      roomId = `room${roomCounter++}`;
      // Assign a random paragraph to this room
      rooms[roomId] = { users: {}, started: false, finished: false, paragraph: getRandomParagraph() };
    }
    socket.join(roomId);
    rooms[roomId].users[socket.id] = { username, progress: 0, finished: false };
    socket.emit('roomAssigned', roomId);
    readyPlayers[socket.id] = false;
    const userCount = Object.keys(rooms[roomId].users).length;
    if (userCount < 2) {
      io.to(roomId).emit('waitingForPlayer');
    }
    if (userCount === 2 && !rooms[roomId].started) {
      rooms[roomId].started = true;
      rooms[roomId].finished = false;
      for (const id in rooms[roomId].users) {
        rooms[roomId].users[id].progress = 0;
        rooms[roomId].users[id].finished = false;
        readyPlayers[id] = false;
      }
      // Use the room's assigned paragraph
      io.to(roomId).emit('startGame', rooms[roomId].users, rooms[roomId].paragraph);
    }
  });

  socket.on('playerReady', (roomId) => {
    if (!rooms[roomId]) return;
    readyPlayers[socket.id] = true;
    const readyCount = Object.keys(rooms[roomId].users).filter(id => readyPlayers[id]).length;
    if (readyCount === 2) {
      for (const id in rooms[roomId].users) readyPlayers[id] = false;
      io.to(roomId).emit('bothReady');
    }
  });

  socket.on('progress', (roomId, progress) => {
    if (rooms[roomId] && rooms[roomId].users[socket.id]) {
      rooms[roomId].users[socket.id].progress = progress;
      io.to(roomId).emit('updateUsers', rooms[roomId].users);
    }
  });

  socket.on('finished', (roomId) => {
    if (rooms[roomId] && !rooms[roomId].finished) {
      rooms[roomId].finished = true;
      rooms[roomId].users[socket.id].finished = true;
      io.to(roomId).emit('gameOver', rooms[roomId].users[socket.id].username);
    }
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        delete rooms[roomId].users[socket.id];
        delete readyPlayers[socket.id];
        if (!rooms[roomId].started) {
          io.to(roomId).emit('waitingForPlayer');
        }
        if (Object.keys(rooms[roomId].users).length === 0) {
          delete rooms[roomId];
        }
      }
    }
  });
});

app.use(express.static('public'));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
