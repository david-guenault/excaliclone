// ABOUTME: Text editing overlay component for in-place text editing
// ABOUTME: Provides input field positioned over canvas for text element editing

import React, { useEffect, useRef, useState } from 'react';
import type { Point } from '../../types';
import './TextEditor.css';

interface TextEditorProps {
  position: Point;
  initialValue: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  onTextChange: (text: string) => void;
  onFinish: () => void;
  onCancel: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  position,
  initialValue,
  fontSize,
  fontFamily,
  fontWeight,
  fontStyle,
  textAlign,
  color,
  onTextChange,
  onFinish,
  onCancel,
}) => {
  const [text, setText] = useState(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the textarea when component mounts with a small delay
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
        setIsInitialized(true);
      }
    }, 50); // Small delay to ensure proper mounting
    
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onFinish();
    }
  };

  const handleBlur = () => {
    // Only finish editing if the component has been properly initialized
    // This prevents immediate blur events during mounting
    if (isInitialized) {
      onFinish();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange(newText);
  };

  return (
    <div
      className="text-editor-overlay"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 10000,
        width: '200px',
        height: '100px',
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="text-editor-input"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily,
          fontWeight: fontWeight,
          fontStyle: fontStyle,
          textAlign: textAlign,
          color: color,
          minWidth: '100px',
          minHeight: `${fontSize * 1.2}px`,
        }}
        placeholder="Tapez votre texte..."
        rows={1}
      />
    </div>
  );
};