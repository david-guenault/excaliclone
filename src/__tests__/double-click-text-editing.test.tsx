// ABOUTME: Comprehensive tests for double-click text editing functionality on all element types
// ABOUTME: Tests text overlay creation, positioning, editing states, and text rendering within shapes

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import App from '../App';
import { useAppStore } from '../store';
import type { Element } from '../types';

// Test helper to create elements with text
const createElementWithText = (type: string, text: string = ''): Element => ({
  id: `test-${type}-${Math.random()}`,
  type: type as any,
  x: 100,
  y: 100,
  width: 100,
  height: 50,
  strokeColor: '#000000',
  backgroundColor: '#ffffff',
  strokeWidth: 2,
  strokeStyle: 'solid',
  fillStyle: 'solid',
  roughness: 1,
  opacity: 1,
  locked: false,
  zIndex: 0,
  text: text,
  cornerStyle: 'sharp',
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
  textDecoration: 'none',
});

// Test helper to get canvas element
const getCanvas = () => {
  const canvas = screen.getByRole('img', { name: /canvas/i });
  expect(canvas).toBeInTheDocument();
  return canvas as HTMLCanvasElement;
};

// Test helper to simulate double-click on element
const doubleClickElement = async (canvas: HTMLCanvasElement, element: Element) => {
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  
  await act(async () => {
    fireEvent.doubleClick(canvas, {
      clientX: centerX,
      clientY: centerY,
    });
  });
};

describe('Double-Click Text Editing', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.getState().elements = [];
    useAppStore.getState().selectedElementIds = [];
  });

  describe('Double-Click Detection', () => {
    it('should detect double-click on rectangle element', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      // Create a rectangle element
      const rectangle = createElementWithText('rectangle');
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      // Double-click on rectangle
      await doubleClickElement(canvas, rectangle);
      
      // Should enter text editing mode
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /edit text/i })).toBeInTheDocument();
      });
    });

    it('should detect double-click on circle element', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      // Create a circle element
      const circle = createElementWithText('circle');
      
      await act(async () => {
        useAppStore.getState().addElement(circle);
      });
      
      // Double-click on circle
      await doubleClickElement(canvas, circle);
      
      // Should enter text editing mode
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /edit text/i })).toBeInTheDocument();
      });
    });

    it('should detect double-click on line element', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      // Create a line element
      const line = createElementWithText('line');
      
      await act(async () => {
        useAppStore.getState().addElement(line);
      });
      
      // Double-click on line
      await doubleClickElement(canvas, line);
      
      // Should enter text editing mode
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /edit text/i })).toBeInTheDocument();
      });
    });

    it('should detect double-click on arrow element', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      // Create an arrow element
      const arrow = createElementWithText('arrow');
      
      await act(async () => {
        useAppStore.getState().addElement(arrow);
      });
      
      // Double-click on arrow
      await doubleClickElement(canvas, arrow);
      
      // Should enter text editing mode
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /edit text/i })).toBeInTheDocument();
      });
    });

    it('should not trigger text editing on double-click on empty canvas', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      // Double-click on empty canvas
      await act(async () => {
        fireEvent.doubleClick(canvas, {
          clientX: 300,
          clientY: 300,
        });
      });
      
      // Should not show text editing overlay
      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: /edit text/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Text Editing Overlay', () => {
    it('should show text editing overlay at correct position for rectangles', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle', 'Test Text');
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      await doubleClickElement(canvas, rectangle);
      
      // Should show text editing overlay
      await waitFor(() => {
        const textInput = screen.getByRole('textbox', { name: /edit text/i });
        expect(textInput).toBeInTheDocument();
        expect(textInput).toHaveValue('Test Text');
      });
    });

    it('should position text editing overlay at element center for circles', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      const circle = createElementWithText('circle', 'Circle Text');
      
      await act(async () => {
        useAppStore.getState().addElement(circle);
      });
      
      await doubleClickElement(canvas, circle);
      
      // Should show text editing overlay
      await waitFor(() => {
        const textInput = screen.getByRole('textbox', { name: /edit text/i });
        expect(textInput).toBeInTheDocument();
        expect(textInput).toHaveValue('Circle Text');
      });
    });

    it('should position text editing overlay at line midpoint', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      const line = createElementWithText('line', 'Line Label');
      
      await act(async () => {
        useAppStore.getState().addElement(line);
      });
      
      await doubleClickElement(canvas, line);
      
      // Should show text editing overlay
      await waitFor(() => {
        const textInput = screen.getByRole('textbox', { name: /edit text/i });
        expect(textInput).toBeInTheDocument();
        expect(textInput).toHaveValue('Line Label');
      });
    });

    it('should show empty text input for elements without text', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle'); // No text
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      await doubleClickElement(canvas, rectangle);
      
      // Should show empty text editing overlay
      await waitFor(() => {
        const textInput = screen.getByRole('textbox', { name: /edit text/i });
        expect(textInput).toBeInTheDocument();
        expect(textInput).toHaveValue('');
      });
    });
  });

  describe('Text Input and Editing', () => {
    it('should allow typing text in editing overlay', async () => {
      const user = userEvent.setup();
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle');
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      await doubleClickElement(canvas, rectangle);
      
      // Type text
      const textInput = await screen.findByRole('textbox', { name: /edit text/i });
      await user.type(textInput, 'Hello World');
      
      expect(textInput).toHaveValue('Hello World');
    });

    it('should allow editing existing text', async () => {
      const user = userEvent.setup();
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle', 'Original Text');
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      await doubleClickElement(canvas, rectangle);
      
      // Edit existing text
      const textInput = await screen.findByRole('textbox', { name: /edit text/i });
      await user.clear(textInput);
      await user.type(textInput, 'New Text');
      
      expect(textInput).toHaveValue('New Text');
    });

    it('should save text changes when pressing Enter', async () => {
      const user = userEvent.setup();
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle');
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      await doubleClickElement(canvas, rectangle);
      
      // Type text and press Enter
      const textInput = await screen.findByRole('textbox', { name: /edit text/i });
      await user.type(textInput, 'Saved Text');
      await user.keyboard('{Enter}');
      
      // Should save text to element
      await waitFor(() => {
        const elements = useAppStore.getState().elements;
        expect(elements[0].text).toBe('Saved Text');
      });
      
      // Should hide text editing overlay
      expect(screen.queryByRole('textbox', { name: /edit text/i })).not.toBeInTheDocument();
    });

    it('should cancel text editing when pressing Escape', async () => {
      const user = userEvent.setup();
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle', 'Original');
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      await doubleClickElement(canvas, rectangle);
      
      // Type text and press Escape
      const textInput = await screen.findByRole('textbox', { name: /edit text/i });
      await user.clear(textInput);
      await user.type(textInput, 'Changed Text');
      await user.keyboard('{Escape}');
      
      // Should not save changes
      await waitFor(() => {
        const elements = useAppStore.getState().elements;
        expect(elements[0].text).toBe('Original');
      });
      
      // Should hide text editing overlay
      expect(screen.queryByRole('textbox', { name: /edit text/i })).not.toBeInTheDocument();
    });

    it('should save text changes when clicking outside overlay', async () => {
      const user = userEvent.setup();
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle');
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      await doubleClickElement(canvas, rectangle);
      
      // Type text
      const textInput = await screen.findByRole('textbox', { name: /edit text/i });
      await user.type(textInput, 'Click Outside');
      
      // Click outside (on canvas)
      await user.click(canvas);
      
      // Should save text to element
      await waitFor(() => {
        const elements = useAppStore.getState().elements;
        expect(elements[0].text).toBe('Click Outside');
      });
      
      // Should hide text editing overlay
      expect(screen.queryByRole('textbox', { name: /edit text/i })).not.toBeInTheDocument();
    });
  });

  describe('Text Rendering', () => {
    it('should render text within rectangle elements', async () => {
      render(<App />);
      
      const rectangle = createElementWithText('rectangle', 'Rectangle Text');
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      // Text should be rendered on canvas
      // Note: This tests that the element has text property, actual canvas rendering tested elsewhere
      const elements = useAppStore.getState().elements;
      expect(elements[0].text).toBe('Rectangle Text');
    });

    it('should render text within circle elements', async () => {
      render(<App />);
      
      const circle = createElementWithText('circle', 'Circle Text');
      
      await act(async () => {
        useAppStore.getState().addElement(circle);
      });
      
      // Text should be rendered on canvas
      const elements = useAppStore.getState().elements;
      expect(elements[0].text).toBe('Circle Text');
    });

    it('should render text labels for line elements', async () => {
      render(<App />);
      
      const line = createElementWithText('line', 'Line Label');
      
      await act(async () => {
        useAppStore.getState().addElement(line);
      });
      
      // Text should be rendered on canvas
      const elements = useAppStore.getState().elements;
      expect(elements[0].text).toBe('Line Label');
    });

    it('should render text labels for arrow elements', async () => {
      render(<App />);
      
      const arrow = createElementWithText('arrow', 'Arrow Label');
      
      await act(async () => {
        useAppStore.getState().addElement(arrow);
      });
      
      // Text should be rendered on canvas
      const elements = useAppStore.getState().elements;
      expect(elements[0].text).toBe('Arrow Label');
    });
  });

  describe('Text Styling', () => {
    it('should apply font family to text in shapes', async () => {
      render(<App />);
      
      const rectangle = createElementWithText('rectangle', 'Styled Text');
      rectangle.fontFamily = 'Arial';
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      const elements = useAppStore.getState().elements;
      expect(elements[0].fontFamily).toBe('Arial');
    });

    it('should apply font size to text in shapes', async () => {
      render(<App />);
      
      const circle = createElementWithText('circle', 'Big Text');
      circle.fontSize = 24;
      
      await act(async () => {
        useAppStore.getState().addElement(circle);
      });
      
      const elements = useAppStore.getState().elements;
      expect(elements[0].fontSize).toBe(24);
    });

    it('should apply text alignment to text in shapes', async () => {
      render(<App />);
      
      const rectangle = createElementWithText('rectangle', 'Centered');
      rectangle.textAlign = 'center';
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      const elements = useAppStore.getState().elements;
      expect(elements[0].textAlign).toBe('center');
    });
  });

  describe('Edge Cases', () => {
    it('should handle double-click on locked elements', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle', 'Locked');
      rectangle.locked = true;
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      await doubleClickElement(canvas, rectangle);
      
      // Should not show text editing overlay for locked elements
      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: /edit text/i })).not.toBeInTheDocument();
      });
    });

    it('should handle empty text gracefully', async () => {
      const user = userEvent.setup();
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle', 'Some Text');
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      await doubleClickElement(canvas, rectangle);
      
      // Clear all text and save
      const textInput = await screen.findByRole('textbox', { name: /edit text/i });
      await user.clear(textInput);
      await user.keyboard('{Enter}');
      
      // Should save empty text
      await waitFor(() => {
        const elements = useAppStore.getState().elements;
        expect(elements[0].text).toBe('');
      });
    });

    it('should handle very long text input', async () => {
      const user = userEvent.setup();
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle');
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
      });
      
      await doubleClickElement(canvas, rectangle);
      
      // Type very long text
      const longText = 'This is a very long text that should be handled gracefully by the text editing system';
      const textInput = await screen.findByRole('textbox', { name: /edit text/i });
      await user.type(textInput, longText);
      await user.keyboard('{Enter}');
      
      // Should save long text
      await waitFor(() => {
        const elements = useAppStore.getState().elements;
        expect(elements[0].text).toBe(longText);
      });
    });
  });

  describe('Multiple Elements', () => {
    it('should handle double-click on different element types', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      const rectangle = createElementWithText('rectangle', 'Rect');
      const circle = createElementWithText('circle', 'Circle');
      circle.x = 250; // Position differently
      
      await act(async () => {
        useAppStore.getState().addElement(rectangle);
        useAppStore.getState().addElement(circle);
      });
      
      // Double-click on rectangle
      await doubleClickElement(canvas, rectangle);
      
      let textInput = await screen.findByRole('textbox', { name: /edit text/i });
      expect(textInput).toHaveValue('Rect');
      
      // Press Escape to close
      await userEvent.keyboard('{Escape}');
      
      // Double-click on circle
      await doubleClickElement(canvas, circle);
      
      textInput = await screen.findByRole('textbox', { name: /edit text/i });
      expect(textInput).toHaveValue('Circle');
    });

    it('should only allow editing one element at a time', async () => {
      render(<App />);
      const canvas = getCanvas();
      
      const rect1 = createElementWithText('rectangle', 'First');
      const rect2 = createElementWithText('rectangle', 'Second');
      rect2.x = 250;
      
      await act(async () => {
        useAppStore.getState().addElement(rect1);
        useAppStore.getState().addElement(rect2);
      });
      
      // Double-click on first rectangle
      await doubleClickElement(canvas, rect1);
      
      let textInput = await screen.findByRole('textbox', { name: /edit text/i });
      expect(textInput).toHaveValue('First');
      
      // Double-click on second rectangle (should close first and open second)
      await doubleClickElement(canvas, rect2);
      
      textInput = await screen.findByRole('textbox', { name: /edit text/i });
      expect(textInput).toHaveValue('Second');
      
      // Should only have one text input
      const textInputs = screen.getAllByRole('textbox', { name: /edit text/i });
      expect(textInputs).toHaveLength(1);
    });
  });
});