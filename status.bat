@echo off
setlocal enabledelayedexpansion

REM ABOUTME: Status script for Excalibox development environment (Windows)
REM ABOUTME: Shows the current status of all application processes and services

echo 📊 Status d'Excalibox
echo ================================

set "DEV_SERVER_RUNNING=false"

REM Check for Vite processes
echo 🚀 Serveur de développement:
set "found_vite=false"

REM Check Node.js processes for Vite
for /f "tokens=2,9" %%i in ('tasklist /FO TABLE ^| findstr /i "node.exe"') do (
    wmic process where "ProcessId=%%i" get CommandLine /value 2>nul | findstr /i "vite" >nul
    if not errorlevel 1 (
        echo ✅ Serveur Vite actif (PID: %%i)
        set "found_vite=true"
        set "DEV_SERVER_RUNNING=true"
    )
)

if "!found_vite!"=="false" (
    echo ❌ Aucun serveur de développement Vite détecté
)

REM Check ports
echo.
echo 🔌 Ports Vite:
for %%p in (5173 5174 5175 5176 5177) do (
    netstat -ano | findstr :%%p >nul 2>&1
    if not errorlevel 1 (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
            if not "%%a"=="" (
                echo ✅ Port %%p en utilisation (PID: %%a)
                REM Try to check if it responds
                curl -s -o nul -w "%%{http_code}" http://localhost:%%p 2>nul | findstr "200" >nul
                if not errorlevel 1 (
                    echo    🌐 Application accessible: http://localhost:%%p
                ) else (
                    echo    ⚠️  Port ouvert mais application non accessible
                )
            )
        )
    ) else (
        echo ❌ Port %%p libre
    )
)

echo.
echo 📦 Processus NPM:
tasklist | findstr /i "npm" >nul
if not errorlevel 1 (
    echo ✅ Processus npm actifs:
    for /f "tokens=1,2" %%i in ('tasklist /FO TABLE ^| findstr /i "npm"') do (
        echo    📋 %%i (PID: %%j)
    )
) else (
    echo ❌ Aucun processus npm actif
)

echo.
echo 🔧 Dépendances du projet:
if exist "node_modules" (
    echo ✅ node_modules installé
    if exist "package-lock.json" (
        echo ✅ package-lock.json présent
    ) else (
        echo ⚠️  package-lock.json manquant
    )
) else (
    echo ❌ node_modules manquant - exécutez 'npm install'
)

echo.
echo 🏗️  Compilation TypeScript:
where tsc >nul 2>&1
if not errorlevel 1 (
    npx tsc --noEmit >nul 2>&1
    if not errorlevel 1 (
        echo ✅ Compilation TypeScript OK
    ) else (
        echo ❌ Erreurs de compilation TypeScript détectées
        echo    📝 Utilisez 'npm run build' pour voir les détails
    )
) else (
    echo ⚠️  TypeScript non disponible
)

echo.
echo 🔍 Linting:
where eslint >nul 2>&1
if not errorlevel 1 (
    npx eslint . --format=compact >nul 2>&1
    if not errorlevel 1 (
        echo ✅ Aucune erreur de linting
    ) else (
        echo ⚠️  Problèmes de linting détectés
        echo    📝 Utilisez 'npm run lint' pour voir les détails
    )
) else (
    echo ⚠️  ESLint non disponible
)

echo.
echo 🧪 Tests:
if exist "src\__tests__" (
    echo ✅ Tests détectés dans le projet
    echo    📝 Utilisez 'npm test' pour exécuter les tests
) else (
    echo ℹ️  Aucun dossier de tests détecté
)

echo.
echo 💻 Ressources système:
REM Get memory info
for /f "tokens=2 delims=:" %%i in ('systeminfo ^| findstr /i "Total Physical Memory"') do (
    echo    🧠 Mémoire totale:%%i
)

REM Get disk space for current drive
for /f "tokens=3" %%i in ('dir /-c ^| findstr /i bytes') do (
    echo    💾 Espace libre: %%i bytes
)

echo.
echo ================================

REM Summary
if "!DEV_SERVER_RUNNING!"=="true" (
    echo 🎉 Excalibox est en cours d'exécution et prêt!
    echo 💡 Utilisez 'stop.bat' pour arrêter l'application
) else (
    echo 😴 Excalibox est arrêté
    echo 💡 Utilisez 'start.bat' ou 'npm run start:win' pour démarrer
)

echo.
pause