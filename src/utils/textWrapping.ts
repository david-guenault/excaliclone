// ABOUTME: Text wrapping utilities for automatic line breaks during text editing
// ABOUTME: Handles word wrapping with proper cursor position management

import type { Element } from '../types';

/**
 * Calculate the maximum width available for text in a shape
 */
export function calculateMaxTextWidth(element: Element): number {
  const padding = 8; // Padding inside the shape
  
  if (element.type === 'rectangle') {
    return Math.max(element.width - (padding * 2), 20); // Minimum 20px width
  } else if (element.type === 'circle') {
    // For circles, use inscribed rectangle (width and height reduced by ~30%)
    const inscribedSize = Math.min(element.width, element.height) * 0.7;
    return Math.max(inscribedSize - (padding * 2), 20);
  } else {
    // For lines and arrows, use a reasonable width
    return Math.max(Math.min(element.width, 200) - (padding * 2), 20);
  }
}

/**
 * Measure text width using canvas context with specific font settings
 */
export function measureTextWidth(text: string, element: Element, ctx: CanvasRenderingContext2D): number {
  const fontSize = element.fontSize || 16;
  const fontFamily = element.fontFamily || 'Excalifont';
  const fontWeight = element.fontWeight || 'normal';
  const fontStyle = element.fontStyle || 'normal';
  
  // Save current font
  const oldFont = ctx.font;
  
  // Set font for measurement
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  
  // Measure text
  const width = ctx.measureText(text).width;
  
  // Restore font
  ctx.font = oldFont;
  
  return width;
}

/**
 * Wrap text automatically by inserting line breaks where needed
 * Returns the wrapped text and the new cursor position
 */
export function autoWrapText(
  text: string, 
  cursorPosition: number, 
  element: Element, 
  ctx: CanvasRenderingContext2D
): { text: string; cursorPosition: number } {
  const maxWidth = calculateMaxTextWidth(element);
  
  // Split by existing line breaks first
  const paragraphs = text.split('\n');
  const wrappedParagraphs: string[] = [];
  let newCursorPosition = cursorPosition;
  let currentLength = 0;
  
  for (let p = 0; p < paragraphs.length; p++) {
    const paragraph = paragraphs[p];
    
    if (paragraph === '') {
      // Empty line from explicit line break
      wrappedParagraphs.push('');
      if (currentLength < cursorPosition) {
        currentLength += 1; // Account for \n
      }
      continue;
    }
    
    // For each paragraph, wrap words within maxWidth
    const words = paragraph.split(' ');
    const wrappedLines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = measureTextWidth(testLine, element, ctx);
      
      if (testWidth <= maxWidth || currentLine === '') {
        // Word fits on current line, or it's the first word
        currentLine = testLine;
      } else {
        // Word doesn't fit, start new line
        if (currentLine) {
          wrappedLines.push(currentLine);
          
          // Adjust cursor position if we've added a line break before the cursor
          if (currentLength + currentLine.length < cursorPosition) {
            newCursorPosition++; // Account for added line break
          }
        }
        currentLine = word;
      }
    }
    
    // Add the last line of this paragraph if it has content
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
    
    // Join the wrapped lines for this paragraph
    const wrappedParagraph = wrappedLines.join('\n');
    wrappedParagraphs.push(wrappedParagraph);
    
    // Update current length for cursor position calculation
    currentLength += wrappedParagraph.length;
    if (p < paragraphs.length - 1) {
      currentLength += 1; // Account for paragraph separator
    }
  }
  
  const wrappedText = wrappedParagraphs.join('\n');
  
  return {
    text: wrappedText,
    cursorPosition: Math.min(newCursorPosition, wrappedText.length)
  };
}

/**
 * Check if text needs wrapping by looking for lines that exceed maxWidth
 */
export function needsWrapping(text: string, element: Element, ctx: CanvasRenderingContext2D): boolean {
  const maxWidth = calculateMaxTextWidth(element);
  const lines = text.split('\n');
  
  for (const line of lines) {
    const width = measureTextWidth(line, element, ctx);
    if (width > maxWidth) {
      return true;
    }
  }
  
  return false;
}