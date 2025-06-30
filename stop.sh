#!/bin/bash

# ABOUTME: Stop script for Excalibox development environment
# ABOUTME: Stops all Vite dev servers and related processes

echo "🛑 Arrêt d'Excalibox..."
echo "================================"

# Function to stop processes by pattern
stop_processes() {
    local pattern=$1
    local description=$2
    
    # Find PIDs matching the pattern
    PIDS=$(ps aux | grep "$pattern" | grep -v grep | awk '{print $2}')
    
    if [ ! -z "$PIDS" ]; then
        echo "🔍 $description trouvé(s), arrêt en cours..."
        for PID in $PIDS; do
            echo "   ⏹️  Arrêt du processus $PID"
            kill -TERM $PID 2>/dev/null || kill -KILL $PID 2>/dev/null
        done
        
        # Wait a moment and check if processes are still running
        sleep 2
        REMAINING_PIDS=$(ps aux | grep "$pattern" | grep -v grep | awk '{print $2}')
        if [ ! -z "$REMAINING_PIDS" ]; then
            echo "   💀 Force l'arrêt des processus restants..."
            for PID in $REMAINING_PIDS; do
                kill -KILL $PID 2>/dev/null
            done
        fi
        echo "   ✅ $description arrêté(s)"
    else
        echo "ℹ️  Aucun $description en cours d'exécution"
    fi
}

# Stop Vite dev servers
stop_processes "vite.*excalibox" "serveur de développement Vite"

# Stop any Node.js processes running from this directory
stop_processes "node.*$(pwd)" "processus Node.js du projet"

# Stop any npm run dev processes
stop_processes "npm run dev" "processus npm run dev"

# Stop any processes using the default Vite ports
for PORT in 5173 5174 5175 5176 5177; do
    PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "🔌 Arrêt du processus utilisant le port $PORT (PID: $PID)"
        kill -TERM $PID 2>/dev/null || kill -KILL $PID 2>/dev/null
    fi
done

echo ""
echo "✅ Excalibox arrêté avec succès!"
echo "💡 Utilisez './start.sh' ou 'npm run start' pour redémarrer"
echo ""