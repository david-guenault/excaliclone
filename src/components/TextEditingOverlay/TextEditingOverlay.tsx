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
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
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