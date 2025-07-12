// ABOUTME: Keyboard shortcut management system
// ABOUTME: Handles tool switching, editing shortcuts, and modifier key states

import type { ToolType } from '../types';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: string;
  preventDefault?: boolean;
}

export interface ModifierState {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

export class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private modifierState: ModifierState = {
    shift: false,
    ctrl: false,
    alt: false,
    meta: false,
  };
  private listeners: Map<string, (data?: any) => void> = new Map();
  private isSpacePressed = false;
  private isInputFocused = false;
  private isTextEditingActive = false;

  constructor() {
    this.initializeShortcuts();
    this.bindEvents();
  }

  private initializeShortcuts() {
    // Tool switching shortcuts
    const toolShortcuts: Array<{ key: string; tool: ToolType }> = [
      { key: 's', tool: 'select' },
      { key: 'h', tool: 'hand' },
      { key: 'r', tool: 'rectangle' },
      { key: 'c', tool: 'circle' },
      { key: 'l', tool: 'line' },
      { key: 'a', tool: 'arrow' },
      { key: 'p', tool: 'pen' },
      { key: 't', tool: 'text' },
    ];

    toolShortcuts.forEach(({ key, tool }) => {
      this.addShortcut({
        key,
        action: `setTool:${tool}`,
        preventDefault: true,
      });
    });

    // Editing shortcuts
    this.addShortcut({
      key: 'z',
      ctrlKey: true,
      action: 'undo',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'y',
      ctrlKey: true,
      action: 'redo',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: 'redo',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'c',
      ctrlKey: true,
      action: 'copy',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'x',
      ctrlKey: true,
      action: 'cut',
      preventDefault: true,
    });

    // NOTE: Paste is handled by clipboard event listener, not keyboard shortcut
    // this.addShortcut({
    //   key: 'v',
    //   ctrlKey: true,
    //   action: 'paste',
    //   preventDefault: true,
    // });

    // Linux-style clipboard shortcuts (CTRL+INS / SHIFT+INS format)
    // Support multiple key name variations for better compatibility
    const insertKeyVariations = ['Insert', 'insert', 'Ins', 'ins'];
    const deleteKeyVariations = ['Delete', 'delete', 'Del', 'del', 'Suppr', 'suppr'];
    
    // CTRL+Insert for copy
    insertKeyVariations.forEach(keyName => {
      this.addShortcut({
        key: keyName,
        ctrlKey: true,
        action: 'copy',
        preventDefault: true,
      });
    });

    // SHIFT+Insert for paste
    insertKeyVariations.forEach(keyName => {
      this.addShortcut({
        key: keyName,
        shiftKey: true,
        action: 'paste',
        preventDefault: true,
      });
    });

    // SHIFT+Delete for cut
    deleteKeyVariations.forEach(keyName => {
      this.addShortcut({
        key: keyName,
        shiftKey: true,
        action: 'cut',
        preventDefault: true,
      });
    });


    // Style copy/paste shortcuts
    this.addShortcut({
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      action: 'copyStyle',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'v',
      ctrlKey: true,
      shiftKey: true,
      action: 'pasteStyle',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'a',
      ctrlKey: true,
      action: 'selectAll',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'd',
      ctrlKey: true,
      action: 'duplicate',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'Delete',
      action: 'delete',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'Backspace',
      action: 'delete',
      preventDefault: true,
    });

    // Zoom shortcuts
    this.addShortcut({
      key: '0',
      ctrlKey: true,
      action: 'resetZoom',
      preventDefault: true,
    });

    this.addShortcut({
      key: '1',
      ctrlKey: true,
      action: 'zoomToFit',
      preventDefault: true,
    });

    // Z-order shortcuts for group operations
    this.addShortcut({
      key: ']',
      ctrlKey: true,
      action: 'bringSelectedForward',
      preventDefault: true,
    });

    this.addShortcut({
      key: '[',
      ctrlKey: true,
      action: 'sendSelectedBackward',
      preventDefault: true,
    });

    this.addShortcut({
      key: ']',
      ctrlKey: true,
      shiftKey: true,
      action: 'bringSelectedToFront',
      preventDefault: true,
    });

    this.addShortcut({
      key: '[',
      ctrlKey: true,
      shiftKey: true,
      action: 'sendSelectedToBack',
      preventDefault: true,
    });

    // Element grouping shortcuts
    this.addShortcut({
      key: 'g',
      ctrlKey: true,
      action: 'groupSelectedElements',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'g',
      ctrlKey: true,
      shiftKey: true,
      action: 'ungroupSelectedElements',
      preventDefault: true,
    });

    // Element locking shortcuts
    this.addShortcut({
      key: 'l',
      ctrlKey: true,
      action: 'lockSelectedElements',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'l',
      ctrlKey: true,
      shiftKey: true,
      action: 'unlockSelectedElements',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'l',
      ctrlKey: true,
      altKey: true,
      action: 'unlockAllElements',
      preventDefault: true,
    });

    // Alignment shortcuts (using Ctrl+Alt to avoid conflicts)
    this.addShortcut({
      key: 'ArrowLeft',
      ctrlKey: true,
      altKey: true,
      action: 'alignLeft',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'ArrowRight',
      ctrlKey: true,
      altKey: true,
      action: 'alignRight',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'ArrowUp',
      ctrlKey: true,
      altKey: true,
      action: 'alignTop',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'ArrowDown',
      ctrlKey: true,
      altKey: true,
      action: 'alignBottom',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'h',
      ctrlKey: true,
      altKey: true,
      action: 'alignCenter',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'v',
      ctrlKey: true,
      altKey: true,
      action: 'alignMiddle',
      preventDefault: true,
    });

    // Grid shortcuts  
    this.addShortcut({
      key: '`',
      action: 'toggleGrid',
      preventDefault: true,
    });


    // Navigation shortcuts
    this.addShortcut({
      key: 'Tab',
      action: 'selectNext',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'Tab',
      shiftKey: true,
      action: 'selectPrevious',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'ArrowRight',
      action: 'selectNext',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'ArrowLeft',
      action: 'selectPrevious',
      preventDefault: true,
    });

    // Advanced selection shortcuts
    this.addShortcut({
      key: 'a',
      ctrlKey: true,
      shiftKey: true,
      action: 'selectByType',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'l',
      ctrlKey: true,
      shiftKey: true,
      action: 'selectSimilar',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'ArrowUp',
      action: 'selectAbove',
      preventDefault: true,
    });

    this.addShortcut({
      key: 'ArrowDown',
      action: 'selectBelow',
      preventDefault: true,
    });
  }

  private addShortcut(shortcut: KeyboardShortcut) {
    const key = this.createShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  private createShortcutKey(shortcut: KeyboardShortcut): string {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('ctrl');
    if (shortcut.shiftKey) parts.push('shift');
    if (shortcut.altKey) parts.push('alt');
    if (shortcut.metaKey) parts.push('meta');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }

  private bindEvents() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    this.updateModifierState(event);

    // Track space key for panning
    if (event.code === 'Space') {
      this.isSpacePressed = true;
      this.emit('spaceDown');
    }


    // Don't process shortcuts when input is focused or text editing is active
    if (this.isInputFocused || this.isTextEditingActive) return;

    const shortcutKey = this.createShortcutKey({
      key: event.key,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      action: '', // Add required action property (not used in key creation)
    });


    const shortcut = this.shortcuts.get(shortcutKey);
    if (shortcut) {
      if (shortcut.preventDefault) {
        event.preventDefault();
      }
      this.handleShortcut(shortcut);
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    this.updateModifierState(event);

    // Track space key release
    if (event.code === 'Space') {
      this.isSpacePressed = false;
      this.emit('spaceUp');
    }
  }

  private handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;
    
    this.isInputFocused = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.contentEditable === 'true';
  }

  private handleFocusOut() {
    this.isInputFocused = false;
  }

  private updateModifierState(event: KeyboardEvent) {
    this.modifierState = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      meta: event.metaKey,
    };
    this.emit('modifierChange', this.modifierState);
  }

  private handleShortcut(shortcut: KeyboardShortcut) {
    if (shortcut.action.startsWith('setTool:')) {
      const tool = shortcut.action.split(':')[1] as ToolType;
      this.emit('setTool', tool);
    } else {
      this.emit(shortcut.action);
    }
  }

  public on(event: string, callback: (data?: any) => void) {
    this.listeners.set(event, callback);
  }

  public off(event: string) {
    this.listeners.delete(event);
  }

  private emit(event: string, data?: any) {
    const callback = this.listeners.get(event);
    if (callback) {
      callback(data);
    }
  }

  public getModifierState(): ModifierState {
    return { ...this.modifierState };
  }

  public isSpacePressedNow(): boolean {
    return this.isSpacePressed;
  }

  public setTextEditingActive(active: boolean): void {
    this.isTextEditingActive = active;
  }

  public isTextEditingActiveNow(): boolean {
    return this.isTextEditingActive;
  }

  public destroy() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    document.removeEventListener('focusin', this.handleFocusIn.bind(this));
    document.removeEventListener('focusout', this.handleFocusOut.bind(this));
    this.shortcuts.clear();
    this.listeners.clear();
  }
}

export const keyboardManager = new KeyboardManager();