# Spécification Import de Fontes - Excalibox

**Version**: 1.0  
**Date**: 2025-07-04  
**Auteur**: Équipe de développement Excalibox  

## Vue d'ensemble

Cette spécification définit le système d'import de fontes personnalisées pour Excalibox, permettant aux utilisateurs d'utiliser leurs propres polices de caractères au format WOFF2 dans leurs dessins.

## Phase 1: Import via Code Source (Implémentation Immédiate)

### Structure des Dossiers

```
src/
├── assets/
│   └── fonts/
│       ├── custom/                    # Dossier pour les fontes personnalisées
│       │   ├── README.md             # Instructions d'ajout de fontes
│       │   ├── font-manifest.json    # Registre des fontes disponibles
│       │   └── families/             # Organisation par famille de fonte
│       │       ├── roboto/
│       │       │   ├── roboto-regular.woff2
│       │       │   ├── roboto-bold.woff2
│       │       │   ├── roboto-italic.woff2
│       │       │   └── roboto-bold-italic.woff2
│       │       ├── opensans/
│       │       │   ├── opensans-regular.woff2
│       │       │   ├── opensans-bold.woff2
│       │       │   └── opensans-italic.woff2
│       │       └── montserrat/
│       │           ├── montserrat-regular.woff2
│       │           ├── montserrat-bold.woff2
│       │           └── montserrat-italic.woff2
│       └── system/                   # Fontes système par défaut
│           ├── inter/
│           ├── arial/
│           └── helvetica/
```

### Format du Manifeste de Fontes

**Fichier**: `src/assets/fonts/custom/font-manifest.json`

```json
{
  "version": "1.0",
  "lastUpdated": "2025-07-04T12:00:00Z",
  "fonts": [
    {
      "family": "Roboto",
      "displayName": "Roboto",
      "category": "sans-serif",
      "designer": "Christian Robertson",
      "license": "Apache License 2.0",
      "variants": [
        {
          "style": "normal",
          "weight": 400,
          "file": "families/roboto/roboto-regular.woff2",
          "loaded": false
        },
        {
          "style": "normal", 
          "weight": 700,
          "file": "families/roboto/roboto-bold.woff2",
          "loaded": false
        },
        {
          "style": "italic",
          "weight": 400,
          "file": "families/roboto/roboto-italic.woff2",
          "loaded": false
        },
        {
          "style": "italic",
          "weight": 700,
          "file": "families/roboto/roboto-bold-italic.woff2",
          "loaded": false
        }
      ]
    },
    {
      "family": "Open Sans",
      "displayName": "Open Sans",
      "category": "sans-serif",
      "designer": "Steve Matteson",
      "license": "SIL Open Font License",
      "variants": [
        {
          "style": "normal",
          "weight": 400,
          "file": "families/opensans/opensans-regular.woff2",
          "loaded": false
        },
        {
          "style": "normal",
          "weight": 700,
          "file": "families/opensans/opensans-bold.woff2",
          "loaded": false
        },
        {
          "style": "italic",
          "weight": 400,
          "file": "families/opensans/opensans-italic.woff2",
          "loaded": false
        }
      ]
    }
  ]
}
```

### Instructions d'Ajout de Fontes

**Fichier**: `src/assets/fonts/custom/README.md`

```markdown
# Ajout de Fontes Personnalisées

## Étapes pour ajouter une nouvelle fonte

### 1. Préparer les fichiers WOFF2
- Convertir votre fonte au format WOFF2 (recommandé pour la performance web)
- Nommer les fichiers selon la convention: `[famille]-[poids]-[style].woff2`
- Exemples: `roboto-regular.woff2`, `roboto-bold.woff2`, `roboto-italic.woff2`

### 2. Créer le dossier de famille
```bash
mkdir src/assets/fonts/custom/families/[nom-famille]
```

### 3. Copier les fichiers WOFF2
```bash
cp your-font-files.woff2 src/assets/fonts/custom/families/[nom-famille]/
```

### 4. Mettre à jour le manifeste
Ajouter l'entrée correspondante dans `font-manifest.json`:

```json
{
  "family": "Votre Fonte",
  "displayName": "Votre Fonte",
  "category": "sans-serif|serif|monospace|cursive|fantasy",
  "designer": "Nom du Designer",
  "license": "Type de licence",
  "variants": [
    {
      "style": "normal|italic",
      "weight": 400,
      "file": "families/votre-fonte/votre-fonte-regular.woff2",
      "loaded": false
    }
  ]
}
```

### 5. Redémarrer l'application
```bash
npm run dev
```

## Poids de fonte supportés
- 100: Thin
- 200: Extra Light
- 300: Light
- 400: Regular (par défaut)
- 500: Medium
- 600: Semi Bold
- 700: Bold
- 800: Extra Bold
- 900: Black

## Styles supportés
- `normal`: Style normal
- `italic`: Style italique

## Formats supportés
- **WOFF2** (recommandé): Compression optimale, support navigateur moderne
- **WOFF**: Fallback pour navigateurs plus anciens
- **TTF/OTF**: Support limité, non recommandé pour le web

## Considérations de licence
- Vérifiez que vous avez le droit d'utiliser la fonte dans votre projet
- Conservez les fichiers de licence appropriés
- Respectez les conditions d'attribution si nécessaire
```

### API TypeScript pour la Gestion des Fontes

**Fichier**: `src/utils/fontManager.ts`

```typescript
// ABOUTME: Gestionnaire de fontes personnalisées pour l'import et le chargement
// ABOUTME: Permet de charger dynamiquement les fontes WOFF2 et de les rendre disponibles

export interface FontVariant {
  style: 'normal' | 'italic';
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  file: string;
  loaded: boolean;
}

export interface CustomFont {
  family: string;
  displayName: string;
  category: 'sans-serif' | 'serif' | 'monospace' | 'cursive' | 'fantasy';
  designer?: string;
  license?: string;
  variants: FontVariant[];
}

export interface FontManifest {
  version: string;
  lastUpdated: string;
  fonts: CustomFont[];
}

export class FontManager {
  private loadedFonts: Map<string, FontFace> = new Map();
  private manifest: FontManifest | null = null;
  
  /**
   * Charge le manifeste des fontes disponibles
   */
  async loadManifest(): Promise<FontManifest> {
    try {
      const response = await fetch('/src/assets/fonts/custom/font-manifest.json');
      this.manifest = await response.json();
      return this.manifest;
    } catch (error) {
      console.warn('Impossible de charger le manifeste des fontes:', error);
      return { version: '1.0', lastUpdated: new Date().toISOString(), fonts: [] };
    }
  }
  
  /**
   * Charge une fonte spécifique
   */
  async loadFont(fontFamily: string, variant: FontVariant): Promise<boolean> {
    const fontKey = `${fontFamily}-${variant.weight}-${variant.style}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return true; // Déjà chargée
    }
    
    try {
      const fontUrl = `/src/assets/fonts/custom/${variant.file}`;
      const fontFace = new FontFace(
        fontFamily,
        `url(${fontUrl}) format('woff2')`,
        {
          weight: variant.weight.toString(),
          style: variant.style
        }
      );
      
      await fontFace.load();
      document.fonts.add(fontFace);
      
      this.loadedFonts.set(fontKey, fontFace);
      variant.loaded = true;
      
      console.log(`Fonte chargée: ${fontFamily} ${variant.weight} ${variant.style}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors du chargement de la fonte ${fontKey}:`, error);
      return false;
    }
  }
  
  /**
   * Charge toutes les variantes d'une famille de fonte
   */
  async loadFontFamily(fontFamily: string): Promise<boolean> {
    if (!this.manifest) {
      await this.loadManifest();
    }
    
    const font = this.manifest?.fonts.find(f => f.family === fontFamily);
    if (!font) {
      console.warn(`Famille de fonte non trouvée: ${fontFamily}`);
      return false;
    }
    
    const loadPromises = font.variants.map(variant => 
      this.loadFont(fontFamily, variant)
    );
    
    const results = await Promise.all(loadPromises);
    return results.every(result => result);
  }
  
  /**
   * Retourne la liste des familles de fontes disponibles
   */
  getAvailableFontFamilies(): string[] {
    if (!this.manifest) return [];
    return this.manifest.fonts.map(font => font.family);
  }
  
  /**
   * Retourne les détails d'une famille de fonte
   */
  getFontDetails(fontFamily: string): CustomFont | null {
    if (!this.manifest) return null;
    return this.manifest.fonts.find(f => f.family === fontFamily) || null;
  }
  
  /**
   * Vérifie si une fonte est chargée
   */
  isFontLoaded(fontFamily: string, weight: number = 400, style: string = 'normal'): boolean {
    const fontKey = `${fontFamily}-${weight}-${style}`;
    return this.loadedFonts.has(fontKey);
  }
  
  /**
   * Precharge toutes les fontes du manifeste
   */
  async preloadAllFonts(): Promise<void> {
    if (!this.manifest) {
      await this.loadManifest();
    }
    
    if (!this.manifest) return;
    
    for (const font of this.manifest.fonts) {
      await this.loadFontFamily(font.family);
    }
  }
}

// Instance singleton
export const fontManager = new FontManager();
```

### Intégration avec les Composants Existants

**Mise à jour de**: `src/components/PropertiesPanel/FontControls.tsx`

```typescript
// Ajout dans les imports
import { fontManager } from '../../utils/fontManager';

// Ajout dans le composant
const [availableFonts, setAvailableFonts] = useState<string[]>([]);

useEffect(() => {
  const loadFonts = async () => {
    await fontManager.loadManifest();
    const systemFonts = ['Inter', 'Arial', 'Helvetica', 'Times', 'Courier', 'Georgia'];
    const customFonts = fontManager.getAvailableFontFamilies();
    setAvailableFonts([...systemFonts, ...customFonts]);
  };
  
  loadFonts();
}, []);

// Modification du dropdown de fontes
<select 
  value={fontFamily} 
  onChange={(e) => updateFontFamily(e.target.value)}
  className="font-controls__select"
>
  <optgroup label="Fontes Système">
    <option value="Inter">Inter</option>
    <option value="Arial">Arial</option>
    <option value="Helvetica">Helvetica</option>
    <option value="Times">Times</option>
    <option value="Courier">Courier</option>
    <option value="Georgia">Georgia</option>
  </optgroup>
  
  {fontManager.getAvailableFontFamilies().length > 0 && (
    <optgroup label="Fontes Personnalisées">
      {fontManager.getAvailableFontFamilies().map(family => (
        <option key={family} value={family}>{family}</option>
      ))}
    </optgroup>
  )}
</select>
```

### Chargement Automatique des Fontes

**Mise à jour de**: `src/App.tsx`

```typescript
import { fontManager } from './utils/fontManager';

// Dans useEffect d'initialisation
useEffect(() => {
  const initializeFonts = async () => {
    try {
      console.log('Chargement des fontes personnalisées...');
      await fontManager.preloadAllFonts();
      console.log('Fontes personnalisées chargées avec succès');
    } catch (error) {
      console.warn('Erreur lors du chargement des fontes:', error);
    }
  };
  
  initializeFonts();
}, []);
```

## Phase 2: Interface GUI d'Import (Implémentation Future)

### Spécifications de l'Interface Utilisateur

#### Composant FontImportDialog

```typescript
interface FontImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFontImported: (font: CustomFont) => void;
}

interface FontImportState {
  files: File[];
  fontPreview: string;
  fontMetadata: {
    family: string;
    displayName: string;
    category: string;
    designer: string;
    license: string;
  };
  validationErrors: string[];
  importing: boolean;
}
```

#### Fonctionnalités de l'Interface GUI

1. **Drag & Drop de fichiers WOFF2**
   - Zone de glisser-déposer intuitive
   - Support multi-fichiers pour les variantes
   - Validation automatique du format

2. **Prévisualisation de fonte**
   - Affichage du nom de la fonte détecté
   - Prévisualisation avec texte d'exemple
   - Liste des variantes détectées (regular, bold, italic, etc.)

3. **Métadonnées de fonte**
   - Formulaire pour saisir le nom d'affichage
   - Sélection de catégorie (sans-serif, serif, etc.)
   - Champs optionnels pour designer et licence

4. **Validation et erreurs**
   - Vérification du format WOFF2
   - Détection des conflits de nom
   - Messages d'erreur clairs

5. **Gestion des variantes**
   - Détection automatique du poids et style
   - Interface pour corriger les métadonnées si nécessaire
   - Prévisualisation de chaque variante

#### Workflow d'Import GUI

```
1. Utilisateur ouvre "Importer une fonte" depuis le menu
   ↓
2. Dialog d'import s'ouvre avec zone drag & drop
   ↓
3. Utilisateur glisse fichiers WOFF2 ou utilise sélecteur
   ↓
4. Validation automatique et extraction des métadonnées
   ↓
5. Formulaire de confirmation avec prévisualisation
   ↓
6. Utilisateur confirme → Import et ajout au manifeste
   ↓
7. Fonte immédiatement disponible dans les controls
```

### API d'Import GUI

```typescript
export interface FontImportService {
  /**
   * Analyse un fichier fonte et extrait les métadonnées
   */
  analyzeFontFile(file: File): Promise<FontAnalysis>;
  
  /**
   * Importe une fonte dans le système
   */
  importFont(files: File[], metadata: FontMetadata): Promise<CustomFont>;
  
  /**
   * Supprime une fonte personnalisée
   */
  removeFont(fontFamily: string): Promise<boolean>;
  
  /**
   * Met à jour le manifeste
   */
  updateManifest(manifest: FontManifest): Promise<boolean>;
}

interface FontAnalysis {
  family: string;
  weight: number;
  style: 'normal' | 'italic';
  format: string;
  valid: boolean;
  errors: string[];
}

interface FontMetadata {
  displayName: string;
  category: 'sans-serif' | 'serif' | 'monospace' | 'cursive' | 'fantasy';
  designer?: string;
  license?: string;
}
```

## Considérations Techniques

### Performance
- **Lazy Loading**: Charger les fontes seulement quand nécessaire
- **Caching**: Mettre en cache les fontes chargées dans le navigateur
- **Compression**: Utiliser WOFF2 pour une taille optimale

### Sécurité
- **Validation de format**: Vérifier que les fichiers sont bien des fontes valides
- **Limite de taille**: Imposer une taille maximum par fichier (ex: 2MB)
- **Sanitization**: Nettoyer les noms de fichiers et métadonnées

### Compatibilité
- **Fallback**: Prévoir des fontes de substitution
- **Feature Detection**: Vérifier le support WOFF2 du navigateur
- **Progressive Enhancement**: Fonctionnalité optionnelle qui n'impacte pas le core

### Stockage
- **Phase 1**: Stockage dans le code source (assets)
- **Phase 2**: Stockage navigateur (IndexedDB) pour les imports GUI
- **Phase 3**: Stockage cloud pour la synchronisation

## Roadmap d'Implémentation

### Étape 1 (Immédiate) - Import Manuel
- ✅ Structure de dossiers et manifeste
- ✅ FontManager et API TypeScript
- ✅ Intégration avec l'interface existante
- ✅ Documentation développeur

### Étape 2 (2-3 semaines) - Interface GUI
- 🔄 Composant FontImportDialog
- 🔄 Service d'analyse de fontes
- 🔄 Drag & Drop et validation
- 🔄 Prévisualisation et métadonnées

### Étape 3 (1-2 semaines) - Améliorations
- 🔄 Gestion des erreurs robuste
- 🔄 Performance et optimisations
- 🔄 Tests unitaires et d'intégration
- 🔄 Documentation utilisateur

### Étape 4 (Future) - Fonctionnalités Avancées
- 🔄 Stockage cloud des fontes
- 🔄 Partage de fontes entre utilisateurs
- 🔄 Marketplace de fontes intégré
- 🔄 Support de formats additionnels

## Tests et Validation

### Tests Unitaires
- FontManager: chargement, cache, erreurs
- FontImportService: analyse, validation, import
- Composants: interface, interactions, états

### Tests d'Intégration
- Workflow complet d'import
- Compatibilité avec l'interface existante
- Performance avec multiples fontes

### Tests Manuels
- Variété de fichiers WOFF2
- Différents navigateurs
- Gestion d'erreurs utilisateur

---

**Cette spécification offre une base solide pour l'implémentation de l'import de fontes, avec une approche progressive permettant une utilisation immédiate via le code source, puis une interface utilisateur complète pour la version GUI.**