# Quick Start Guide

## Prerequisites Check
1. ✅ Node.js installed (check: `node --version`)
2. ✅ MongoDB installed and running
3. ✅ Dependencies installed

## Start the Game

### Option 1: Using the Batch Script (Windows)
Double-click `start.bat` in the Tambola folder

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd C:\Users\User\Desktop\Tambola\backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\User\Desktop\Tambola\frontend
npm start
```

## Access the Game
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Testing the Game

### Single Player Test
1. Open http://localhost:3000
2. Enter your name and check "I am the host"
3. Click "Join Game"
4. You'll see your ticket and the number board
5. Click "Call Next Number" to call numbers
6. Click numbers on your ticket to mark them
7. Try claiming prizes when patterns are complete

### Multi-Player Test
1. Open http://localhost:3000 in multiple browser tabs/windows
2. In the first tab:
   - Enter name (e.g., "Host")
   - Check "I am the host"
   - Join game
3. In other tabs:
   - Enter different names (e.g., "Player1", "Player2")
   - Don't check host
   - Join game
4. From the host tab, call numbers
5. All players will see numbers update in real-time
6. Players mark their tickets and compete for prizes

## Game Features to Test

### ✅ Ticket Generation
- Each player gets a unique 3x9 ticket
- 15 numbers per ticket (5 per row)
- Numbers follow column ranges (1-9, 10-19, etc.)

### ✅ Number Calling
- Host can call random numbers from 1-90
- All players see the same called numbers
- Last called number is highlighted

### ✅ Prize Claims
Test each prize type:
1. **First Line** - Complete any one row (100 pts)
2. **Second Line** - Complete a second row (100 pts)
3. **Third Line** - Complete all three rows (100 pts)
4. **Corners** - Mark all 4 corner numbers (50 pts)
5. **Full House** - Mark all 15 numbers (200 pts, 2 winners)

### ✅ Last Number Validation
- Try claiming a prize WITHOUT marking the last called number
- You should see an error message
- Mark the last number and claim again - should work

### ✅ Game End
- Game automatically ends when all prizes are claimed
- Prize tracker shows all winners

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service
- Windows: `net start MongoDB`
- Or start MongoDB Compass

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** 
- Kill the process using the port
- Or change PORT in backend/.env

### Frontend Won't Connect to Backend
**Solution:**
- Check backend is running on port 5000
- Check SOCKET_URL in frontend/src/App.jsx matches backend URL

## Reset Game
To start a fresh game:
```bash
curl -X POST http://localhost:5000/api/game/reset
```
Or restart the backend server.
