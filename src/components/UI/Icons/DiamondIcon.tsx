// ABOUTME: Diamond icon for diamond/rhombus drawing tool
// ABOUTME: Represents diamond shape creation

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const DiamondIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M12 2 L20 12 L12 22 L4 12 L12 2 Z" />
  </IconBase>
);