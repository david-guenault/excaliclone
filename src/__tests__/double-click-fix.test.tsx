// ABOUTME: Quick test to verify double-click text editing fix
// ABOUTME: Tests the coordinate transformation fix for double-click functionality

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../App';
import { useAppStore } from '../store';

describe('Double-Click Text Editing Fix', () => {
  beforeEach(() => {
    // Reset store state
    const store = useAppStore.getState();
    store.elements = [];
    store.selectedElementIds = [];
    store.activeTool = 'select';
    if (store.textEditing) {
      store.textEditing.isEditing = false;
      store.textEditing.elementId = null;
    }
  });

  it('should detect double-click on rectangle and start text editing', () => {
    render(<App />);
    
    // Create a rectangle element
    let rectangle: any;
    act(() => {
      const store = useAppStore.getState();
      rectangle = store.addElementSilent({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        roughness: 1,
        opacity: 1,
      });
    });

    // Get canvas element
    const canvas = screen.getByRole('img', { name: /canvas/i });
    
    // Simulate double-click in the center of the rectangle
    // Rectangle is at (100, 100) with width 200, height 100
    // Center should be at (200, 150)
    const centerX = 200;
    const centerY = 150;
    
    act(() => {
      fireEvent.doubleClick(canvas, { 
        clientX: centerX, 
        clientY: centerY,
        bubbles: true
      });
    });

    // Check if text editing started
    const newState = useAppStore.getState();
    expect(newState.textEditing?.isEditing).toBe(true);
    expect(newState.textEditing?.elementId).toBe(rectangle.id);
  });

  it('should detect double-click on circle and start text editing', () => {
    render(<App />);
    
    // Create a circle element
    let circle: any;
    act(() => {
      const store = useAppStore.getState();
      circle = store.addElementSilent({
      type: 'circle',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      angle: 0,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      strokeWidth: 2,
      strokeStyle: 'solid',
      fillStyle: 'solid',
      roughness: 1,
      opacity: 1,
      });
    });

    // Get canvas element
    const canvas = screen.getByRole('img', { name: /canvas/i });
    
    // Simulate double-click in the center of the circle
    // Circle is at (50, 50) with width 100, height 100
    // Center should be at (100, 100)
    const centerX = 100;
    const centerY = 100;
    
    act(() => {
      fireEvent.doubleClick(canvas, { 
        clientX: centerX, 
        clientY: centerY,
        bubbles: true
      });
    });

    // Check if text editing started
    const newState = useAppStore.getState();
    expect(newState.textEditing?.isEditing).toBe(true);
    expect(newState.textEditing?.elementId).toBe(circle.id);
  });

  it('should not start text editing when double-clicking empty area', () => {
    render(<App />);
    
    // Create a rectangle element at (100, 100)
    act(() => {
      const store = useAppStore.getState();
      store.addElementSilent({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        roughness: 1,
        opacity: 1,
      });
    });

    // Get canvas element
    const canvas = screen.getByRole('img', { name: /canvas/i });
    
    // Simulate double-click in empty area (far from rectangle)
    const emptyX = 500;
    const emptyY = 500;
    
    act(() => {
      fireEvent.doubleClick(canvas, { 
        clientX: emptyX, 
        clientY: emptyY,
        bubbles: true
      });
    });

    // Check that text editing did NOT start
    const newState = useAppStore.getState();
    expect(newState.textEditing?.isEditing).toBe(false);
    expect(newState.textEditing?.elementId).toBeNull();
  });

  it('should detect double-click on line and start text editing', () => {
    render(<App />);
    
    // Create a line element
    let line: any;
    act(() => {
      const store = useAppStore.getState();
      line = store.addElementSilent({
        type: 'line',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 5, // Thicker line for easier hitting
        strokeStyle: 'solid',
        fillStyle: 'solid',
        roughness: 1,
        opacity: 1,
      });
    });

    // Get canvas element
    const canvas = screen.getByRole('img', { name: /canvas/i });
    
    // Simulate double-click on the line (midpoint)
    // Line goes from (100, 100) to (300, 200)
    // Midpoint should be at (200, 150)
    const midX = 200;
    const midY = 150;
    
    act(() => {
      fireEvent.doubleClick(canvas, { 
        clientX: midX, 
        clientY: midY,
        bubbles: true
      });
    });

    // Check if text editing started
    const newState = useAppStore.getState();
    expect(newState.textEditing?.isEditing).toBe(true);
    expect(newState.textEditing?.elementId).toBe(line.id);
  });
});