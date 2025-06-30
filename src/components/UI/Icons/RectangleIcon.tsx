// ABOUTME: Rectangle icon for rectangle drawing tool
// ABOUTME: Represents rectangular shape creation

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const RectangleIcon: React.FC<IconProps> = (props) => (
  <IconBase aria-label="Rectangle tool" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </IconBase>
);