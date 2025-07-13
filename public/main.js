const socket = io();
let username = '';
let paragraph = '';
let finished = false;
let currentRoom = null;
let hasClickedStart = false;

window.onload = () => {
  document.getElementById('game').style.display = 'none';
};

document.getElementById('joinBtn').onclick = () => {
  username = document.getElementById('username').value.trim();
  if (!username) return alert('Enter username!');
  socket.emit('findRoom', username);
  document.getElementById('lobby').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  document.getElementById('winner').textContent = '';
  document.getElementById('input').value = '';
  finished = false;
  document.getElementById('paragraph').textContent = '';
  document.getElementById('input').disabled = true;
  document.getElementById('progress').innerHTML = '';
  document.getElementById('waiting').style.display = 'block';
  document.getElementById('startBtn').style.display = 'none';
};

socket.on('roomAssigned', (roomId) => {
  currentRoom = roomId;
});

socket.on('waitingForPlayer', () => {
  document.getElementById('waiting').style.display = 'block';
  document.getElementById('waiting').textContent = 'Waiting for player...';
  document.getElementById('input').disabled = true;
  document.getElementById('startBtn').style.display = 'none';
});

socket.on('startGame', (users, para) => {
  paragraph = para;
  document.getElementById('paragraph').textContent = paragraph;
  document.getElementById('input').disabled = true;
  document.getElementById('waiting').style.display = 'none';
  document.getElementById('startBtn').style.display = 'block';
  document.getElementById('startBtn').disabled = false;
  hasClickedStart = false;
  updateProgress(users);
});

document.getElementById('startBtn').onclick = () => {
  if (!hasClickedStart) {
    socket.emit('playerReady', currentRoom);
    hasClickedStart = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('waiting').style.display = 'block';
    document.getElementById('waiting').textContent = 'Waiting for other player to start...';
  }
};

socket.on('bothReady', () => {
  document.getElementById('input').disabled = false;
  document.getElementById('startBtn').style.display = 'none';
  document.getElementById('waiting').style.display = 'none';
  document.getElementById('waiting').textContent = '';
  document.getElementById('input').focus();
});

socket.on('updateUsers', (users) => {
  updateProgress(users);
});

function updateProgress(users) {
  const progressDiv = document.getElementById('progress');
  progressDiv.innerHTML = '';
  Object.values(users).forEach(user => {
    const percent = paragraph.length ? Math.floor((user.progress / paragraph.length) * 100) : 0;
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.innerHTML = `<div class=\"progress-bar-inner\" style=\"width:${percent}%\">${user.username}: ${percent}%</div>`;
    progressDiv.appendChild(bar);
  });
}

document.getElementById('input').addEventListener('input', function() {
  if (finished || !paragraph) return;
  const val = this.value;
  let progress = 0;
  for (let i = 0; i < val.length; i++) {
    if (val[i] === paragraph[i]) progress++;
    else break;
  }
  socket.emit('progress', currentRoom, progress);
  if (progress === paragraph.length) {
    finished = true;
    socket.emit('finished', currentRoom);
    this.disabled = true;
  }
});

socket.on('gameOver', (winner) => {
  document.getElementById('winner').textContent = `${winner} wins!`;
  document.getElementById('input').disabled = true;
});
