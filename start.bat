@echo off
echo Starting Tambola Game Backend...
echo.
echo Make sure MongoDB is running!
echo.
cd backend
start cmd /k "npm run dev"
echo Backend server starting...
echo.
timeout /t 3 /nobreak > nul
echo Starting Frontend...
cd ../frontend
start cmd /k "npm start"
echo.
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
