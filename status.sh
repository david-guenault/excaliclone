#!/bin/bash

# ABOUTME: Status script for Excalibox development environment
# ABOUTME: Shows the current status of all application processes and services

echo "📊 Status d'Excalibox"
echo "================================"

# Function to check if a port is in use
check_port() {
    local port=$1
    local service_name=$2
    
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        PROCESS_INFO=$(ps -p $PID -o comm= 2>/dev/null)
        echo "✅ $service_name actif sur le port $port (PID: $PID, Process: $PROCESS_INFO)"
        return 0
    else
        echo "❌ $service_name inactif sur le port $port"
        return 1
    fi
}

# Function to check processes by pattern
check_processes() {
    local pattern=$1
    local description=$2
    
    PIDS=$(ps aux | grep "$pattern" | grep -v grep | awk '{print $2}')
    if [ ! -z "$PIDS" ]; then
        echo "✅ $description actif(s) (PID: $(echo $PIDS | tr '\n' ' '))"
        for PID in $PIDS; do
            PROCESS_INFO=$(ps -p $PID -o pid,ppid,etime,comm,args --no-headers 2>/dev/null)
            echo "   📋 $PROCESS_INFO"
        done
        return 0
    else
        echo "❌ $description inactif(s)"
        return 1
    fi
}

# Check development server status
echo "🚀 Serveur de développement:"
DEV_SERVER_RUNNING=false

# Check common Vite ports
for PORT in 5173 5174 5175 5176 5177; do
    if check_port $PORT "Serveur Vite"; then
        DEV_SERVER_RUNNING=true
        
        # Try to get the actual URL
        if command -v curl >/dev/null 2>&1; then
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null)
            if [ "$HTTP_STATUS" = "200" ]; then
                echo "   🌐 Application accessible: http://localhost:$PORT"
            else
                echo "   ⚠️  Port ouvert mais application non accessible (HTTP $HTTP_STATUS)"
            fi
        fi
        break
    fi
done

if [ "$DEV_SERVER_RUNNING" = false ]; then
    echo "❌ Aucun serveur de développement détecté"
fi

echo ""

# Check Node.js processes related to the project
echo "📦 Processus Node.js du projet:"
check_processes "node.*$(basename $(pwd))" "processus Node.js du projet"

echo ""

# Check npm processes
echo "📝 Processus NPM:"
check_processes "npm.*dev" "processus npm run dev"

echo ""

# Check if project dependencies are installed
echo "🔧 Dépendances du projet:"
if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo "✅ node_modules installé ($NODE_MODULES_SIZE)"
    
    # Check if package-lock.json exists
    if [ -f "package-lock.json" ]; then
        echo "✅ package-lock.json présent"
    else
        echo "⚠️  package-lock.json manquant"
    fi
else
    echo "❌ node_modules manquant - exécutez 'npm install'"
fi

# Check TypeScript compilation
echo ""
echo "🏗️  Compilation TypeScript:"
if command -v npx >/dev/null 2>&1; then
    TSC_OUTPUT=$(npx tsc --noEmit 2>&1)
    TSC_EXIT_CODE=$?
    
    if [ $TSC_EXIT_CODE -eq 0 ]; then
        echo "✅ Compilation TypeScript OK"
    else
        echo "❌ Erreurs de compilation TypeScript détectées"
        echo "   📝 Utilisez 'npm run build' pour voir les détails"
    fi
else
    echo "⚠️  TypeScript non disponible"
fi

# Check linting
echo ""
echo "🔍 Linting:"
if command -v npx >/dev/null 2>&1; then
    ESLINT_OUTPUT=$(npx eslint . --format=compact 2>&1 | wc -l)
    if [ "$ESLINT_OUTPUT" -eq 0 ]; then
        echo "✅ Aucune erreur de linting"
    else
        echo "⚠️  $ESLINT_OUTPUT problèmes de linting détectés"
        echo "   📝 Utilisez 'npm run lint' pour voir les détails"
    fi
else
    echo "⚠️  ESLint non disponible"
fi

# Check test status
echo ""
echo "🧪 Tests:"
if [ -d "src/__tests__" ] || [ -d "src/**/__tests__" ] || find src -name "*.test.*" -type f | grep -q .; then
    echo "✅ Tests détectés dans le projet"
    echo "   📝 Utilisez 'npm test' pour exécuter les tests"
else
    echo "ℹ️  Aucun test détecté"
fi

# System resources
echo ""
echo "💻 Ressources système:"
if command -v free >/dev/null 2>&1; then
    MEMORY_USAGE=$(free -h | grep '^Mem:' | awk '{print $3 "/" $2}')
    echo "   🧠 Mémoire utilisée: $MEMORY_USAGE"
fi

if command -v df >/dev/null 2>&1; then
    DISK_USAGE=$(df -h . | tail -1 | awk '{print $3 "/" $2 " (" $5 " utilisé)"}')
    echo "   💾 Espace disque: $DISK_USAGE"
fi

# Load average
if [ -f /proc/loadavg ]; then
    LOAD_AVG=$(cat /proc/loadavg | cut -d' ' -f1-3)
    echo "   ⚡ Charge système: $LOAD_AVG"
fi

echo ""
echo "================================"

# Summary
if [ "$DEV_SERVER_RUNNING" = true ]; then
    echo "🎉 Excalibox est en cours d'exécution et prêt!"
    echo "💡 Utilisez './stop.sh' pour arrêter l'application"
else
    echo "😴 Excalibox est arrêté"
    echo "💡 Utilisez './start.sh' ou 'npm run start' pour démarrer"
fi

echo ""