// ABOUTME: Arrow icon for arrow drawing tool
// ABOUTME: Represents arrow creation

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const ArrowIcon: React.FC<IconProps> = (props) => (
  <IconBase aria-label="Arrow tool" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </IconBase>
);