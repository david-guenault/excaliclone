// ABOUTME: Tests for the FontManager utility class
// ABOUTME: Verifies font loading, caching, and manifest management functionality

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FontManager } from '../fontManager';
import type { FontManifest, CustomFont, FontVariant } from '../fontManager';

// Mock fetch globally
global.fetch = vi.fn();

describe('FontManager', () => {
  let fontManager: FontManager;

  beforeEach(() => {
    fontManager = new FontManager();
    vi.clearAllMocks();
    
    // Mock window.fonts
    Object.defineProperty(window, 'fonts', {
      value: {
        add: vi.fn(),
        delete: vi.fn(),
      },
      writable: true,
    });
  });

  describe('loadManifest', () => {
    it('should return empty manifest when fetch fails', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const manifest = await fontManager.loadManifest();

      expect(manifest).toEqual({
        version: '1.0',
        lastUpdated: expect.any(String),
        fonts: []
      });
    });

    it('should parse manifest when fetch succeeds', async () => {
      const mockManifest: FontManifest = {
        version: '1.0',
        lastUpdated: '2025-07-04T21:00:00Z',
        fonts: [
          {
            family: 'Test Font',
            displayName: 'Test Font',
            category: 'sans-serif',
            variants: [
              {
                style: 'normal',
                weight: 400,
                file: 'test-font-regular.woff2',
                loaded: false
              }
            ]
          }
        ]
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      });

      const manifest = await fontManager.loadManifest();

      expect(manifest).toEqual(mockManifest);
      expect(fontManager.getAvailableFontFamilies()).toEqual(['Test Font']);
    });
  });

  describe('getAvailableFontFamilies', () => {
    it('should return empty array when no manifest loaded', () => {
      const families = fontManager.getAvailableFontFamilies();
      expect(families).toEqual([]);
    });

    it('should return font families from loaded manifest', async () => {
      const mockManifest: FontManifest = {
        version: '1.0',
        lastUpdated: '2025-07-04T21:00:00Z',
        fonts: [
          {
            family: 'Font A',
            displayName: 'Font A',
            category: 'sans-serif',
            variants: []
          },
          {
            family: 'Font B',
            displayName: 'Font B',
            category: 'serif',
            variants: []
          }
        ]
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      });

      await fontManager.loadManifest();
      const families = fontManager.getAvailableFontFamilies();

      expect(families).toEqual(['Font A', 'Font B']);
    });
  });

  describe('getFontDetails', () => {
    it('should return null when no manifest loaded', () => {
      const details = fontManager.getFontDetails('Test Font');
      expect(details).toBeNull();
    });

    it('should return font details when found', async () => {
      const mockFont: CustomFont = {
        family: 'Test Font',
        displayName: 'Test Font',
        category: 'sans-serif',
        variants: []
      };

      const mockManifest: FontManifest = {
        version: '1.0',
        lastUpdated: '2025-07-04T21:00:00Z',
        fonts: [mockFont]
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      });

      await fontManager.loadManifest();
      const details = fontManager.getFontDetails('Test Font');

      expect(details).toEqual(mockFont);
    });
  });

  describe('isFontLoaded', () => {
    it('should return false for unloaded fonts', () => {
      const isLoaded = fontManager.isFontLoaded('Test Font');
      expect(isLoaded).toBe(false);
    });

    it('should return true for loaded fonts', () => {
      // Simulate a loaded font by setting it directly
      const fontKey = 'Test Font-400-normal';
      fontManager['loadedFonts'].set(fontKey, {} as FontFace);

      const isLoaded = fontManager.isFontLoaded('Test Font', 400, 'normal');
      expect(isLoaded).toBe(true);
    });
  });

  describe('getLoadingStats', () => {
    it('should return zeros when no manifest loaded', () => {
      const stats = fontManager.getLoadingStats();
      expect(stats).toEqual({
        loaded: 0,
        total: 0,
        families: 0
      });
    });

    it('should return correct stats when manifest loaded', async () => {
      const mockManifest: FontManifest = {
        version: '1.0',
        lastUpdated: '2025-07-04T21:00:00Z',
        fonts: [
          {
            family: 'Font A',
            displayName: 'Font A',
            category: 'sans-serif',
            variants: [
              {
                style: 'normal',
                weight: 400,
                file: 'font-a-regular.woff2',
                loaded: false
              },
              {
                style: 'normal',
                weight: 700,
                file: 'font-a-bold.woff2',
                loaded: false
              }
            ]
          }
        ]
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      });

      await fontManager.loadManifest();
      const stats = fontManager.getLoadingStats();

      expect(stats).toEqual({
        loaded: 0,
        total: 2,
        families: 1
      });
    });
  });

  describe('clearLoadedFonts', () => {
    it('should clear loaded fonts map', () => {
      // Add a mock loaded font
      fontManager['loadedFonts'].set('test-font', {} as FontFace);
      expect(fontManager['loadedFonts'].size).toBe(1);

      fontManager.clearLoadedFonts();

      expect(fontManager['loadedFonts'].size).toBe(0);
    });
  });
});