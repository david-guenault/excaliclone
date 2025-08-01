// ABOUTME: Text icon for text tool
// ABOUTME: Represents text creation and editing

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const TextIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <polyline points="4,7 4,4 20,4 20,7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </IconBase>
);