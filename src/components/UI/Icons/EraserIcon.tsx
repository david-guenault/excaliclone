// ABOUTME: Eraser icon for element deletion tool
// ABOUTME: Represents element erasing/deletion

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const EraserIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M20 20H8l-4-4a2 2 0 0 1 0-2.83l8.5-8.5a2 2 0 0 1 2.83 0l4.67 4.67a2 2 0 0 1 0 2.83L16 16" />
    <path d="M2 22l3-3" />
  </IconBase>
);