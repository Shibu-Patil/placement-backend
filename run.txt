@echo off
cd /d "%~dp0"

echo ===================================================
echo Installing backend dependencies...
echo ===================================================
call npm install

echo ===================================================
echo Starting Node.js server...
echo ===================================================
start "Node Server" cmd /k "node server.js"

pause
