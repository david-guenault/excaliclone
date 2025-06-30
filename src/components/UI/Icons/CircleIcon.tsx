// ABOUTME: Circle icon for circle/ellipse drawing tool
// ABOUTME: Represents circular shape creation

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const CircleIcon: React.FC<IconProps> = (props) => (
  <IconBase aria-label="Circle tool" {...props}>
    <circle cx="12" cy="12" r="9" />
  </IconBase>
);