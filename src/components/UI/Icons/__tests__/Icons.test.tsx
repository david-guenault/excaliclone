// ABOUTME: Tests for all Icon components - comprehensive component coverage
// ABOUTME: Ensures all icons render correctly and accept proper props

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { RectangleIcon } from '../RectangleIcon';
import { CircleIcon } from '../CircleIcon';
import { ArrowIcon } from '../ArrowIcon';
import { LineIcon } from '../LineIcon';
import { PenIcon } from '../PenIcon';
import { TextIcon } from '../TextIcon';
import { HandIcon } from '../HandIcon';
import { SelectionIcon } from '../SelectionIcon';
import { DiamondIcon } from '../DiamondIcon';
import { ImageIcon } from '../ImageIcon';
import { EraserIcon } from '../EraserIcon';
import { MenuIcon } from '../MenuIcon';
import { ChevronDownIcon } from '../ChevronDownIcon';
import { LockIcon } from '../LockIcon';
import { UnlockIcon } from '../UnlockIcon';

describe('Icon Components', () => {
  describe('Drawing Tool Icons', () => {
    it('renders RectangleIcon correctly', () => {
      const { container } = render(<RectangleIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const rect = container.querySelector('rect');
      expect(rect).toBeInTheDocument();
      expect(rect).toHaveAttribute('x', '3');
      expect(rect).toHaveAttribute('y', '3');
      expect(rect).toHaveAttribute('width', '18');
      expect(rect).toHaveAttribute('height', '18');
    });

    it('renders CircleIcon correctly', () => {
      const { container } = render(<CircleIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const circle = container.querySelector('circle');
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveAttribute('cx', '12');
      expect(circle).toHaveAttribute('cy', '12');
      expect(circle).toHaveAttribute('r', '9');
    });

    it('renders ArrowIcon correctly', () => {
      const { container } = render(<ArrowIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const line = container.querySelector('line');
      const polyline = container.querySelector('polyline');
      expect(line).toBeInTheDocument();
      expect(polyline).toBeInTheDocument();
    });

    it('renders LineIcon correctly', () => {
      const { container } = render(<LineIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const line = container.querySelector('line');
      expect(line).toBeInTheDocument();
    });

    it('renders PenIcon correctly', () => {
      const { container } = render(<PenIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('renders TextIcon correctly', () => {
      const { container } = render(<TextIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const lines = container.querySelectorAll('line');
      const polylines = container.querySelectorAll('polyline');
      expect(lines.length).toBe(2);
      expect(polylines.length).toBe(1);
    });

    it('renders DiamondIcon correctly', () => {
      const { container } = render(<DiamondIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('renders ImageIcon correctly', () => {
      const { container } = render(<ImageIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const rect = container.querySelector('rect');
      const circle = container.querySelector('circle');
      const polyline = container.querySelector('polyline');
      expect(rect).toBeInTheDocument();
      expect(circle).toBeInTheDocument();
      expect(polyline).toBeInTheDocument();
    });

    it('renders EraserIcon correctly', () => {
      const { container } = render(<EraserIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('UI Tool Icons', () => {
    it('renders HandIcon correctly', () => {
      const { container } = render(<HandIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('renders SelectionIcon correctly', () => {
      const { container } = render(<SelectionIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      // Selection icon typically has dashed rect or path elements
      const elements = container.querySelectorAll('rect, path');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders MenuIcon correctly', () => {
      const { container } = render(<MenuIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(3); // Menu has 3 dots
    });

    it('renders ChevronDownIcon correctly', () => {
      const { container } = render(<ChevronDownIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const paths = container.querySelectorAll('path, polyline');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('renders LockIcon correctly', () => {
      const { container } = render(<LockIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const paths = container.querySelectorAll('path, rect');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('renders UnlockIcon correctly', () => {
      const { container } = render(<UnlockIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      const paths = container.querySelectorAll('path, rect');
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('Icon Props Support', () => {
    it('all icons accept custom size', () => {
      const icons = [
        RectangleIcon,
        CircleIcon,
        ArrowIcon,
        LineIcon,
        PenIcon,
        TextIcon,
        HandIcon,
        SelectionIcon,
        DiamondIcon,
        ImageIcon,
        EraserIcon,
        MenuIcon,
        ChevronDownIcon,
        LockIcon,
        UnlockIcon,
      ];

      icons.forEach((IconComponent) => {
        const { container } = render(<IconComponent size={32} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '32');
        expect(svg).toHaveAttribute('height', '32');
      });
    });

    it('all icons accept custom color', () => {
      const icons = [
        RectangleIcon,
        CircleIcon,
        ArrowIcon,
        LineIcon,
        PenIcon,
        TextIcon,
        HandIcon,
        SelectionIcon,
        DiamondIcon,
        ImageIcon,
        EraserIcon,
        MenuIcon,
        ChevronDownIcon,
        LockIcon,
        UnlockIcon,
      ];

      icons.forEach((IconComponent) => {
        const { container } = render(<IconComponent color="#ff0000" />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('stroke', '#ff0000');
      });
    });

    it('all icons accept custom strokeWidth', () => {
      const icons = [
        RectangleIcon,
        CircleIcon,
        ArrowIcon,
        LineIcon,
        PenIcon,
        TextIcon,
        HandIcon,
        SelectionIcon,
        DiamondIcon,
        ImageIcon,
        EraserIcon,
        MenuIcon,
        ChevronDownIcon,
        LockIcon,
        UnlockIcon,
      ];

      icons.forEach((IconComponent) => {
        const { container } = render(<IconComponent strokeWidth={3} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('stroke-width', '3');
      });
    });

    it('all icons accept custom className', () => {
      const icons = [
        RectangleIcon,
        CircleIcon,
        ArrowIcon,
        LineIcon,
        PenIcon,
        TextIcon,
        HandIcon,
        SelectionIcon,
        DiamondIcon,
        ImageIcon,
        EraserIcon,
        MenuIcon,
        ChevronDownIcon,
        LockIcon,
        UnlockIcon,
      ];

      icons.forEach((IconComponent) => {
        const { container } = render(<IconComponent className="test-icon" />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('test-icon');
      });
    });
  });

  describe('Icon Consistency', () => {
    it('all icons use IconBase and have consistent structure', () => {
      const icons = [
        RectangleIcon,
        CircleIcon,
        ArrowIcon,
        LineIcon,
        PenIcon,
        TextIcon,
        HandIcon,
        SelectionIcon,
        DiamondIcon,
        ImageIcon,
        EraserIcon,
        MenuIcon,
        ChevronDownIcon,
        LockIcon,
        UnlockIcon,
      ];

      icons.forEach((IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        
        // All icons should have these consistent attributes from IconBase
        expect(svg).toHaveAttribute('fill', 'none');
        expect(svg).toHaveAttribute('stroke-linecap', 'round');
        expect(svg).toHaveAttribute('stroke-linejoin', 'round');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      });
    });

    it('all icons have proper default dimensions', () => {
      const icons = [
        RectangleIcon,
        CircleIcon,
        ArrowIcon,
        LineIcon,
        PenIcon,
        TextIcon,
        HandIcon,
        SelectionIcon,
        DiamondIcon,
        ImageIcon,
        EraserIcon,
        MenuIcon,
        ChevronDownIcon,
        LockIcon,
        UnlockIcon,
      ];

      icons.forEach((IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        
        expect(svg).toHaveAttribute('width', '20');
        expect(svg).toHaveAttribute('height', '20');
      });
    });
  });

  describe('Icon Visual Content', () => {
    it('all icons have visual content (paths, shapes, etc.)', () => {
      const icons = [
        RectangleIcon,
        CircleIcon,
        ArrowIcon,
        LineIcon,
        PenIcon,
        TextIcon,
        HandIcon,
        SelectionIcon,
        DiamondIcon,
        ImageIcon,
        EraserIcon,
        MenuIcon,
        ChevronDownIcon,
        LockIcon,
        UnlockIcon,
      ];

      icons.forEach((IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        
        // Each icon should have at least one visual element
        const visualElements = container.querySelectorAll('path, rect, circle, line, polyline, polygon');
        expect(visualElements.length).toBeGreaterThan(0);
      });
    });

    it('icons render without errors or warnings', () => {
      const icons = [
        RectangleIcon,
        CircleIcon,
        ArrowIcon,
        LineIcon,
        PenIcon,
        TextIcon,
        HandIcon,
        SelectionIcon,
        DiamondIcon,
        ImageIcon,
        EraserIcon,
        MenuIcon,
        ChevronDownIcon,
        LockIcon,
        UnlockIcon,
      ];

      icons.forEach((IconComponent) => {
        expect(() => {
          render(<IconComponent />);
        }).not.toThrow();
      });
    });
  });
});