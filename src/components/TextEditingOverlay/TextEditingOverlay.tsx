// ABOUTME: Text editing overlay component for in-place text editing on canvas elements
// ABOUTME: Provides a positioned text input that appears on double-click of any element type

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store';
import type { Point } from '../../types';
import './TextEditingOverlay.css';

interface TextEditingOverlayProps {
  elementId: string;
  position: Point;
  initialText: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export const TextEditingOverlay: React.FC<TextEditingOverlayProps> = ({
  elementId,
  position,
  initialText,
  onSave,
  onCancel,
}) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { viewport } = useAppStore();

  // Convert world coordinates to screen coordinates
  const screenX = position.x * viewport.zoom + viewport.pan.x;
  const screenY = position.y * viewport.zoom + viewport.pan.y;

  useEffect(() => {
    // Focus the textarea when component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select(); // Select all text for easy replacement
    }
  }, []);

  // Additional effect to aggressively prevent browser paste UI
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Prevent all context menu events that might trigger paste UI
    const preventContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    // Prevent drag and drop which can also trigger paste-like UI
    const preventDragDrop = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Add multiple event listeners to catch all possible paste UI triggers
    textarea.addEventListener('contextmenu', preventContextMenu, { passive: false });
    textarea.addEventListener('dragover', preventDragDrop, { passive: false });
    textarea.addEventListener('drop', preventDragDrop, { passive: false });
    textarea.addEventListener('dragenter', preventDragDrop, { passive: false });
    textarea.addEventListener('dragleave', preventDragDrop, { passive: false });

    return () => {
      textarea.removeEventListener('contextmenu', preventContextMenu);
      textarea.removeEventListener('dragover', preventDragDrop);
      textarea.removeEventListener('drop', preventDragDrop);
      textarea.removeEventListener('dragenter', preventDragDrop);
      textarea.removeEventListener('dragleave', preventDragDrop);
    };
  }, []);

  useEffect(() => {
    // Handle clicks outside the overlay
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [text]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    } else if (event.key === 'Home') {
      event.preventDefault();
      if (event.shiftKey) {
        // Select from current position to beginning of text
        textarea.setSelectionRange(0, textarea.selectionEnd);
      } else {
        // Move cursor to beginning
        textarea.setSelectionRange(0, 0);
      }
    } else if (event.key === 'End') {
      event.preventDefault();
      const textLength = textarea.value.length;
      if (event.shiftKey) {
        // Select from current position to end of text
        textarea.setSelectionRange(textarea.selectionStart, textLength);
      } else {
        // Move cursor to end
        textarea.setSelectionRange(textLength, textLength);
      }
    } else if (event.key === 'ArrowLeft' && event.shiftKey) {
      event.preventDefault();
      // Extend selection to the left
      const newStart = Math.max(0, textarea.selectionEnd - 1);
      textarea.setSelectionRange(textarea.selectionStart, newStart);
    } else if (event.key === 'ArrowRight' && event.shiftKey) {
      event.preventDefault();
      // Extend selection to the right
      const newEnd = Math.min(textarea.value.length, textarea.selectionEnd + 1);
      textarea.setSelectionRange(textarea.selectionStart, newEnd);
    } else if (event.key === 'a' && event.ctrlKey) {
      event.preventDefault();
      // Select all text
      textarea.setSelectionRange(0, textarea.value.length);
    }
  };

  const handleSave = () => {
    onSave(text);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Prevent browser's native paste UI from appearing
    event.preventDefault();
    event.stopPropagation();
    
    // Get clipboard text
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text/plain') || '';
    
    if (pastedText && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Replace selected text with pasted text
      const newText = text.slice(0, start) + pastedText + text.slice(end);
      setText(newText);
      
      // Set cursor position after pasted text
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = start + pastedText.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  return (
    <div
      className="text-editing-overlay"
      style={{
        left: screenX,
        top: screenY,
        transform: 'translate(-50%, -50%)', // Center on position
      }}
    >
      <textarea
        ref={textareaRef}
        className="text-editing-overlay__input"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Enter text..."
        aria-label="Edit text"
        rows={3}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
      />
      <div className="text-editing-overlay__hint">
        Press Enter to save, Esc to cancel
      </div>
    </div>
  );
};