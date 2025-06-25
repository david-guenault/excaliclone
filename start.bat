@echo off
REM ABOUTME: Windows launch script for Excalibox development environment
REM ABOUTME: Starts the Vite dev server and opens the application in default browser

echo 🎨 Lancement d'Excalibox...
echo ================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installation des dependances...
    npm install
)

REM Start the development server
echo 🚀 Demarrage du serveur de developpement...
echo 📱 L'application sera disponible sur: http://localhost:5173
echo 🔥 Appuyez sur Ctrl+C pour arreter le serveur
echo.

REM Start dev server and open browser
start http://localhost:5173
npm run dev