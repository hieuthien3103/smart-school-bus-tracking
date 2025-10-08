#!/bin/bash

echo "======================================="
echo "   Smart School Bus System Startup"
echo "======================================="
echo

echo "1. Starting Backend Server..."
cd backend
gnome-terminal --title="Backend Server" -- bash -c "npm run dev; exec bash" &

echo
echo "2. Waiting for backend to start..."
sleep 5

echo
echo "3. Starting Frontend Development Server..."
cd ..
gnome-terminal --title="Frontend Server" -- bash -c "npm run dev; exec bash" &

echo
echo "4. Opening System in Browser..."
sleep 10
xdg-open "http://localhost:5173" &

echo
echo "======================================="
echo "System is starting up..."
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo "======================================="
echo
echo "Press Enter to exit..."
read