# Type Together

A modern, real-time multiplayer typing game for developers, built with Node.js, Express, and Socket.IO. Compete with friends or strangers in 2-player rooms, race to type code-themed sentences, and enjoy a beautiful glassmorphism UI with live stats and animated effects.

## Live: https://type-together-production.up.railway.app/

## Features

- **Real-time Multiplayer:** Join a room and race against another player in real time.
- **Random Sentences:** Each game uses a randomly selected 20-word developer-themed sentence.
- **Modern UI:** Glassmorphism/neumorphism design, animated progress bars, and dev fonts (JetBrains Mono, Fira Code, Space Mono).
- **Word-by-Word Highlighting:** Color-coded feedback for correct, incorrect, and current words as you type.
- **Glowing Typing Cursor:** Animated cursor shows your current position in the word.
- **Live Stats:** See your WPM and accuracy in real time, with a tooltip on the progress bar.
- **Confetti & Finish Banner:** Celebrate your win with confetti and a checkered flag banner.
- **Responsive Design:** Works great on desktop and mobile.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)

### Installation

1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd code-together
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm start
   ```
4. Open your browser and go to [http://localhost:3000](http://localhost:3000)

## How to Play

1. Enter your name and click **Join Game**.
2. Wait for another player to join your room.
3. Click **Start** when both players are ready.
4. Type the displayed sentence as quickly and accurately as possible.
5. Watch your progress, WPM, and accuracy update in real time.
6. The first to finish wins and triggers a confetti celebration!

## Project Structure

```
code-together/
├── public/
│   ├── index.html      # Main frontend HTML
│   ├── main.js         # Frontend JS logic
│   ├── style.css       # All styles (glassmorphism, animations, etc.)
├── server.js           # Node.js + Express + Socket.IO backend
├── package.json        # Project metadata and dependencies
```

## Customization

- **Sentences:** Edit the `PARAGRAPHS` array in `server.js` to add or change the typing challenges.
- **UI/UX:** Tweak `public/style.css` for colors, fonts, and effects.

