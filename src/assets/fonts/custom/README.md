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

## Exemple complet - Ajout de Open Sans

1. **Télécharger Open Sans en WOFF2**
2. **Créer la structure**:
   ```bash
   mkdir src/assets/fonts/custom/families/opensans
   ```
3. **Copier les fichiers**:
   ```
   opensans-regular.woff2
   opensans-bold.woff2
   opensans-italic.woff2
   ```
4. **Ajouter au manifeste**:
   ```json
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
   ```

La fonte sera automatiquement disponible dans la liste des fontes de l'interface de propriétés.