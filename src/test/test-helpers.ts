// ABOUTME: Test utilities for better React act() wrapping and event simulation
// ABOUTME: Provides helpers to avoid act() warnings and improve test reliability

import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Wrapper for user events that automatically handles act() wrapping
 */
export const createActWrapper = () => {
  const user = userEvent.setup();
  
  return {
    async click(element: Element) {
      await act(async () => {
        await user.click(element);
      });
    },
    
    async type(element: Element, text: string) {
      await act(async () => {
        await user.type(element, text);
      });
    },
    
    async hover(element: Element) {
      await act(async () => {
        await user.hover(element);
      });
    },
    
    async keyboard(keys: string) {
      await act(async () => {
        await user.keyboard(keys);
      });
    }
  };
};

/**
 * Wrapper for DOM events that handles act() wrapping
 */
export const createDOMEventHelpers = () => {
  return {
    async fireMouseEvent(element: Element, eventType: string, eventInit?: MouseEventInit) {
      await act(async () => {
        const event = new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          ...eventInit
        });
        element.dispatchEvent(event);
      });
    },
    
    async fireKeyboardEvent(element: Element, eventType: string, eventInit?: KeyboardEventInit) {
      await act(async () => {
        const event = new KeyboardEvent(eventType, {
          bubbles: true,
          cancelable: true,
          ...eventInit
        });
        element.dispatchEvent(event);
      });
    },
    
    async fireMouseDown(element: Element, point: { x: number; y: number }) {
      await act(async () => {
        const rect = element.getBoundingClientRect();
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + point.x,
          clientY: rect.top + point.y,
          button: 0
        });
        element.dispatchEvent(event);
      });
    },
    
    async fireMouseMove(point: { x: number; y: number }) {
      await act(async () => {
        const event = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: point.x,
          clientY: point.y,
          button: 0
        });
        document.dispatchEvent(event);
      });
    },
    
    async fireMouseUp(point: { x: number; y: number }) {
      await act(async () => {
        const event = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: point.x,
          clientY: point.y,
          button: 0
        });
        document.dispatchEvent(event);
      });
    },
    
    async clickCanvas(element: Element, point: { x: number; y: number }) {
      await act(async () => {
        element.dispatchEvent(new MouseEvent('mousedown', {
          clientX: point.x,
          clientY: point.y,
          bubbles: true
        }));
        element.dispatchEvent(new MouseEvent('mouseup', {
          clientX: point.x,
          clientY: point.y,
          bubbles: true
        }));
      });
    }
  };
};

/**
 * Helper to wait for state updates with act() wrapping
 */
export const waitForStateUpdate = async (fn?: () => void | Promise<void>) => {
  await act(async () => {
    if (fn) {
      await fn();
    }
    // Allow React to process state updates
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

/**
 * Helper for mocking getBoundingClientRect consistently across tests
 */
export const mockGetBoundingClientRect = (rect: Partial<DOMRect> = {}) => {
  const defaultRect = {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    right: 800,
    bottom: 600,
    ...rect
  };
  
  return vi.fn(() => defaultRect as DOMRect);
};

/**
 * Setup common mocks for canvas and drawing tests
 */
export const setupCanvasMocks = () => {
  // Mock getBoundingClientRect for canvas elements
  Element.prototype.getBoundingClientRect = mockGetBoundingClientRect();
  
  // Mock canvas context if needed
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    clip: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    rect: vi.fn(),
    strokeRect: vi.fn(),
    strokeText: vi.fn(),
    fillText: vi.fn(),
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
  } as any));
};