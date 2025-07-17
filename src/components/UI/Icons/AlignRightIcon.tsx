// ABOUTME: Align right icon for element alignment
// ABOUTME: Represents right edge alignment of elements

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const AlignRightIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <line x1="21" y1="4" x2="21" y2="20" />
    <line x1="9" y1="6" x2="17" y2="6" />
    <line x1="3" y1="10" x2="17" y2="10" />
    <line x1="6" y1="14" x2="17" y2="14" />
    <line x1="12" y1="18" x2="17" y2="18" />
  </IconBase>
);