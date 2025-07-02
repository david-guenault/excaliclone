// ABOUTME: Tests for enhanced stroke styles (line caps and joins) functionality
// ABOUTME: Verifies proper integration of LineCap and LineJoin properties in drawing tools

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';

describe('Enhanced Stroke Styles', () => {
  beforeEach(() => {
    act(() => {
      const store = useAppStore.getState();
      store.clearSelection();
      // Reset elements array
      useAppStore.setState({ elements: [], selectedElementIds: [] });
    });
  });

  describe('Line Cap Controls', () => {
    it('should show line cap controls when line element is selected', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Switch to line tool and draw a line
      await act(async () => {
        await user.keyboard('l');
      });

      // Draw a line
      const canvas = screen.getByRole('img', { name: /drawing canvas/i });
      await act(async () => {
        await user.pointer([
          { keys: '[MouseLeft>]', target: canvas, coords: { x: 100, y: 100 } },
          { coords: { x: 200, y: 200 } },
          { keys: '[/MouseLeft]' }
        ]);
      });

      // Properties panel should appear with line cap controls
      expect(screen.getByText('Terminaisons de ligne')).toBeInTheDocument();
      expect(screen.getByTitle('Butt')).toBeInTheDocument();
      expect(screen.getByTitle('Round')).toBeInTheDocument();
      expect(screen.getByTitle('Square')).toBeInTheDocument();
    });

    it('should update line cap property when clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Draw a line
      await act(async () => {
        await user.keyboard('l');
      });
      
      const canvas = screen.getByRole('img', { name: /drawing canvas/i });
      await act(async () => {
        await user.pointer([
          { keys: '[MouseLeft>]', target: canvas, coords: { x: 100, y: 100 } },
          { coords: { x: 200, y: 200 } },
          { keys: '[/MouseLeft]' }
        ]);
      });

      // Click square line cap
      const squareCapButton = screen.getByTitle('Square');
      await act(async () => {
        await user.click(squareCapButton);
      });

      // Verify the element was updated
      const elements = useAppStore.getState().elements;
      expect(elements).toHaveLength(1);
      expect(elements[0].lineCap).toBe('square');
    });
  });

  describe('Line Join Controls', () => {
    it('should show line join controls when pen element is selected', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Switch to pen tool and draw
      await act(async () => {
        await user.keyboard('p');
      });

      // Draw a pen stroke
      const canvas = screen.getByRole('img', { name: /drawing canvas/i });
      await act(async () => {
        await user.pointer([
          { keys: '[MouseLeft>]', target: canvas, coords: { x: 100, y: 100 } },
          { coords: { x: 150, y: 120 } },
          { coords: { x: 200, y: 100 } },
          { keys: '[/MouseLeft]' }
        ]);
      });

      // Properties panel should appear with line join controls
      expect(screen.getByText('Jonctions de ligne')).toBeInTheDocument();
      expect(screen.getByTitle('Miter')).toBeInTheDocument();
      expect(screen.getByTitle('Round')).toBeInTheDocument();
      expect(screen.getByTitle('Bevel')).toBeInTheDocument();
    });

    it('should update line join property when clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Draw a pen stroke
      await act(async () => {
        await user.keyboard('p');
      });
      
      const canvas = screen.getByRole('img', { name: /drawing canvas/i });
      await act(async () => {
        await user.pointer([
          { keys: '[MouseLeft>]', target: canvas, coords: { x: 100, y: 100 } },
          { coords: { x: 150, y: 120 } },
          { coords: { x: 200, y: 100 } },
          { keys: '[/MouseLeft]' }
        ]);
      });

      // Click bevel line join
      const bevelJoinButton = screen.getByTitle('Bevel');
      await act(async () => {
        await user.click(bevelJoinButton);
      });

      // Verify the element was updated
      const elements = useAppStore.getState().elements;
      expect(elements).toHaveLength(1);
      expect(elements[0].lineJoin).toBe('bevel');
    });
  });

  describe('Arrow Elements', () => {
    it('should show stroke style controls for arrow elements', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Switch to arrow tool and draw
      await act(async () => {
        await user.keyboard('a');
      });

      const canvas = screen.getByRole('img', { name: /drawing canvas/i });
      await act(async () => {
        await user.pointer([
          { keys: '[MouseLeft>]', target: canvas, coords: { x: 100, y: 100 } },
          { coords: { x: 200, y: 200 } },
          { keys: '[/MouseLeft]' }
        ]);
      });

      // Should show both line cap and line join controls
      expect(screen.getByText('Terminaisons de ligne')).toBeInTheDocument();
      expect(screen.getByText('Jonctions de ligne')).toBeInTheDocument();
    });
  });

  describe('Contextual Display', () => {
    it('should not show stroke style controls for rectangle elements', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Draw a rectangle
      await act(async () => {
        await user.keyboard('r');
      });
      
      const canvas = screen.getByRole('img', { name: /drawing canvas/i });
      await act(async () => {
        await user.pointer([
          { keys: '[MouseLeft>]', target: canvas, coords: { x: 100, y: 100 } },
          { coords: { x: 200, y: 200 } },
          { keys: '[/MouseLeft]' }
        ]);
      });

      // Should not show line cap or line join controls
      expect(screen.queryByText('Terminaisons de ligne')).not.toBeInTheDocument();
      expect(screen.queryByText('Jonctions de ligne')).not.toBeInTheDocument();
    });

    it('should show stroke style controls for multiple line-based elements', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Draw a line
      await act(async () => {
        await user.keyboard('l');
      });
      
      const canvas = screen.getByRole('img', { name: /drawing canvas/i });
      await act(async () => {
        await user.pointer([
          { keys: '[MouseLeft>]', target: canvas, coords: { x: 100, y: 100 } },
          { coords: { x: 200, y: 200 } },
          { keys: '[/MouseLeft]' }
        ]);
      });

      // Draw an arrow
      await act(async () => {
        await user.keyboard('a');
      });
      
      await act(async () => {
        await user.pointer([
          { keys: '[MouseLeft>]', target: canvas, coords: { x: 300, y: 100 } },
          { coords: { x: 400, y: 200 } },
          { keys: '[/MouseLeft]' }
        ]);
      });

      // Select both elements
      await act(async () => {
        await user.keyboard('s'); // Switch to selection tool
      });

      await act(async () => {
        await user.pointer([
          { keys: '[MouseLeft>]', target: canvas, coords: { x: 50, y: 50 } },
          { coords: { x: 450, y: 250 } },
          { keys: '[/MouseLeft]' }
        ]);
      });

      // Should show stroke style controls for multiple selection
      expect(screen.getByText('Terminaisons de ligne')).toBeInTheDocument();
      expect(screen.getByText('Jonctions de ligne')).toBeInTheDocument();
    });
  });

  describe('Default Values', () => {
    it('should use default line cap and join values for new elements', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Draw a line
      await act(async () => {
        await user.keyboard('l');
      });
      
      const canvas = screen.getByRole('img', { name: /drawing canvas/i });
      await act(async () => {
        await user.pointer([
          { keys: '[MouseLeft>]', target: canvas, coords: { x: 100, y: 100 } },
          { coords: { x: 200, y: 200 } },
          { keys: '[/MouseLeft]' }
        ]);
      });

      // Verify default values
      const elements = useAppStore.getState().elements;
      expect(elements).toHaveLength(1);
      expect(elements[0].lineCap).toBe('round'); // Default from constants
      expect(elements[0].lineJoin).toBe('round'); // Default from constants
    });
  });
});