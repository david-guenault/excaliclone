// ABOUTME: Distribute horizontal icon for element distribution
// ABOUTME: Represents horizontal spacing distribution of elements

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const DistributeHorizontalIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <rect x="3" y="8" width="3" height="8" />
    <rect x="10.5" y="6" width="3" height="12" />
    <rect x="18" y="9" width="3" height="6" />
    <line x1="6" y1="4" x2="10.5" y2="4" />
    <line x1="13.5" y1="4" x2="18" y2="4" />
    <polygon points="8,2 10,4 8,6" />
    <polygon points="16,2 14,4 16,6" />
  </IconBase>
);