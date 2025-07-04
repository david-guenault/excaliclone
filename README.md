# 🎨 Excalibox

Un clone d'Excalidraw moderne - Tableau blanc virtuel pour créer des diagrammes au style dessiné à la main avec une interface utilisateur intuitive.

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

### 🎨 Outils de dessin
- ✅ Rectangle avec options de style
- ✅ Cercle/Ellipse avec contraintes
- ✅ Ligne avec accrochage angulaire
- ✅ Flèche avec têtes configurables
- ✅ Dessin libre (pen tool)
- ✅ Outil de texte avec édition directe

### 🎮 Interface utilisateur
- ✅ Barre d'outils moderne avec icônes
- ✅ Panneau de propriétés contextuel
- ✅ Menu d'options avec dialog de grille
- ✅ Contrôles de zoom et navigation
- ✅ Interface responsive et accessible

### 🎨 Rendu et style
- ✅ Rendu Rough.js avec style dessiné à la main
- ✅ Contrôle de rugosité fine (0.0-3.0)
- ✅ Palette de couleurs (Open Colors)
- ✅ Styles de trait (solide, pointillé, tiret)
- ✅ Remplissage avec motifs (hachures, croisillons)
- ✅ Contrôle d'opacité

### ⚡ Fonctionnalités avancées
- ✅ Sélection multiple avec Shift+Click
- ✅ Sélection par zone (drag selection)
- ✅ Navigation clavier (Tab, flèches)
- ✅ Raccourcis clavier complets
- ✅ Système de grille avec accrochage
- ✅ Historique annuler/refaire
- ✅ Copier/coller d'éléments et styles
- ✅ Gestion des calques (avant/arrière)

### 🔧 Fonctions avancées
- ✅ Zoom et panoramique fluides
- ✅ Double-clic pour édition de texte
- ✅ Contraintes avec touches modificatrices
- ✅ Verrouillage d'éléments
- ✅ Tests automatisés complets

## 🛠️ Technologies

- **Frontend**: React 19 + TypeScript
- **Build**: Vite avec HMR
- **State**: Zustand (store global)
- **Drawing**: HTML5 Canvas + Rough.js
- **Styling**: CSS natif avec modules
- **Tests**: Vitest + Testing Library
- **Icons**: SVG personnalisés
- **TypeScript**: Configuration stricte

## 📁 Structure du projet

```
src/
├── components/
│   ├── Canvas/           # Moteur de rendu canvas
│   ├── TopToolbar/       # Barre d'outils principale
│   ├── PropertiesPanel/  # Panneau de propriétés
│   ├── GridDialog/       # Dialog de configuration grille
│   └── ZoomControl/      # Contrôles de zoom
├── store/                # Gestion d'état Zustand
├── types/                # Types TypeScript
├── utils/                # Utilitaires (keyboard, grid, etc.)
├── constants/            # Constantes et configuration
└── __tests__/            # Tests d'intégration
```

## 🎮 Guide d'utilisation

### Outils de base
- **S** - Outil de sélection
- **R** - Rectangle
- **C** - Cercle 
- **L** - Ligne
- **A** - Flèche
- **P** - Dessin libre
- **T** - Texte

### Raccourcis clavier
- **Ctrl+Z/Y** - Annuler/Refaire
- **Ctrl+C/V** - Copier/Coller
- **Ctrl+D** - Dupliquer
- **Delete** - Supprimer
- **G** - Configuration grille
- **Space+drag** - Panoramique
- **Ctrl+scroll** - Zoom

### Navigation
- **Tab/Shift+Tab** - Navigation entre éléments
- **Flèches** - Déplacement de sélection
- **Shift+Click** - Sélection multiple
- **Double-click** - Édition texte

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

### ✅ Phase 1: Core Drawing Tools (Complété)
- [x] Interface de base avec barre d'outils moderne
- [x] Outils de dessin fondamentaux (Rectangle, Cercle, Ligne, Flèche, Pen, Texte)
- [x] Style dessiné à la main avec Rough.js
- [x] Système de raccourcis clavier complet
- [x] Panneau de propriétés contextuel
- [x] Palette de couleurs Open Colors
- [x] Système de grille avec accrochage

### ✅ Phase 2: Advanced Selection & Interaction (Complété)  
- [x] Sélection multiple avancée (Shift+Click, Ctrl+A)
- [x] Sélection par zone avec rectangle de sélection
- [x] Navigation clavier entre éléments
- [x] Manipulation de groupes d'éléments
- [x] Opérations bulk (suppression, duplication, style)
- [x] Historique annuler/refaire
- [x] Copier/coller d'éléments et styles

### ✅ Phase 3: Polish & UX (Complété)
- [x] Double-clic pour édition de texte directe
- [x] Interface de dialog pour configuration grille
- [x] Zoom et panoramique fluides
- [x] Contraintes avec modificateurs (Shift, Alt)
- [x] Gestion des calques (avant/arrière)
- [x] Tests automatisés complets (>150 tests)

### 🚧 Phase 4: Export & Sharing (En cours)
- [ ] Export PNG haute qualité
- [ ] Export SVG vectoriel
- [ ] Sauvegarde locale (localStorage)
- [ ] Import/export de fichiers JSON
- [ ] Impression avec mise en page

### 🔮 Phase 5: Advanced Features (Planifié)
- [ ] Outil de texte enrichi (markdown)
- [ ] Formes géométriques additionnelles (Diamond, Star)
- [ ] Connecteurs intelligents entre formes
- [ ] Bibliothèque de templates/stencils
- [ ] Mode présentation (slides)

### 🌐 Phase 6: Collaboration (Futur)
- [ ] Sauvegarde cloud
- [ ] Collaboration temps réel
- [ ] Commentaires et annotations
- [ ] Historique des versions
- [ ] Partage de liens

### 📊 Statistiques actuelles
- **📁 Fichiers**: ~100 fichiers TypeScript/CSS
- **🧪 Tests**: 150+ tests automatisés  
- **📐 Types**: Interface TypeScript complète
- **🎨 Composants**: 25+ composants React
- **⚙️ Features**: 30+ fonctionnalités majeures

## 🏗️ Architecture

### Patterns de design
- **Component-based**: Architecture React modulaire
- **State management**: Store Zustand centralisé
- **Type safety**: TypeScript strict
- **Event-driven**: Système d'événements canvas
- **Responsive**: Interface adaptative

### Performance
- **Canvas optimisé**: Rendu efficace avec cache de formes
- **Memory management**: Gestion automatique de la mémoire
- **Viewport culling**: Rendu uniquement des éléments visibles
- **Event batching**: Optimisation des événements

## 🤝 Contribution

Ce projet suit les principes de développement moderne :

1. **Tests first**: Tous les nouveaux features doivent avoir des tests
2. **TypeScript strict**: Types explicites obligatoires
3. **Code review**: Pull requests reviewées
4. **Documentation**: Code auto-documenté avec commentaires

### Développement local
```bash
git clone [repository-url]
cd excalibox
npm install
npm run dev
npm test
```

## 📄 Licence

Ce projet est développé comme clone éducatif d'Excalidraw.

---

**Inspiré par Excalidraw** - Un tableau blanc virtuel collaboratif pour dessiner des diagrammes qui ressemblent à des croquis faits à la main.

*Développé avec ❤️ en TypeScript + React*