#!/bin/bash

# ABOUTME: Launch script for Excalibox development environment
# ABOUTME: Starts the Vite dev server and opens the application in Firefox

echo "🎨 Lancement d'Excalibox..."
echo "================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Start the development server
echo "🚀 Démarrage du serveur de développement..."
echo "📱 L'application sera disponible sur: http://localhost:5173"
echo "🔥 Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Start dev server in background and capture PID
npm run dev &
DEV_PID=$!

# Wait a moment for server to start
sleep 3

# Try to open in Firefox
if command -v firefox >/dev/null 2>&1; then
    echo "🦊 Ouverture dans Firefox..."
    firefox http://localhost:5173 >/dev/null 2>&1 &
else
    echo "⚠️  Firefox non trouvé. Ouvrez manuellement: http://localhost:5173"
fi

# Wait for the dev server process
wait $DEV_PID