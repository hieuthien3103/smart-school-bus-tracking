@echo off
echo =======================================
echo     Smart School Bus System Startup
echo =======================================

echo.
echo 1. Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo 2. Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 3. Starting Frontend Development Server...
cd ..
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 4. Opening System in Browser...
timeout /t 10 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo =======================================
echo System is starting up...
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo =======================================
echo.
echo Press any key to exit this window...
pause >nul