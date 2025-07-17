// ABOUTME: Align bottom icon for element alignment
// ABOUTME: Represents bottom edge alignment of elements

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const AlignBottomIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <line x1="4" y1="21" x2="20" y2="21" />
    <line x1="6" y1="9" x2="6" y2="17" />
    <line x1="10" y1="3" x2="10" y2="17" />
    <line x1="14" y1="6" x2="14" y2="17" />
    <line x1="18" y1="12" x2="18" y2="17" />
  </IconBase>
);