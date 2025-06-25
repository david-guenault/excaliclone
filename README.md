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
- **Drawing**: HTML5 Canvas + Rough.js (en cours)
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

## 🔄 Développement

```bash
npm run dev      # Serveur de développement
npm run build    # Build production
npm run lint     # Vérification ESLint
```

## 📋 Roadmap

- [ ] Style dessiné à la main avec Rough.js
- [ ] Outils de sélection et manipulation
- [ ] Export PNG/SVG
- [ ] Collaboration temps réel
- [ ] Plus d'outils de dessin