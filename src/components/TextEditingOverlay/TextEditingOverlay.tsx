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
        placeholder="Enter text..."
        aria-label="Edit text"
        rows={1}
        autoFocus
      />
      <div className="text-editing-overlay__hint">
        Press Enter to save, Esc to cancel
      </div>
    </div>
  );
};