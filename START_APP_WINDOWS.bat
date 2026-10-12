@echo off
title CalorieAI starten
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js fehlt.
  echo Bitte installiere zuerst die LTS-Version von https://nodejs.org/
  pause
  exit /b 1
)

echo CalorieAI wird vorbereitet...
call npm install
if errorlevel 1 (
  echo Die Installation ist fehlgeschlagen. Pruefe deine Internetverbindung.
  pause
  exit /b 1
)

echo.
echo Expo Go auf dem iPhone oeffnen und den QR-Code scannen.
echo PC und iPhone muessen im selben WLAN sein.
echo.
call npx expo start --lan
pause
