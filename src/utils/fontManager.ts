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
  private manifestPath = '/src/assets/fonts/custom/font-manifest.json';
  
  /**
   * Charge le manifeste des fontes disponibles
   */
  async loadManifest(): Promise<FontManifest> {
    try {
      // Check if we're in a test environment or if fetch is not available
      if (typeof window === 'undefined' || !window.fetch) {
        throw new Error('Fetch not available in test environment');
      }
      
      const response = await fetch(this.manifestPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const manifest = await response.json();
      this.manifest = manifest;
      console.log(`Manifeste de fontes chargé: ${this.manifest.fonts.length} famille(s) disponible(s)`);
      return this.manifest;
    } catch (error) {
      console.warn('Impossible de charger le manifeste des fontes:', error);
      // Retourner un manifeste vide par défaut
      this.manifest = { 
        version: '1.0', 
        lastUpdated: new Date().toISOString(), 
        fonts: [] 
      };
      return this.manifest;
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
      // Construire l'URL complète du fichier fonte
      const fontUrl = `/src/assets/fonts/custom/${variant.file}`;
      
      console.log(`Tentative de chargement de la fonte: ${fontUrl}`);
      
      // Créer et charger la FontFace
      const fontFace = new FontFace(
        fontFamily,
        `url("${fontUrl}")`,
        {
          weight: variant.weight.toString(),
          style: variant.style,
          display: 'swap' // Améliore les performances de chargement
        }
      );
      
      console.log(`FontFace créée pour: ${fontFamily}`);
      
      await fontFace.load();
      console.log(`FontFace.load() réussie pour: ${fontFamily}`);
      console.log(`Status: ${fontFace.status}`);
      
      document.fonts.add(fontFace);
      console.log(`Fonte ajoutée au document: ${fontFamily}`);
      
      this.loadedFonts.set(fontKey, fontFace);
      variant.loaded = true;
      
      console.log(`Fonte chargée: ${fontFamily} ${variant.weight} ${variant.style}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors du chargement de la fonte ${fontKey}:`, error);
      console.error(`URL tentée: /src/assets/fonts/custom/${variant.file}`);
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
    const successCount = results.filter(Boolean).length;
    const success = results.every(result => result);
    
    console.log(`Famille ${fontFamily}: ${successCount}/${font.variants.length} variantes chargées`);
    return success;
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
   * Retourne les variantes disponibles pour une famille
   */
  getFontVariants(fontFamily: string): FontVariant[] {
    const font = this.getFontDetails(fontFamily);
    return font ? font.variants : [];
  }
  
  /**
   * Charge une fonte avant utilisation (lazy loading)
   */
  async ensureFontLoaded(fontFamily: string, weight: number = 400, style: 'normal' | 'italic' = 'normal'): Promise<boolean> {
    // Vérifier si déjà chargée
    if (this.isFontLoaded(fontFamily, weight, style)) {
      return true;
    }
    
    // Trouver la variante correspondante
    const font = this.getFontDetails(fontFamily);
    if (!font) {
      return false;
    }
    
    const variant = font.variants.find(v => 
      v.weight === weight && v.style === style
    );
    
    if (!variant) {
      console.warn(`Variante non trouvée: ${fontFamily} ${weight} ${style}`);
      return false;
    }
    
    return this.loadFont(fontFamily, variant);
  }
  
  /**
   * Precharge toutes les fontes du manifeste
   */
  async preloadAllFonts(): Promise<void> {
    if (!this.manifest) {
      await this.loadManifest();
    }
    
    if (!this.manifest || this.manifest.fonts.length === 0) {
      console.log('Aucune fonte personnalisée à précharger');
      return;
    }
    
    console.log(`Préchargement de ${this.manifest.fonts.length} famille(s) de fonte...`);
    
    for (const font of this.manifest.fonts) {
      try {
        await this.loadFontFamily(font.family);
      } catch (error) {
        console.warn(`Erreur lors du préchargement de ${font.family}:`, error);
      }
    }
    
    console.log('Préchargement des fontes terminé');
  }
  
  /**
   * Precharge seulement les variantes regular des fontes
   */
  async preloadRegularVariants(): Promise<void> {
    if (!this.manifest) {
      await this.loadManifest();
    }
    
    if (!this.manifest || this.manifest.fonts.length === 0) {
      return;
    }
    
    for (const font of this.manifest.fonts) {
      const regularVariant = font.variants.find(v => 
        v.weight === 400 && v.style === 'normal'
      );
      
      if (regularVariant) {
        try {
          await this.loadFont(font.family, regularVariant);
        } catch (error) {
          console.warn(`Erreur lors du préchargement de ${font.family} regular:`, error);
        }
      }
    }
  }
  
  /**
   * Retourne les statistiques de chargement
   */
  getLoadingStats(): { loaded: number; total: number; families: number } {
    if (!this.manifest) {
      return { loaded: 0, total: 0, families: 0 };
    }
    
    const total = this.manifest.fonts.reduce((sum, font) => sum + font.variants.length, 0);
    const loaded = this.loadedFonts.size;
    const families = this.manifest.fonts.length;
    
    return { loaded, total, families };
  }
  
  /**
   * Nettoie les fontes chargées (utile pour les tests)
   */
  clearLoadedFonts(): void {
    this.loadedFonts.forEach(fontFace => {
      try {
        document.fonts.delete(fontFace);
      } catch (error) {
        console.warn('Erreur lors de la suppression de fonte:', error);
      }
    });
    
    this.loadedFonts.clear();
    console.log('Fontes chargées nettoyées');
  }
}

// Instance singleton
export const fontManager = new FontManager();

// Types utilitaires pour l'export
export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type FontStyle = 'normal' | 'italic';
export type FontCategory = 'sans-serif' | 'serif' | 'monospace' | 'cursive' | 'fantasy';