// ABOUTME: Align middle icon for element alignment
// ABOUTME: Represents vertical center alignment of elements

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const AlignMiddleIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="6" y1="8" x2="6" y2="16" />
    <line x1="10" y1="6" x2="10" y2="18" />
    <line x1="14" y1="7" x2="14" y2="17" />
    <line x1="18" y1="10" x2="18" y2="14" />
  </IconBase>
);