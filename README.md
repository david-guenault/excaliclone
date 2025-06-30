# 🎨 Excalibox

Un clone d'Excalidraw - Tableau blanc virtuel pour dessiner des diagrammes au style dessiné à la main.

## 🚀 Lancement rapide

### Linux/Mac
```bash
./start.sh
```

### Windows
```cmd
start.bat
```

### Ou manuellement
```bash
npm install
npm run dev
```

## 🎯 Fonctionnalités actuelles

- ✅ Canvas HTML5 interactif
- ✅ Outils Rectangle et Cercle
- ✅ Sélection d'outils via interface
- ✅ Rendu en temps réel
- ✅ Architecture extensible

## 🛠️ Technologies

- **Frontend**: React 19 + TypeScript
- **Build**: Vite
- **State**: Zustand
- **Drawing**: HTML5 Canvas + Rough.js
- **Styling**: CSS Modules

## 📁 Structure

```
src/
├── components/
│   └── Canvas/          # Composant canvas principal
├── store/               # Gestion d'état Zustand
├── types/               # Types TypeScript
├── utils/               # Fonctions utilitaires
└── constants/           # Constantes application
```

## 🎮 Comment utiliser

1. Lancez l'application avec `./start.sh`
2. Sélectionnez un outil (Rectangle ou Circle)
3. Cliquez sur le canvas pour dessiner
4. Utilisez le bouton Select pour la sélection

## 🔄 Scripts de gestion

### Démarrage
```bash
# Linux/Mac
./start.sh
npm run start

# Windows  
start.bat
npm run start:win
```

### Arrêt
```bash
# Linux/Mac
./stop.sh
npm run stop

# Windows
stop.bat
npm run stop:win
```

### Status
```bash
# Linux/Mac
./status.sh
npm run status

# Windows
status.bat
npm run status:win
```

### Développement
```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run lint         # Vérification ESLint
npm run test         # Tests unitaires
npm run test:watch   # Tests en mode watch
npm run test:coverage # Couverture des tests
```

## 📋 Roadmap

- [x] Style dessiné à la main avec Rough.js ✅
- [x] Interface de propriétés avec contrôles de rugosité ✅
- [x] Scripts de gestion (start/stop/status) ✅
- [ ] Palette de couleurs complète
- [ ] Outils ligne et flèche
- [ ] Outil de dessin libre
- [ ] Outil de texte
- [ ] Outils de sélection et manipulation avancés
- [ ] Export PNG/SVG
- [ ] Collaboration temps réel
- [ ] Plus d'outils de dessin