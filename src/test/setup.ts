// ABOUTME: Test setup file for Vitest and React Testing Library
// ABOUTME: Configures global test environment and polyfills

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test case
afterEach(() => {
  cleanup();
});

// Mock Canvas API for tests
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
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
  canvas: { width: 800, height: 600 },
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  font: '',
  textBaseline: 'top',
}));

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