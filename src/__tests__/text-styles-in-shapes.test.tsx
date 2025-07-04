// ABOUTME: Test pour vérifier que les styles de texte fonctionnent sur toutes les formes
// ABOUTME: Vérifie que famille, taille et alignement de police s'appliquent aux formes avec texte

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../App';
import { useAppStore } from '../store';

describe('Text Styles in Shapes', () => {
  beforeEach(() => {
    // Reset store state
    const store = useAppStore.getState();
    store.elements = [];
    store.selectedElementIds = [];
    if (store.textEditing) {
      store.textEditing.isEditing = false;
      store.textEditing.elementId = null;
    }
  });

  it('should show text style controls for rectangle with text', () => {
    render(<App />);
    
    // Create a rectangle with text
    act(() => {
      const store = useAppStore.getState();
      const rectangle = store.addElement({
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
        text: 'Test Text',
      });
      
      // Select the rectangle
      store.selectElement(rectangle.id);
    });

    // Should show text style controls
    expect(screen.getByText('Famille de police')).toBeInTheDocument();
    expect(screen.getByText('Taille de la police')).toBeInTheDocument();
    expect(screen.getByText('Alignement du texte')).toBeInTheDocument();
  });

  it('should show text style controls for circle with text', () => {
    render(<App />);
    
    // Create a circle with text
    act(() => {
      const store = useAppStore.getState();
      const circle = store.addElement({
        type: 'circle',
        x: 100,
        y: 100,
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
        text: 'Circle Text',
      });
      
      // Select the circle
      store.selectElement(circle.id);
    });

    // Should show text style controls
    expect(screen.getByText('Famille de police')).toBeInTheDocument();
    expect(screen.getByText('Taille de la police')).toBeInTheDocument();
    expect(screen.getByText('Alignement du texte')).toBeInTheDocument();
  });

  it('should not show text style controls for shape without text', () => {
    render(<App />);
    
    // Create a rectangle without text
    act(() => {
      const store = useAppStore.getState();
      const rectangle = store.addElement({
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
      
      // Select the rectangle
      store.selectElement(rectangle.id);
    });

    // Should NOT show text style controls
    expect(screen.queryByText('Famille de police')).not.toBeInTheDocument();
    expect(screen.queryByText('Taille de la police')).not.toBeInTheDocument();
    expect(screen.queryByText('Alignement du texte')).not.toBeInTheDocument();
  });

  it('should apply font family changes to shapes with text', () => {
    render(<App />);
    
    let elementId: string;
    // Create a rectangle with text
    act(() => {
      const store = useAppStore.getState();
      const rectangle = store.addElement({
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
        text: 'Test Text',
        fontFamily: 'Inter',
      });
      
      elementId = rectangle.id;
      // Select the rectangle
      store.selectElement(rectangle.id);
    });

    // Find and change font family
    const fontSelect = screen.getByDisplayValue('Inter');
    act(() => {
      fireEvent.change(fontSelect, { target: { value: 'Arial' } });
    });

    // Check that the element was updated
    const updatedElement = useAppStore.getState().elements.find(el => el.id === elementId);
    expect(updatedElement?.fontFamily).toBe('Arial');
  });

  it('should apply font size changes to shapes with text', () => {
    render(<App />);
    
    let elementId: string;
    // Create a rectangle with text
    act(() => {
      const store = useAppStore.getState();
      const rectangle = store.addElement({
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
        text: 'Test Text',
        fontSize: 16,
      });
      
      elementId = rectangle.id;
      // Select the rectangle
      store.selectElement(rectangle.id);
    });

    // Find and click a different font size button
    const fontSizeButton = screen.getByText('L'); // Large size button
    act(() => {
      fireEvent.click(fontSizeButton);
    });

    // Check that the element was updated
    const updatedElement = useAppStore.getState().elements.find(el => el.id === elementId);
    expect(updatedElement?.fontSize).toBe(24); // L = 24px
  });

  it('should apply text alignment changes to shapes with text', () => {
    render(<App />);
    
    let elementId: string;
    // Create a rectangle with text
    act(() => {
      const store = useAppStore.getState();
      const rectangle = store.addElement({
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
        text: 'Test Text',
        textAlign: 'center',
      });
      
      elementId = rectangle.id;
      // Select the rectangle
      store.selectElement(rectangle.id);
    });

    // Find and click the left align button
    const leftAlignButton = screen.getByTitle('Aligner à gauche');
    act(() => {
      fireEvent.click(leftAlignButton);
    });

    // Check that the element was updated
    const updatedElement = useAppStore.getState().elements.find(el => el.id === elementId);
    expect(updatedElement?.textAlign).toBe('left');
  });

  it('should work with multiple selected shapes that have text', () => {
    render(<App />);
    
    let elementIds: string[] = [];
    // Create multiple shapes with text
    act(() => {
      const store = useAppStore.getState();
      
      const rectangle = store.addElement({
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
        text: 'Rectangle Text',
      });
      
      const circle = store.addElement({
        type: 'circle',
        x: 300,
        y: 100,
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
        text: 'Circle Text',
      });
      
      elementIds = [rectangle.id, circle.id];
      // Select both elements
      store.selectElements(elementIds);
    });

    // Should show text style controls for multiple selection
    expect(screen.getByText('Famille de police')).toBeInTheDocument();
    expect(screen.getByText('Taille de la police')).toBeInTheDocument();
    expect(screen.getByText('Alignement du texte')).toBeInTheDocument();

    // Apply a font change to both
    const rightAlignButton = screen.getByTitle('Aligner à droite');
    act(() => {
      fireEvent.click(rightAlignButton);
    });

    // Check that both elements were updated
    const state = useAppStore.getState();
    elementIds.forEach(id => {
      const element = state.elements.find(el => el.id === id);
      expect(element?.textAlign).toBe('right');
    });
  });
});