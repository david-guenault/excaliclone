// ABOUTME: Lock icon for canvas locking tool
// ABOUTME: Represents the ability to lock/unlock canvas editing

import React from 'react';
import { IconBase, type IconProps } from './IconBase';

export const LockIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <circle cx="12" cy="7" r="4" />
  </IconBase>
);