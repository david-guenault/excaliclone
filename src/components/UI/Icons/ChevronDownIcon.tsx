// ABOUTME: Chevron down icon for dropdowns
// ABOUTME: Represents expandable menu indicator

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <polyline points="6,9 12,15 18,9" />
  </IconBase>
);