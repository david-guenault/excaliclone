// ABOUTME: Base icon component with consistent props and styling
// ABOUTME: Provides standard sizing and styling for all toolbar icons

import React from 'react';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  'aria-label'?: string;
  role?: string;
}

export interface IconBaseProps extends IconProps {
  children: React.ReactNode;
  viewBox?: string;
}

export const IconBase: React.FC<IconBaseProps> = ({
  children,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.5,
  className = '',
  viewBox = '0 0 24 24',
  'aria-label': ariaLabel,
  role = 'img',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={role}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </svg>
  );
};