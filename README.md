# 🎲 Tambola Game - MERN Stack

A real-time multiplayer Tambola (Housie/Bingo) game built with MongoDB, Express, React, and Node.js. Players can join games, receive tickets, mark numbers as they're called, and claim prizes in real-time.

## Features

✨ **Real-time Gameplay** - Socket.IO powered instant updates
🎫 **Auto-generated Tickets** - Valid Tambola tickets (3x9 grid, 15 numbers)
🏆 **Multiple Prizes** - First/Second/Third Line, Corners, and Full House
✅ **Smart Validation** - Last number must be marked to claim prizes
👥 **Multiplayer Support** - Multiple players can join simultaneously
🎨 **Modern UI** - Glassmorphism design with smooth animations

## Prize Structure

| Prize | Points | Winners |
|-------|--------|---------|
| First Line | 100 | 1 |
| Second Line | 100 | 1 |
| Third Line | 100 | 1 |
| Corners | 50 | 1 |
| Full House | 200 | 2 |

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
cd C:\Users\User\Desktop\Tambola
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Edit `backend/.env` if needed:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tambola
```

## Running the Application

### 1. Start MongoDB
Make sure MongoDB is running on your system.

### 2. Start Backend Server
```bash
cd backend
npm run dev
```
Server will run on `http://localhost:5000`

### 3. Start Frontend
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

## How to Play

### For Host:
1. Open the app and enter your name
2. Check "I am the host" checkbox
3. Click "Join Game"
4. Use the "Call Next Number" button to call numbers
5. Monitor prize claims and winners

### For Players:
1. Open the app and enter your name
2. Click "Join Game"
3. You'll receive a unique Tambola ticket
4. Click on numbers in your ticket when they're called to mark them
5. When you complete a pattern, click the corresponding claim button
6. **Important:** The last called number must be marked on your ticket to claim a prize!

## Game Rules

- **Lines:** Complete all 5 numbers in any row
- **Corners:** Mark all 4 corner numbers of your ticket
- **Full House:** Mark all 15 numbers on your ticket
- **Last Number Rule:** When claiming, the most recently called number must be marked on your ticket

## Project Structure

```
Tambola/
├── backend/
│   ├── models/
│   │   ├── Game.js          # Game state schema
│   │   └── Player.js        # Player and ticket schema
│   ├── utils/
│   │   ├── ticketGenerator.js   # Ticket generation logic
│   │   └── prizeValidator.js    # Prize validation logic
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NumberBoard.jsx      # 1-90 number display
│   │   │   ├── NumberCaller.jsx     # Host controls
│   │   │   ├── PlayerTicket.jsx     # Player's ticket
│   │   │   ├── ClaimButton.jsx      # Prize claim buttons
│   │   │   └── PrizeTracker.jsx     # Prize status display
│   │   ├── App.jsx          # Main app component
│   │   └── index.js
│   └── package.json
└── README.md
```

## Technologies Used

### Backend
- **Express.js** - Web server framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - Database for game state and players
- **Mongoose** - MongoDB object modeling

### Frontend
- **React** - UI library
- **Socket.IO Client** - Real-time communication
- **CSS3** - Modern styling with glassmorphism

## API Endpoints

- `GET /api/game/status` - Get current game status
- `POST /api/game/reset` - Reset the game (creates new game)

## Socket Events

### Client → Server
- `joinGame` - Player joins with name
- `callNumber` - Host calls next number
- `markNumber` - Player marks a number
- `claimPrize` - Player claims a prize

### Server → Client
- `ticketGenerated` - Send ticket to player
- `gameState` - Current game state
- `numberCalled` - Broadcast called number
- `prizeAwarded` - Announce prize winner
- `claimRejected` - Invalid claim notification
- `gameEnded` - Game over notification

## Contributing

Feel free to fork this project and submit pull requests!

## License

MIT License
