// ABOUTME: Distribute vertical icon for element distribution
// ABOUTME: Represents vertical spacing distribution of elements

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const DistributeVerticalIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <rect x="8" y="3" width="8" height="3" />
    <rect x="6" y="10.5" width="12" height="3" />
    <rect x="9" y="18" width="6" height="3" />
    <line x1="20" y1="6" x2="20" y2="10.5" />
    <line x1="20" y1="13.5" x2="20" y2="18" />
    <polygon points="22,8 20,10 18,8" />
    <polygon points="22,16 20,14 18,16" />
  </IconBase>
);