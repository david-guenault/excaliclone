// ABOUTME: Line icon for line drawing tool
// ABOUTME: Represents straight line creation

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const LineIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <line x1="4" y1="20" x2="20" y2="4" />
  </IconBase>
);