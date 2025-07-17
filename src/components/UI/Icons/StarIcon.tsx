// ABOUTME: Star icon for star drawing tool
// ABOUTME: Represents star shape creation

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const StarIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <polygon points="12,2 15.09,8.26 22,9 17,14.74 18.18,21.02 12,17.77 5.82,21.02 7,14.74 2,9 8.91,8.26" fill="none" />
  </IconBase>
);