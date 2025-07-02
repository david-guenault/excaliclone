// ABOUTME: Simple test for double-click text editing to debug the functionality
// ABOUTME: Basic test to verify the store actions and text editing overlay work

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../App';
import { useAppStore } from '../store';

describe('Double-Click Text Editing - Simple', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.getState().elements = [];
    useAppStore.getState().selectedElementIds = [];
    useAppStore.getState().doubleClickTextEditing = {
      isEditing: false,
      elementId: null,
      position: null,
      initialText: '',
    };
  });

  it('should render the app without errors', () => {
    render(<App />);
    expect(screen.getByRole('img', { name: /canvas/i })).toBeInTheDocument();
  });

  it('should have double-click text editing actions in store', () => {
    const store = useAppStore.getState();
    expect(typeof store.startDoubleClickTextEditing).toBe('function');
    expect(typeof store.endDoubleClickTextEditing).toBe('function');
    expect(typeof store.saveDoubleClickTextEdit).toBe('function');
    expect(typeof store.cancelDoubleClickTextEdit).toBe('function');
  });

  it('should start double-click text editing when action is called', () => {
    const store = useAppStore.getState();
    
    act(() => {
      store.startDoubleClickTextEditing('test-id', { x: 100, y: 100 }, 'test text');
    });

    const newState = useAppStore.getState();
    expect(newState.doubleClickTextEditing.isEditing).toBe(true);
    expect(newState.doubleClickTextEditing.elementId).toBe('test-id');
    expect(newState.doubleClickTextEditing.position).toEqual({ x: 100, y: 100 });
    expect(newState.doubleClickTextEditing.initialText).toBe('test text');
  });

  it('should show text editing overlay when editing state is active', () => {
    render(<App />);
    const store = useAppStore.getState();
    
    // Add a simple rectangle element
    act(() => {
      store.addElement({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: '#ffffff',
        strokeWidth: 2,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        roughness: 1,
        opacity: 1,
        text: 'Test Text',
      });
    });

    // Start text editing
    act(() => {
      store.startDoubleClickTextEditing('test-id', { x: 150, y: 125 }, 'Test Text');
    });

    // Should show text editing overlay
    expect(screen.getByRole('textbox', { name: /edit text/i })).toBeInTheDocument();
  });

  it('should hide text editing overlay when editing is cancelled', () => {
    render(<App />);
    const store = useAppStore.getState();
    
    // Start text editing
    act(() => {
      store.startDoubleClickTextEditing('test-id', { x: 150, y: 125 }, 'Test Text');
    });

    // Should show overlay
    expect(screen.getByRole('textbox', { name: /edit text/i })).toBeInTheDocument();

    // Cancel editing
    act(() => {
      store.cancelDoubleClickTextEdit();
    });

    // Should hide overlay
    expect(screen.queryByRole('textbox', { name: /edit text/i })).not.toBeInTheDocument();
  });

  it('should save text changes when saveDoubleClickTextEdit is called', () => {
    render(<App />);
    
    // Add a rectangle element
    act(() => {
      const store = useAppStore.getState();
      store.addElement({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: '#ffffff',
        strokeWidth: 2,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        roughness: 1,
        opacity: 1,
        text: 'Original Text',
      });
    });

    // Get the element ID from the store after adding
    const elementId = useAppStore.getState().elements[0].id;

    // Start text editing
    act(() => {
      const store = useAppStore.getState();
      store.startDoubleClickTextEditing(elementId, { x: 150, y: 125 }, 'Original Text');
    });

    // Get updated state after starting editing
    let updatedState = useAppStore.getState();
    
    // Verify editing state is active
    expect(updatedState.doubleClickTextEditing.isEditing).toBe(true);
    expect(updatedState.doubleClickTextEditing.elementId).toBe(elementId);

    // Save new text
    act(() => {
      const store = useAppStore.getState();
      store.saveDoubleClickTextEdit('New Text');
    });

    // Get updated state after saving
    updatedState = useAppStore.getState();

    // Should save text to element
    const updatedElement = updatedState.elements.find(el => el.id === elementId);
    expect(updatedElement?.text).toBe('New Text');

    // Should end editing mode
    expect(updatedState.doubleClickTextEditing.isEditing).toBe(false);
  });
});