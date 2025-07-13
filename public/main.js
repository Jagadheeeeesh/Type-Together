const socket = io();
let username = '';
let paragraph = '';
let finished = false;
let currentRoom = null;
let hasClickedStart = false;
let startTime = null;
let wpm = 0;
let wordCount = 0;

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
  // Remove old overlay if any
  const oldOverlay = document.getElementById('typed-overlay');
  if (oldOverlay) oldOverlay.remove();
  document.getElementById('paragraph').textContent = '';
  document.getElementById('input').value = '';
  startTime = null;
  wpm = 0;
  document.getElementById('input').disabled = true;
  document.getElementById('waiting').style.display = 'none';
  document.getElementById('startBtn').style.display = 'block';
  document.getElementById('startBtn').disabled = false;
  hasClickedStart = false;
  renderParagraphOverlay('');
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

// Confetti animation
function showConfetti() {
  const confetti = document.createElement('canvas');
  confetti.id = 'confetti-canvas';
  confetti.style.position = 'fixed';
  confetti.style.left = 0;
  confetti.style.top = 0;
  confetti.style.width = '100vw';
  confetti.style.height = '100vh';
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = 1000;
  document.body.appendChild(confetti);
  // Simple confetti burst
  const ctx = confetti.getContext('2d');
  const pieces = Array.from({length: 120}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * -window.innerHeight,
    r: 6 + Math.random() * 8,
    d: 2 + Math.random() * 4,
    color: `hsl(${Math.random()*360},90%,60%)`,
    tilt: Math.random() * 10,
    tiltAngle: 0
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0,0,confetti.width,confetti.height);
    pieces.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += p.d;
      p.x += Math.sin(frame/10 + p.tilt) * 2;
      p.tiltAngle += 0.05;
      p.tilt = Math.sin(p.tiltAngle) * 10;
      if (p.y > window.innerHeight) p.y = Math.random() * -40;
    });
    frame++;
    if (frame < 180) requestAnimationFrame(draw);
    else confetti.remove();
  }
  confetti.width = window.innerWidth;
  confetti.height = window.innerHeight;
  draw();
}

function renderParagraphOverlay(inputVal) {
  const paraElem = document.getElementById('paragraph');
  let overlay = document.getElementById('typed-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'typed-overlay';
    paraElem.style.position = 'relative';
    paraElem.appendChild(overlay);
  }
  const paraWords = paragraph.split(/\s+/);
  // Use regex to split input into words, but preserve empty string if ends with space
  let inputWords = inputVal.match(/\S+|\s+/g) || [];
  let wordsTyped = [];
  let currentWord = '';
  let endsWithSpace = false;
  for (let i = 0; i < inputWords.length; i++) {
    if (inputWords[i].trim() === '') {
      endsWithSpace = true;
    } else {
      wordsTyped.push(inputWords[i]);
      endsWithSpace = false;
    }
  }
  // Only move to next word if the previous word is fully correct
  let correctWords = 0;
  for (let i = 0; i < wordsTyped.length; i++) {
    if (wordsTyped[i] === paraWords[i]) {
      correctWords++;
    } else {
      break;
    }
  }
  // If the last word is not correct, treat it as current word
  let html = '';
  for (let i = 0; i < paraWords.length; i++) {
    let cls = '';
    let style = '';
    let wordSpan = '';
    if (i < correctWords) {
      cls = 'word-correct';
    } else if (i === correctWords) {
      // Current word: only move if all previous are correct
      cls = 'word-current';
      style = 'background:#3730a3;color:#fff;text-decoration:underline;padding:0 4px;border-radius:6px;box-shadow:0 0 8px #818cf8;';
      let typed = wordsTyped[i] || '';
      let orig = paraWords[i];
      // Find first incorrect letter
      let cursorPos = 0;
      for (; cursorPos < typed.length && cursorPos < orig.length; cursorPos++) {
        if (typed[cursorPos] !== orig[cursorPos]) break;
      }
      let before = orig.slice(0, cursorPos);
      let after = orig.slice(cursorPos);
      wordSpan = `<span class=\"underline text-white bg-indigo-700 px-1 rounded\" style=\"${style}\">${before}<span class='typing-cursor'></span>${after}</span>`;
    } else if (i < wordsTyped.length) {
      // Incorrect word (typed but not correct and not current)
      cls = 'word-incorrect';
    }
    if (!wordSpan) wordSpan = `<span class="${cls}" style="${style}">${paraWords[i]}</span>`;
    html += wordSpan;
    if (i < paraWords.length - 1) html += ' ';
  }
  overlay.innerHTML = html;
  // Animate glowing cursor
  const cursor = overlay.querySelector('.typing-cursor');
  if (cursor) {
    cursor.style.display = 'inline-block';
    cursor.style.width = '1.1ch';
    cursor.style.height = '1.2em';
    cursor.style.background = 'linear-gradient(90deg,#818cf8 0%,#a5b4fc 100%)';
    cursor.style.borderRadius = '2px';
    cursor.style.marginLeft = '-2px';
    cursor.style.boxShadow = '0 0 8px #a5b4fc,0 0 16px #818cf8';
    cursor.style.animation = 'cursor-blink 1s steps(2) infinite';
  }
}

function getWPM(inputVal) {
  if (!startTime) return 0;
  const now = Date.now();
  const elapsed = (now - startTime) / 1000 / 60; // minutes
  if (elapsed === 0) return 0;
  const wordsTyped = inputVal.trim().split(/\s+/).filter(Boolean).length;
  return Math.round(wordsTyped / elapsed);
}

function getAccuracy(inputVal) {
  let correct = 0;
  for (let i = 0; i < inputVal.length && i < paragraph.length; i++) {
    if (inputVal[i] === paragraph[i]) correct++;
  }
  return paragraph.length ? Math.round((correct / paragraph.length) * 100) : 100;
}

function updateProgress(users) {
  const progressDiv = document.getElementById('progress');
  progressDiv.innerHTML = '';
  Object.values(users).forEach(user => {
    const percent = paragraph.length ? Math.floor((user.progress / paragraph.length) * 100) : 0;
    const bar = document.createElement('div');
    bar.className = 'progress-bar polished-bar';
    const isMe = user.username === username;
    let tooltip = '';
    let stats = '';
    if (isMe) {
      tooltip = ` data-tooltip="${wpm} WPM"`;
      stats = `<div class='user-stats'>WPM: <b>${wpm}</b> | Accuracy: <b>${getAccuracy(document.getElementById('input').value)}%</b></div>`;
    } else if (user.progress > 0) {
      stats = `<div class='user-stats'>WPM: <b>?</b> | Accuracy: <b>?</b></div>`;
    }
    bar.innerHTML = `<div class=\"progress-bar-inner polished-inner\" style=\"width:${percent}%\"${tooltip}>${user.username}: ${percent}%</div>${stats}`;
    progressDiv.appendChild(bar);
    // Show checkered flag or FINISHED banner
    if (user.finished) {
      let banner = document.createElement('div');
      banner.className = 'finish-banner';
      banner.innerHTML = '<span class="flag">🏁</span> <b>FINISHED!</b>';
      bar.appendChild(banner);
    }
  });
}

document.getElementById('input').addEventListener('input', function() {
  if (finished || !paragraph) return;
  if (!startTime) startTime = Date.now();
  const val = this.value;
  let progress = 0;
  for (let i = 0; i < val.length; i++) {
    if (val[i] === paragraph[i]) progress++;
    else break;
  }
  wpm = getWPM(val);
  renderParagraphOverlay(val);
  updateProgress({ ...window.lastUsers, [username]: { username, progress, finished } });
  socket.emit('progress', currentRoom, progress);
  if (progress === paragraph.length) {
    finished = true;
    socket.emit('finished', currentRoom);
    this.disabled = true;
    showConfetti();
  }
});

socket.on('updateUsers', (users) => {
  window.lastUsers = users;
  updateProgress(users);
});

socket.on('gameOver', (winner) => {
  document.getElementById('winner').textContent = `${winner} wins!`;
  document.getElementById('input').disabled = true;
  startTime = null;
});
