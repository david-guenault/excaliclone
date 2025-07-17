// ABOUTME: Align left icon for element alignment
// ABOUTME: Represents left edge alignment of elements

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const AlignLeftIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <line x1="3" y1="4" x2="3" y2="20" />
    <line x1="7" y1="6" x2="15" y2="6" />
    <line x1="7" y1="10" x2="21" y2="10" />
    <line x1="7" y1="14" x2="18" y2="14" />
    <line x1="7" y1="18" x2="12" y2="18" />
  </IconBase>
);