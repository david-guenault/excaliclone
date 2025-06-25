// ABOUTME: Tests for keyboard shortcut management system
// ABOUTME: Validates tool switching, editing shortcuts, navigation, and modifier handling

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KeyboardManager } from '../keyboard';

describe('KeyboardManager', () => {
  let keyboardManager: KeyboardManager;
  let mockCallback: ReturnType<typeof vi.fn>;

  // Helper to access private methods for testing
  const getPrivateMethod = (instance: any, methodName: string) => {
    return instance[methodName].bind(instance);
  };

  beforeEach(() => {
    keyboardManager = new KeyboardManager();
    mockCallback = vi.fn();
  });

  afterEach(() => {
    keyboardManager.destroy();
    vi.clearAllMocks();
  });

  describe('Tool switching shortcuts', () => {
    beforeEach(() => {
      keyboardManager.on('setTool', mockCallback);
    });

    it('should trigger rectangle tool with R key', () => {
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const event = new KeyboardEvent('keydown', { key: 'r' });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalledWith('rectangle');
    });

    it('should trigger circle tool with C key', () => {
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const event = new KeyboardEvent('keydown', { key: 'c' });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalledWith('circle');
    });

    it('should trigger selection tool with S key', () => {
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const event = new KeyboardEvent('keydown', { key: 's' });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalledWith('select');
    });

    it('should trigger line tool with L key', () => {
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const event = new KeyboardEvent('keydown', { key: 'l' });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalledWith('line');
    });

    it('should trigger arrow tool with A key', () => {
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const event = new KeyboardEvent('keydown', { key: 'a' });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalledWith('arrow');
    });

    it('should trigger pen tool with P key', () => {
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const event = new KeyboardEvent('keydown', { key: 'p' });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalledWith('pen');
    });

    it('should trigger text tool with T key', () => {
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const event = new KeyboardEvent('keydown', { key: 't' });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalledWith('text');
    });
  });

  describe('Editing shortcuts', () => {
    it('should trigger undo with Ctrl+Z', () => {
      keyboardManager.on('undo', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { 
        key: 'z', 
        ctrlKey: true 
      });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger redo with Ctrl+Y', () => {
      keyboardManager.on('redo', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { 
        key: 'y', 
        ctrlKey: true 
      });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger redo with Ctrl+Shift+Z', () => {
      keyboardManager.on('redo', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { 
        key: 'z', 
        ctrlKey: true,
        shiftKey: true
      });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger copy with Ctrl+C', () => {
      keyboardManager.on('copy', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { 
        key: 'c', 
        ctrlKey: true 
      });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger paste with Ctrl+V', () => {
      keyboardManager.on('paste', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { 
        key: 'v', 
        ctrlKey: true 
      });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger select all with Ctrl+A', () => {
      keyboardManager.on('selectAll', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { 
        key: 'a', 
        ctrlKey: true 
      });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger delete with Delete key', () => {
      keyboardManager.on('delete', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger delete with Backspace key', () => {
      keyboardManager.on('delete', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('Navigation shortcuts', () => {
    it('should trigger reset zoom with Ctrl+0', () => {
      keyboardManager.on('resetZoom', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { 
        key: '0', 
        ctrlKey: true 
      });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should trigger zoom to fit with Ctrl+1', () => {
      keyboardManager.on('zoomToFit', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { 
        key: '1', 
        ctrlKey: true 
      });
      
      handleKeyDown(event);
      
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('Modifier state tracking', () => {
    it('should track shift key state', () => {
      const modifierCallback = vi.fn();
      keyboardManager.on('modifierChange', modifierCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { shiftKey: true });
      handleKeyDown(event);
      
      const state = keyboardManager.getModifierState();
      expect(state.shift).toBe(true);
      expect(modifierCallback).toHaveBeenCalledWith(expect.objectContaining({
        shift: true
      }));
    });

    it('should track ctrl key state', () => {
      const modifierCallback = vi.fn();
      keyboardManager.on('modifierChange', modifierCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { ctrlKey: true });
      handleKeyDown(event);
      
      const state = keyboardManager.getModifierState();
      expect(state.ctrl).toBe(true);
    });

    it('should track alt key state', () => {
      const modifierCallback = vi.fn();
      keyboardManager.on('modifierChange', modifierCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { altKey: true });
      handleKeyDown(event);
      
      const state = keyboardManager.getModifierState();
      expect(state.alt).toBe(true);
    });

    it('should track meta key state', () => {
      const modifierCallback = vi.fn();
      keyboardManager.on('modifierChange', modifierCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      const event = new KeyboardEvent('keydown', { metaKey: true });
      handleKeyDown(event);
      
      const state = keyboardManager.getModifierState();
      expect(state.meta).toBe(true);
    });
  });

  describe('Space key handling', () => {
    it('should track space key press and release', () => {
      const spaceDownCallback = vi.fn();
      const spaceUpCallback = vi.fn();
      
      keyboardManager.on('spaceDown', spaceDownCallback);
      keyboardManager.on('spaceUp', spaceUpCallback);
      
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const handleKeyUp = getPrivateMethod(keyboardManager, 'handleKeyUp');
      
      // Press space
      const downEvent = new KeyboardEvent('keydown', { code: 'Space' });
      handleKeyDown(downEvent);
      
      expect(keyboardManager.isSpacePressedNow()).toBe(true);
      expect(spaceDownCallback).toHaveBeenCalled();
      
      // Release space
      const upEvent = new KeyboardEvent('keyup', { code: 'Space' });
      handleKeyUp(upEvent);
      
      expect(keyboardManager.isSpacePressedNow()).toBe(false);
      expect(spaceUpCallback).toHaveBeenCalled();
    });
  });

  describe('Input focus handling', () => {
    it('should not process shortcuts when input is focused', () => {
      keyboardManager.on('setTool', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const handleFocusIn = getPrivateMethod(keyboardManager, 'handleFocusIn');
      
      // Simulate focus on input with proper event structure
      const input = document.createElement('input');
      const focusEvent = { target: input } as FocusEvent;
      handleFocusIn(focusEvent);
      
      // Try to trigger shortcut
      const keyEvent = new KeyboardEvent('keydown', { key: 'r' });
      handleKeyDown(keyEvent);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should resume processing shortcuts when input loses focus', () => {
      keyboardManager.on('setTool', mockCallback);
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const handleFocusIn = getPrivateMethod(keyboardManager, 'handleFocusIn');
      const handleFocusOut = getPrivateMethod(keyboardManager, 'handleFocusOut');
      
      // Simulate focus then blur
      const input = document.createElement('input');
      const focusEvent = { target: input } as FocusEvent;
      handleFocusIn(focusEvent);
      
      const blurEvent = {} as FocusEvent;
      handleFocusOut(blurEvent);
      
      // Now shortcut should work
      const keyEvent = new KeyboardEvent('keydown', { key: 'r' });
      handleKeyDown(keyEvent);
      
      expect(mockCallback).toHaveBeenCalledWith('rectangle');
    });
  });

  describe('Event listener management', () => {
    it('should remove event listeners when destroyed', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      
      keyboardManager.destroy();
      
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('focusin', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('focusout', expect.any(Function));
    });

    it('should clear shortcuts and listeners when destroyed', () => {
      keyboardManager.on('setTool', mockCallback);
      keyboardManager.destroy();
      
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      
      // Try to trigger after destroy
      const event = new KeyboardEvent('keydown', { key: 'r' });
      handleKeyDown(event);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Shortcut priority and conflicts', () => {
    it('should prioritize Ctrl+C as copy over C tool when ctrl is pressed', () => {
      const toolCallback = vi.fn();
      const copyCallback = vi.fn();
      
      keyboardManager.on('setTool', toolCallback);
      keyboardManager.on('copy', copyCallback);
      
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const event = new KeyboardEvent('keydown', { 
        key: 'c', 
        ctrlKey: true 
      });
      
      handleKeyDown(event);
      
      expect(copyCallback).toHaveBeenCalled();
      expect(toolCallback).not.toHaveBeenCalled();
    });

    it('should prioritize Ctrl+A as select all over A tool when ctrl is pressed', () => {
      const toolCallback = vi.fn();
      const selectAllCallback = vi.fn();
      
      keyboardManager.on('setTool', toolCallback);
      keyboardManager.on('selectAll', selectAllCallback);
      
      const handleKeyDown = getPrivateMethod(keyboardManager, 'handleKeyDown');
      const event = new KeyboardEvent('keydown', { 
        key: 'a', 
        ctrlKey: true 
      });
      
      handleKeyDown(event);
      
      expect(selectAllCallback).toHaveBeenCalled();
      expect(toolCallback).not.toHaveBeenCalled();
    });
  });
});