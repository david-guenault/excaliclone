// ABOUTME: Visual save indicator component with animated floppy disk icon
// ABOUTME: Shows floating save status in top-right corner with red/orange blinking animation

import { useEffect, useState } from 'react';
import './SaveIndicator.css';

interface SaveIndicatorProps {
  isSaving: boolean;
}

export function SaveIndicator({ isSaving }: SaveIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isSaving) {
      setIsVisible(true);
    } else {
      // Keep visible for a short moment after saving completes
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  if (!isVisible) return null;

  return (
    <div className={`save-indicator ${isSaving ? 'saving' : 'saved'}`}>
      <div className="save-icon">💾</div>
      <div className="save-text">
        {isSaving ? 'Sauvegarde...' : 'Sauvé'}
      </div>
    </div>
  );
}