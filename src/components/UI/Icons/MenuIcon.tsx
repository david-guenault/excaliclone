// ABOUTME: Menu icon for options menu
// ABOUTME: Represents additional options and settings

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const MenuIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </IconBase>
);