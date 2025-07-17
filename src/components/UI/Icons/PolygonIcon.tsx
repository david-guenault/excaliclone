// ABOUTME: Polygon icon for polygon drawing tool
// ABOUTME: Represents multi-sided polygon creation

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const PolygonIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="none" />
  </IconBase>
);