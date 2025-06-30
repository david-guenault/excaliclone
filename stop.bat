@echo off
REM ABOUTME: Stop script for Excalibox development environment (Windows)
REM ABOUTME: Stops all Vite dev servers and related processes

echo 🛑 Arrêt d'Excalibox...
echo ================================

REM Stop Node.js processes related to Vite
echo 🔍 Recherche des processus Vite...
for /f "tokens=2" %%i in ('tasklist ^| findstr /i "node.exe"') do (
    wmic process where "ProcessId=%%i" get CommandLine /value 2>nul | findstr /i "vite" >nul
    if not errorlevel 1 (
        echo ⏹️  Arrêt du processus Vite %%i
        taskkill /PID %%i /F >nul 2>&1
    )
)

REM Stop any processes using common Vite ports
echo 🔌 Vérification des ports Vite...
for %%p in (5173 5174 5175 5176 5177) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p') do (
        if not "%%a"=="" (
            echo 🔌 Arrêt du processus utilisant le port %%p (PID: %%a)
            taskkill /PID %%a /F >nul 2>&1
        )
    )
)

REM Stop npm processes
echo 📦 Arrêt des processus npm...
tasklist | findstr /i "npm.cmd" >nul
if not errorlevel 1 (
    taskkill /IM npm.cmd /F >nul 2>&1
    echo ✅ Processus npm arrêtés
)

echo.
echo ✅ Excalibox arrêté avec succès!
echo 💡 Utilisez 'start.bat' ou 'npm run start:win' pour redémarrer
echo.
pause