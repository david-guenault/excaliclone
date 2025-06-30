// ABOUTME: Test setup file for Vitest and React Testing Library
// ABOUTME: Configures global test environment and polyfills

import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupCanvasMocks } from './test-helpers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Setup before each test
beforeEach(() => {
  setupCanvasMocks();
});

// Clean up after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Canvas API for tests with proper RoughJS compatibility
const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => []),
  canvas: { width: 800, height: 600 },
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  font: '',
  textAlign: 'start',
  textBaseline: 'alphabetic',
};

HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext) as any;

// Mock getBoundingClientRect for Canvas
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
  top: 0,
  left: 0,
  bottom: 600,
  right: 800,
  width: 800,
  height: 600,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
}));

// Mock RoughJS library
vi.mock('roughjs', () => {
  const mockDrawable = {
    type: 'path',
    ops: [],
    sets: [{ type: 'path', ops: [] }],
  };

  const mockGenerator = {
    rectangle: vi.fn(() => mockDrawable),
    circle: vi.fn(() => mockDrawable),
    ellipse: vi.fn(() => mockDrawable),
    line: vi.fn(() => mockDrawable),
    curve: vi.fn(() => mockDrawable),
    polygon: vi.fn(() => mockDrawable),
    path: vi.fn(() => mockDrawable),
    arc: vi.fn(() => mockDrawable),
    linearPath: vi.fn(() => mockDrawable),
  };

  const mockRoughCanvas = {
    generator: mockGenerator,
    draw: vi.fn(),
    rectangle: vi.fn(),
    circle: vi.fn(),
    line: vi.fn(),
    curve: vi.fn(),
    polygon: vi.fn(),
    path: vi.fn(),
    ellipse: vi.fn(),
    arc: vi.fn(),
    linearPath: vi.fn(),
  };

  return {
    default: {
      canvas: vi.fn(() => mockRoughCanvas),
      generator: vi.fn(() => mockGenerator),
    },
    canvas: vi.fn(() => mockRoughCanvas),
    generator: vi.fn(() => mockGenerator),
  };
});