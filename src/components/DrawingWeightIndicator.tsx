// ABOUTME: Drawing weight indicator component for toolbar
// ABOUTME: Shows total size of drawing including images, updated in real-time

import { useAppStore } from '../store';
import { useMemo } from 'react';
import './DrawingWeightIndicator.css';

function calculateElementSize(element: any): number {
  // Base element size (properties)
  let size = JSON.stringify(element).length;
  
  // Add image data size if present
  if (element.imageUrl && element.imageUrl.startsWith('data:')) {
    // Estimate base64 size (base64 is ~1.37x larger than binary)
    const base64Data = element.imageUrl.split(',')[1] || '';
    size += base64Data.length;
  }
  
  return size;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

export function DrawingWeightIndicator() {
  const elements = useAppStore(state => state.elements);
  
  const { totalSize, elementCount, imageCount, imageSize } = useMemo(() => {
    let totalSize = 0;
    let imageSize = 0;
    let imageCount = 0;
    
    for (const element of elements) {
      const elementSize = calculateElementSize(element);
      totalSize += elementSize;
      
      if (element.type === 'image' && element.imageUrl) {
        imageCount++;
        if (element.imageUrl.startsWith('data:')) {
          const base64Data = element.imageUrl.split(',')[1] || '';
          imageSize += base64Data.length;
        }
      }
    }
    
    return {
      totalSize,
      elementCount: elements.length,
      imageCount,
      imageSize
    };
  }, [elements]);

  const sizeClass = totalSize > 5 * 1024 * 1024 ? 'large' : 
                   totalSize > 1024 * 1024 ? 'medium' : 'small';

  return (
    <>
      <div className="toolbar-separator" />
      <div className={`drawing-weight-indicator ${sizeClass}`} 
           title={`${elementCount} éléments • ${imageCount} images • Taille totale: ${formatSize(totalSize)}`}>
        <div className="weight-icon">⚖️</div>
        <div className="weight-info">
          <div className="weight-size">{formatSize(totalSize)}</div>
          <div className="weight-details">
            {elementCount} obj{elementCount !== 1 ? 's' : ''}
            {imageCount > 0 && ` • ${imageCount} img${imageCount !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>
    </>
  );
}