// ABOUTME: Selection cursor icon for select tool
// ABOUTME: Represents the selection and manipulation tool

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const SelectionIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    <path d="M13 13l6 6" />
  </IconBase>
);