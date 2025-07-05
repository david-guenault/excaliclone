// ABOUTME: Comprehensive test suite for all icon components
// ABOUTME: Tests rendering, accessibility, and consistent behavior across all icons

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { 
  ArrowIcon, 
  ChevronDownIcon, 
  CircleIcon, 
  DiamondIcon, 
  EraserIcon, 
  HandIcon, 
  ImageIcon, 
  LineIcon, 
  LockIcon, 
  MenuIcon, 
  PenIcon, 
  RectangleIcon, 
  SelectionIcon, 
  TextIcon, 
  UnlockIcon 
} from '../index';

describe('All Icon Components', () => {
  const icons = [
    { name: 'ArrowIcon', Component: ArrowIcon },
    { name: 'ChevronDownIcon', Component: ChevronDownIcon },
    { name: 'CircleIcon', Component: CircleIcon },
    { name: 'DiamondIcon', Component: DiamondIcon },
    { name: 'EraserIcon', Component: EraserIcon },
    { name: 'HandIcon', Component: HandIcon },
    { name: 'ImageIcon', Component: ImageIcon },
    { name: 'LineIcon', Component: LineIcon },
    { name: 'LockIcon', Component: LockIcon },
    { name: 'MenuIcon', Component: MenuIcon },
    { name: 'PenIcon', Component: PenIcon },
    { name: 'RectangleIcon', Component: RectangleIcon },
    { name: 'SelectionIcon', Component: SelectionIcon },
    { name: 'TextIcon', Component: TextIcon },
    { name: 'UnlockIcon', Component: UnlockIcon },
  ];

  describe('Basic Rendering', () => {
    icons.forEach(({ name, Component }) => {
      it(`should render ${name} without crashing`, () => {
        const { container } = render(<Component />);
        expect(container.firstChild).toBeTruthy();
      });

      it(`should render ${name} as an SVG element`, () => {
        const { container } = render(<Component />);
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    icons.forEach(({ name, Component }) => {
      it(`should have proper role attribute for ${name}`, () => {
        const { container } = render(<Component />);
        const svg = container.querySelector('svg');
        
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute('role')).toBe('img');
      });

      it(`should accept aria-label prop for ${name}`, () => {
        const customLabel = `Custom ${name} label`;
        const { container } = render(<Component aria-label={customLabel} />);
        const svg = container.querySelector('svg');
        
        expect(svg?.getAttribute('aria-label')).toBe(customLabel);
      });
    });
  });

  describe('Size Consistency', () => {
    icons.forEach(({ name, Component }) => {
      it(`should have consistent default size for ${name}`, () => {
        const { container } = render(<Component />);
        const svg = container.querySelector('svg');
        
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute('width')).toBe('20');
        expect(svg?.getAttribute('height')).toBe('20');
      });
    });
  });

  describe('Custom Props', () => {
    icons.forEach(({ name, Component }) => {
      it(`should accept custom className for ${name}`, () => {
        const customClass = 'custom-icon-class';
        const { container } = render(<Component className={customClass} />);
        const svg = container.querySelector('svg');
        
        expect(svg?.classList.contains(customClass)).toBe(true);
      });

      it(`should accept custom size for ${name}`, () => {
        const customSize = 32;
        const { container } = render(<Component size={customSize} />);
        const svg = container.querySelector('svg');
        
        expect(svg?.getAttribute('width')).toBe(customSize.toString());
        expect(svg?.getAttribute('height')).toBe(customSize.toString());
      });
    });
  });

  describe('Style Consistency', () => {
    icons.forEach(({ name, Component }) => {
      it(`should have consistent stroke properties for ${name}`, () => {
        const { container } = render(<Component />);
        const svg = container.querySelector('svg');
        
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute('stroke')).toBe('currentColor');
        expect(svg?.getAttribute('fill')).toBe('none');
        expect(svg?.getAttribute('stroke-width')).toBe('1.5');
        expect(svg?.getAttribute('stroke-linecap')).toBe('round');
        expect(svg?.getAttribute('stroke-linejoin')).toBe('round');
      });
    });
  });
});