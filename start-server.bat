@echo off
title NAISHVI EVENT EMPIRE - Web Server
cd /d "%~dp0"
echo ===================================================
echo   NAISHVI EVENT EMPIRE - Starting Local Server
echo ===================================================
echo.
echo Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=%PATH%;C:\Program Files\nodejs"
    )
)

echo Starting Server on http://localhost:3000 ...
start "" "http://localhost:3000"
node dev-server.js
pause
