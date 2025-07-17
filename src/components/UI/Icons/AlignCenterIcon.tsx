// ABOUTME: Align center icon for element alignment
// ABOUTME: Represents horizontal center alignment of elements

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const AlignCenterIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="6" y1="10" x2="18" y2="10" />
    <line x1="7" y1="14" x2="17" y2="14" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </IconBase>
);