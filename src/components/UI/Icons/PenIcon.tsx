// ABOUTME: Pen icon for freehand drawing tool
// ABOUTME: Represents freehand/pen drawing

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const PenIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </IconBase>
);