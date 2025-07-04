// ABOUTME: Test pour vérifier que le soulignement de texte fonctionne correctement
// ABOUTME: Vérifie que les propriétés de soulignement s'appliquent aux formes avec texte

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../App';
import { useAppStore } from '../store';

describe('Text Underline in Shapes', () => {
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

  it('should apply underline decoration to text in shapes', () => {
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
        textDecoration: 'none',
      });
      
      elementId = rectangle.id;
      // Select the rectangle
      store.selectElement(rectangle.id);
    });

    // Find and click the underline button
    const underlineButton = screen.getByTitle('Souligné');
    act(() => {
      fireEvent.click(underlineButton);
    });

    // Check that the element was updated
    const updatedElement = useAppStore.getState().elements.find(el => el.id === elementId);
    expect(updatedElement?.textDecoration).toBe('underline');
  });

  it('should toggle underline decoration off', () => {
    render(<App />);
    
    let elementId: string;
    // Create a rectangle with underlined text
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
        text: 'Underlined Text',
        textDecoration: 'underline',
      });
      
      elementId = rectangle.id;
      // Select the rectangle
      store.selectElement(rectangle.id);
    });

    // The underline button should be active
    const underlineButton = screen.getByTitle('Souligné');
    expect(underlineButton).toHaveClass('active');

    // Click to toggle off
    act(() => {
      fireEvent.click(underlineButton);
    });

    // Check that the element was updated
    const updatedElement = useAppStore.getState().elements.find(el => el.id === elementId);
    expect(updatedElement?.textDecoration).toBe('none');
  });

  it('should work with different text alignments', () => {
    render(<App />);
    
    let elementId: string;
    // Create a rectangle with left-aligned, underlined text
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
        text: 'Left Aligned Text',
        textAlign: 'left',
        textDecoration: 'underline',
      });
      
      elementId = rectangle.id;
      // Select the rectangle
      store.selectElement(rectangle.id);
    });

    // Check that both properties are applied
    const element = useAppStore.getState().elements.find(el => el.id === elementId);
    expect(element?.textAlign).toBe('left');
    expect(element?.textDecoration).toBe('underline');

    // Change to right alignment
    const rightAlignButton = screen.getByTitle('Aligner à droite');
    act(() => {
      fireEvent.click(rightAlignButton);
    });

    // Check that alignment changed but underline remained
    const updatedElement = useAppStore.getState().elements.find(el => el.id === elementId);
    expect(updatedElement?.textAlign).toBe('right');
    expect(updatedElement?.textDecoration).toBe('underline');
  });

  it('should work with different shape types', () => {
    render(<App />);
    
    let circleId: string;
    // Create a circle with underlined text
    act(() => {
      const store = useAppStore.getState();
      const circle = store.addElement({
        type: 'circle',
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        roughness: 1,
        opacity: 1,
        text: 'Circle Text',
        textDecoration: 'none',
      });
      
      circleId = circle.id;
      // Select the circle
      store.selectElement(circle.id);
    });

    // Apply underline
    const underlineButton = screen.getByTitle('Souligné');
    act(() => {
      fireEvent.click(underlineButton);
    });

    // Check that the circle text is underlined
    const updatedCircle = useAppStore.getState().elements.find(el => el.id === circleId);
    expect(updatedCircle?.textDecoration).toBe('underline');
  });

  it('should work with multiple selected shapes', () => {
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
        textDecoration: 'none',
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
        textDecoration: 'none',
      });
      
      elementIds = [rectangle.id, circle.id];
      // Select both elements
      store.selectElements(elementIds);
    });

    // Apply underline to both
    const underlineButton = screen.getByTitle('Souligné');
    act(() => {
      fireEvent.click(underlineButton);
    });

    // Check that both elements were updated
    const state = useAppStore.getState();
    elementIds.forEach(id => {
      const element = state.elements.find(el => el.id === id);
      expect(element?.textDecoration).toBe('underline');
    });
  });
});