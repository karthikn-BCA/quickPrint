@echo off
title CampusPrint Launcher
echo ========================================================
echo       Starting CampusPrint Platform Services
echo ========================================================

echo [1/3] Launching Backend API (Port 5000)...
start "CampusPrint Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"

echo [2/3] Launching Frontend UI (Port 5173)...
start "CampusPrint Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Launching Print Spooler Agent (Simulate Mode)...
start "CampusPrint Print Agent" cmd /k "cd /d %~dp0print-agent && npm run simulate"

echo.
echo ========================================================
echo All services started!
echo - Public Website:  http://localhost:5173
echo - Admin Portal:    http://localhost:5173/admin/login
echo - Backend API:     http://localhost:5000
echo ========================================================
echo.
pause
