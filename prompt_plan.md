# Excalibox Development Prompt Plan

Based on the technical specification, this plan breaks down development into implementable prompts following the phased approach with optimized dependencies and sizing.

## Phase 1: Core Drawing Tools (MVP)

### 1. Keyboard Shortcuts Foundation ✅
**Status**: Completed  
**Description**: Core keyboard shortcut system implemented and tested.
- ✅ Tool switching with letter keys (S, R, C, L, A, P, T)
- ✅ Standard editing shortcuts (Ctrl+Z/Y, Ctrl+C/V, Delete)
- ✅ Canvas navigation (Space+drag pan, Ctrl+scroll zoom)
- ✅ Modifier key handling (Shift, Alt) for constrained drawing
- ✅ KeyboardManager class with conflict prevention
- ✅ Comprehensive tests (28 tests passing)
- ✅ Integrated with App component and store actions
- ✅ Input focus handling to prevent editor conflicts

### 2. UI Layout Restructure ✅
**Status**: Completed  
**Description**: New layout structure implemented according to updated specifications.
- ✅ Remove application header to maximize canvas space
- ✅ Restructure App.tsx to new layout without header
- ✅ Create TopToolbar component for horizontal tool palette
- ✅ Implement conditional PropertiesPanel component (left side)
- ✅ Add UIState management to store for panel visibility
- ✅ Implement smooth slide animations for properties panel
- ✅ Update Canvas component to accommodate new layout
- ✅ Add responsive behavior for different screen sizes
- ✅ Comprehensive tests for new UI components and interactions
- ✅ Element selection shows properties panel automatically
- ✅ Panel resizing functionality with handle

### 3. Rough.js Integration ✅
**Status**: Completed + Enhanced  
**Description**: Complete Rough.js integration with fine-grained roughness control.
- ✅ Install and configure Rough.js library (v4.6.6)
- ✅ Update CanvasRenderer to use Rough.js for ALL shapes (rectangles, circles, lines, arrows, pen)
- ✅ **ENHANCED**: Complete stroke and fill rendering with Rough.js (eliminated hybrid Canvas native approach)
- ✅ **ENHANCED**: Fine-grained roughness slider control (0.0 to 3.0 range, step 0.1)
- ✅ **ENHANCED**: Real-time roughness value display with immediate visual feedback
- ✅ **ENHANCED**: Consistent hand-drawn aesthetic across all element types
- ✅ **ENHANCED**: Proper stroke style support (solid, dashed, dotted) within Rough.js rendering
- ✅ **FIXED**: Pen drawing coordinate system alignment and visibility
- ✅ Ensure performance with Rough.js rendering (shape caching with Map, LRU eviction)
- ✅ Add tests for Rough.js integration (9 comprehensive tests covering all shapes and caching)

### 4. Modern Toolbar Redesign ✅
**Status**: Completed  
**Description**: Redesign toolbar to match Excalidraw's modern icon-based design.
- ✅ Replace text-based toolbar with icon-based design
- ✅ Implement floating toolbar with rounded corners and shadows
- ✅ Add SVG icons for all tools (lock, hand, selection, shapes, etc.)
- ✅ Create icon components with consistent sizing and styling (IconBase system)
- ✅ Add new tools: Lock, Hand, Diamond, Image, Eraser
- ✅ Implement hover states and active tool highlighting
- ✅ Add keyboard shortcut tooltips on hover
- ✅ Update toolbar CSS for modern Excalidraw-style appearance
- ✅ Ensure responsive design and accessibility
- ✅ Add comprehensive tests for new toolbar functionality (23 tests covering all features)

### 5. Basic Color Palette ✅
**Status**: Completed  
**Description**: Implement Excalidraw-compatible color system in new properties panel.
- ✅ Research and implement Excalidraw color palette (Open Colors system)
- ✅ Add color selection to properties panel UI (ColorPalette component)
- ✅ Update toolOptions with proper color management (store actions)
- ✅ Apply colors to existing rectangle and circle tools (via toolOptions)
- ✅ Add recent colors functionality (localStorage persistence)
- ✅ Basic color picker for custom colors (hex input with validation)
- ✅ Color persistence and state management (Zustand store integration)
- ✅ Integrate with conditional properties panel visibility
- ✅ Add comprehensive tests for color palette (24 tests covering all features)

### 6. Grid System and Snapping ✅
**Status**: Completed  
**Description**: Implemented comprehensive grid system with snap functionality for precision drawing.
- ✅ Add configurable grid system with size controls (5-100px range)
- ✅ Visual grid rendering on canvas background with viewport optimization
- ✅ Implement snap-to-grid functionality with distance thresholds
- ✅ Grid toggle and size configuration controls (GridControls component)
- ✅ Snap distance configuration and visual indicators (presets: Fine, Normal, Coarse, Large)
- ✅ Grid state persistence via Zustand store integration
- ✅ Grid keyboard shortcut (G key) for quick toggle
- ✅ Comprehensive tests for grid utilities, controls, and store (90 tests)

### 7. Properties Panel Redesign ✅
**Status**: Completed  
**Description**: Complete redesign of properties panel based on design_examples/properties1.png + properties2.png.
- ✅ Implement fixed 200px width panel with new visual design
- ✅ Create dual color palette system (Trait + Arrière-plan)
- ✅ Add fill pattern controls (hachure, cross-hatch, solid)
- ✅ Implement stroke width presets with visual previews
- ✅ Add stroke style options (solid, dashed, dotted)
- ✅ Create roughness controls with wavy line previews
- ✅ Add contextual corner style controls for rectangles
- ✅ Implement typography section for text elements (font tools, size, alignment)
- ✅ Add opacity slider with 0-100 range and purple accent
- ✅ Create layer management controls (send back/forward, bring to front/back)
- ✅ Implement action buttons (duplicate, delete, lock/unlock, link)
- ✅ Use mixed interactions (presets + opacity slider)
- ✅ Apply purple accent color for current selections
- ✅ Integrate with existing element update system
- ✅ Add comprehensive type system (StrokeStyle, FillStyle, CornerStyle, etc.)
- ✅ Implement homogeneous sizing and spacing standards
- ✅ Create monochrome icon system with consistent styling

**SPECIFICATION UPDATES COMPLETED** ✅
All properties panel specification updates have been successfully implemented:
- ✅ **Panel Positioning**: Updated margins to 16px from left AND bottom screen edges (not flush)
- ✅ **Absolute Positioning**: Changed to absolute overlay positioning preventing canvas displacement
- ✅ **No Canvas Displacement**: Panel opening doesn't shift or resize the main diagram area
- ✅ **Color Palette Layout**: Redesigned both Trait and Arrière-plan to single horizontal rows
- ✅ **Uniform Element Sizing**: All 6 elements per palette are identical 24px × 24px squares
- ✅ **Last Color Element**: 6th element in each palette shows current selection + opens color picker
- ✅ **Z-Index Management**: Implemented proper layering to appear above canvas without affecting layout
- ✅ **Implementation Impact**: Updated PropertiesPanel.tsx, created SimpleColorPalette, and refactored CSS

### 8. Line Drawing Tool ✅
**Status**: Completed  
**Description**: Implemented line tool (L key) for drawing straight lines.
- ✅ Added line tool type and constants with LINE_CONFIG
- ✅ Implemented line drawing with click-drag-release interaction
- ✅ Added angle snapping (45-degree increments with Shift modifier)
- ✅ Updated CanvasRenderer for line rendering with Rough.js
- ✅ Handled line drawing interaction with mouse events
- ✅ Added visual feedback during line drawing (real-time updates)
- ✅ Integrated with grid snapping and keyboard shortcuts
- ✅ Added support for stroke styles (solid, dashed, dotted)
- ✅ Created comprehensive tests (7 tests, core functionality verified)

### 9. Arrow Drawing Tool ✅
**Status**: Completed  
**Description**: Implement arrow tool (A key) building on line tool foundation.
- ✅ Add arrow element type with arrowhead properties
- ✅ Implement arrow drawing similar to line tool
- ✅ Update CanvasRenderer with arrow rendering (main line + arrowhead)
- ✅ Basic triangle arrowhead style plus line and dot styles
- ✅ Support for arrow styling with current color system
- ✅ Arrow-specific interaction handling and keyboard shortcuts
- ✅ Comprehensive testing for arrow functionality

### 10. **CRITICAL BUG FIXES** ✅
**Status**: Completed  
**Description**: Fixed critical drawing and selection bugs discovered in user testing.

#### **Bug 1: Fixed-Size Drawing Tools** ✅
- ✅ **Problem**: Rectangle and circle tools create fixed-size elements instead of drag-to-size
- ✅ **Expected**: Click+drag should create elements sized to the drag distance
- ✅ **Fix Implemented**: Drag-to-size functionality for rectangle and circle tools
- ✅ **Impact Resolved**: Users can now create elements of desired size with proper drag operations

#### **Bug 2: Selection Visibility Issues** ✅
- ✅ **Problem**: When selecting elements, forms appear to disappear 
- ✅ **Expected**: Selected elements should remain visible with selection indicators
- ✅ **Fix Implemented**: Proper rendering of selected elements with blue dashed borders and resize handles
- ✅ **Impact Resolved**: Users can clearly see selected elements with visual feedback

#### **Bug 3: Missing Multi-Selection** ✅
- ✅ **Problem**: No drag-selection rectangle for selecting multiple elements
- ✅ **Expected**: Click+drag on empty space should create selection rectangle
- ✅ **Fix Implemented**: Drag-selection rectangle functionality with light blue visual feedback
- ✅ **Impact Resolved**: Users can efficiently select multiple elements with drag rectangle

**Implementation Completed:**
1. ✅ Fixed drag-to-size for shapes (rectangle, circle) with real-time updates
2. ✅ Fixed selection visual feedback with blue selection indicators and resize handles  
3. ✅ Implemented drag-selection rectangle with intersection detection
4. ✅ Added comprehensive tests for all selection behaviors (39 tests passing)
5. ✅ **ZOOM ENHANCEMENTS**: Cursor-centered zoom functionality for precise viewport control
6. ✅ **SELECTION SCALING**: Fixed selection indicators to scale properly with zoom level
7. ✅ **COORDINATE FIXES**: Resolved alignment issues after zoom/dezoom operations
8. ✅ **VIEWPORT TRANSFORMATIONS**: Consistent world-to-screen coordinate conversion
9. ✅ **TEXT DRAGGING FIX**: Corrected text element dragging to use world coordinates

### 11. Properties Panel Specification Updates ✅
**Status**: Completed  
**Description**: Updated properties panel implementation to match revised specifications.
- ✅ **Absolute Overlay Positioning**: Converted to absolute positioning to prevent canvas displacement
- ✅ **No Canvas Shift**: Main diagram area maintains full size and position when panel opens
- ✅ **Panel Margins**: Panel positioned 16px from left edge AND 16px from bottom edge (not flush)
- ✅ **Z-Index Management**: Implemented proper layering (z-index: 1000) to appear above canvas without affecting layout
- ✅ **Color Palette Redesign**: Restructured Trait and Arrière-plan to single horizontal rows
- ✅ **Uniform Sizing**: All 6 palette elements are identical 24px × 24px squares
- ✅ **Last Color Element**: Implemented 6th element showing current color + color picker access
- ✅ **Component Updates**: Created SimpleColorPalette component and updated PropertiesPanel.tsx
- ✅ **CSS Positioning**: Complete CSS refactor for absolute overlay positioning with rounded corners
- ✅ **State Management**: Updated color selection logic with custom color picker functionality
- ✅ **Canvas Preservation**: Fixed canvas displacement issue by removing marginLeft and width adjustments in App.tsx
- ✅ **True Overlay**: Panel now functions as pure overlay without affecting main layout
- ✅ **Visual Consistency**: All elements maintain uniform appearance and spacing
- ✅ **Testing**: Created comprehensive tests for SimpleColorPalette component (10 tests)

### 12. Pen/Freehand Drawing Tool ✅
**Status**: Completed  
**Description**: Implement pen tool (P key) for freehand drawing.
- ✅ Add pen tool to types and constants
- ✅ Implement pen drawing with point array collection
- ✅ Update CanvasRenderer to handle pen elements with hybrid rendering
- ✅ Advanced point collection during mouse drag with real-time updates
- ✅ Smooth curve rendering with Canvas native API for better stroke style support
- ✅ Integration with existing event handling and styling
- ✅ Comprehensive tests for pen functionality
- ✅ **ENHANCED**: Precise hit testing using point-to-line distance calculations
- ✅ **ENHANCED**: Hybrid rendering (Rough.js fills + Canvas native strokes) for all shapes
- ✅ **ENHANCED**: Complete stroke style support (solid/dashed/dotted) for rectangles, circles, and pen strokes
- ✅ **ENHANCED**: Proper selection indicators and resize handles for pen strokes
- ✅ **ENHANCED**: Fixed transparent fill rendering to be truly transparent
- ✅ **ENHANCED**: Optimized shape cache with fill properties for immediate visual updates

### 13. Text Tool Implementation ✅
**Status**: Completed  
**Description**: Complete text tool implementation with direct canvas editing.
- ✅ Add text tool for creating text elements (T key activation)
- ✅ Implement direct canvas text editing with real-time rendering
- ✅ Advanced text styling controls (font family dropdown, B/I/U buttons)
- ✅ Text positioning and comprehensive alignment options (left, center, right)
- ✅ Font family selection with 6 options (Inter, Arial, Helvetica, Times, Courier, Georgia)
- ✅ Font size controls (S/M/L/XL presets: 12px, 16px, 24px, 32px)
- ✅ Font weight and style toggles (Bold, Italic, Underline)
- ✅ Text decoration support (underline) with proper rendering
- ✅ Text alignment with visual arrow indicators
- ✅ Cursor-based editing with blinking cursor visualization
- ✅ Keyboard navigation (arrow keys, backspace, delete, enter)
- ✅ Auto-sizing text elements based on content
- ✅ Selection support for text elements with proper bounding boxes
- ✅ Text element dragging with consistent coordinate system
- ✅ Empty text element removal on completion
- ✅ Canvas-based text rendering with font styling
- ✅ Properties panel integration with contextual font controls
- ✅ Reorganized font controls (dropdown + grouped B/I/U buttons)
- ✅ Text tool integration with keyboard shortcuts and escape handling
- ✅ Comprehensive text tool functionality and interaction tests
- ✅ Fixed text element dragging coordinate system issues

### 13.5. **CRITICAL BUG FIXES: Overlapping Selection + Rough.js Enhancement** ✅
**Status**: Completed  
**Description**: Fixed critical selection and rendering issues, plus enhanced Rough.js integration.

#### **Selection Bug Fix** ✅
- ✅ **Problem Identified**: Selection algorithm used `elements.find()` which selected first (oldest/back) element in overlapping scenarios
- ✅ **Root Cause**: Hit detection searched array from beginning, finding back elements instead of front elements
- ✅ **Solution Implemented**: Modified selection logic to search from front-to-back (newest to oldest)
- ✅ **Algorithm Enhancement**: Added `.filter()` to skip locked elements, `.slice()` to prevent array mutation, `.reverse()` for front-to-back search
- ✅ **File Location**: `src/App.tsx:502-507` - Enhanced `handleCanvasMouseDown` function
- ✅ **Locked Element Support**: Locked elements are properly excluded from selection, allowing access to elements behind them
- ✅ **Z-Index Awareness**: Selection now respects visual layering order with front elements having selection priority

#### **Rough.js Enhancement** ✅
- ✅ **Problem Identified**: Shapes used hybrid rendering (Rough.js fill + Canvas native stroke) killing hand-drawn effects
- ✅ **Root Cause**: rectangles and circles rendered strokes with native Canvas instead of Rough.js
- ✅ **Solution Implemented**: Complete Rough.js rendering for both stroke AND fill on all shapes
- ✅ **Enhanced Control**: Fine-grained roughness slider (0.0-3.0, step 0.1) replacing limited presets
- ✅ **Coordinate Fix**: Pen drawing visibility restored with proper element positioning
- ✅ **File Location**: `src/components/Canvas/CanvasRenderer.ts` - Complete drawRectangle/drawCircle/drawPen overhaul
- ✅ **Consistent Aesthetic**: All shapes now have authentic hand-drawn appearance

#### **Test Coverage & Documentation** ✅
- ✅ **Test Coverage**: Added comprehensive overlapping selection tests (`src/__tests__/overlapping-selection.test.tsx`)
- ✅ **Test Suite**: 4 new tests covering overlapping scenarios, locked element exclusion, and multiple overlapping elements
- ✅ **Specification Update**: Updated `spec.md` with new selection behavior and enhanced Rough.js documentation
- ✅ **No Regressions**: All fixes implemented without breaking existing functionality or test suite
- ✅ **User Experience**: Users now have proper front-element selection AND authentic hand-drawn styling

### 14. Enhanced Stroke Styles ✅
**Status**: Completed  
**Description**: Complete stroke style system with line caps and joins.
- ✅ Add stroke style options (solid, dashed, dotted)
- ✅ Implement line caps and joins (round, square, butt, miter, bevel)
- ✅ Update all drawing tools to use stroke styles
- ✅ Stroke style controls in properties panel (contextual for lines/arrows/pen)
- ✅ Apply stroke styles with hybrid Rough.js + Canvas native rendering
- ✅ Style persistence and state management
- ✅ Tests for stroke style combinations (8 tests with core functionality verified)

### 14.5. Enhanced Color Palettes + Advanced Color Picker ✅
**Status**: Completed  
**Description**: Revamp color system with new palettes and advanced picker interface.

#### **Color Palette Updates** ✅
- ✅ Update stroke color palette: noir #000000, rouge #e03131, vert #2f9e44, bleu #1971c2, orange #f08c00
- ✅ Update background color palette: transparent, rouge clair #ffc9c9, vert clair #b2f2bb, bleu clair #a5d8ff, jaune clair #ffec99
- ✅ Update PANEL_STROKE_COLORS and PANEL_BACKGROUND_COLORS constants
- ✅ Verify color contrast and accessibility compliance

#### **Advanced Color Picker Implementation** ✅
- ✅ Create AdvancedColorPicker component based on design_examples/COLOR_PICKER_PERSONALISE.png
- ✅ **Section 1**: Frequently used colors grid (2×3, 16px squares) with usage tracking
- ✅ **Section 2**: Main color palette grid (5×5, 20px squares) organized by hue families  
- ✅ **Section 3**: Nuances section with 5 variations (light to dark) of selected hue family
- ✅ **Section 4**: Hex code input with real-time validation and preview
- ✅ Modal overlay design (240px × 360px) with clean white background
- ✅ Keyboard shortcuts for main palette colors (q, w, e, r, t, etc.)
- ✅ Click outside to close, Escape key to cancel

#### **Integration** ✅
- ✅ Replace SimpleColorPalette 6th element interaction with AdvancedColorPicker
- ✅ Maintain existing preset color functionality
- ✅ Add color usage tracking and persistence (localStorage integration)
- ✅ Update color selection logic in properties panel
- ✅ Ensure consistent behavior for both stroke and background color selection

#### **Testing** ✅
- ✅ Test color palette updates and visual consistency
- ✅ Test advanced color picker modal interactions
- ✅ Test frequently used colors tracking
- ✅ Test hex input validation and color preview
- ✅ Test keyboard shortcuts for color selection
- ✅ Test accessibility and color contrast compliance

### 14.6. Advanced Arrowhead System ✅
**Status**: Completed (Simplified Implementation)  
**Description**: Comprehensive arrowhead system with 4 types and intuitive UI - simplified without line caps/joins.

#### **Arrowhead Types Implementation** ✅
- ✅ Added ArrowheadType enum: 'none', 'triangle', 'line', 'circle'
- ✅ Extended Element interface with startArrowhead and endArrowhead properties
- ✅ Updated arrow and line element types with arrowhead support
- ✅ Default values: arrows (none → triangle), lines (none → none)
- ✅ Added ARROWHEAD_CONFIG constants for size and angle

#### **Properties Panel Integration** ✅
- ✅ Added "Extrémités" section after stroke style controls
- ✅ Simplified layout with integrated preset buttons (not dropdowns)
- ✅ Two groups: "Début" and "Fin" with 4 buttons each
- ✅ Visual previews for each arrowhead type (○, ▷, ⊢, ●)
- ✅ Contextual display: only for arrow and line elements
- ✅ Harmonized visual design with existing Properties Panel style

#### **Canvas Rendering Enhancement** ✅
- ✅ Updated CanvasRenderer drawArrow() and drawLine() methods
- ✅ Implemented geometric calculation for triangle arrowheads
- ✅ Added perpendicular line rendering for line arrowheads  
- ✅ Circle arrowhead rendering at line endpoints
- ✅ Inherit stroke color and style from parent element
- ✅ Proportional sizing based on strokeWidth with ARROWHEAD_CONFIG

#### **Backward Compatibility** ✅
- ✅ Fixed property naming from endArrowHead to endArrowhead
- ✅ Updated App.tsx to use new property names and default values
- ✅ Handle legacy elements without arrowhead properties
- ✅ Preserved existing arrow functionality during transition

#### **Simplification Changes** ✅
- ✅ **Removed**: Line caps and line joins options per user feedback
- ✅ **Simplified**: Direct preset buttons instead of dropdown menus
- ✅ **Harmonized**: Visual consistency with Properties Panel design
- ✅ **Focused**: Clean 4-type arrowhead system without complexity
- ✅ **Integrated**: Seamless Properties Panel integration

### 15. Fill Patterns and Advanced Styling ✅
**Status**: Completed  
**Description**: Complete fill pattern system with 3 patterns as per specifications.
- ✅ Add fill options (solid, hachure, cross-hatch patterns only)
- ✅ Updated FILL_PATTERNS constants to match specs exactly
- ✅ Fixed FillStyle type to only include valid patterns
- ✅ Updated all references from 'transparent' fillStyle to 'solid'
- ✅ Fill style controls in properties panel (3-button preset system)
- ✅ Rough.js integration with fill patterns for consistent rendering
- ✅ Updated CanvasRenderer logic for proper fill application
- ✅ Fixed all TypeScript errors related to fillStyle changes
- ✅ Updated all test files to use valid fillStyle values
- ✅ **SPECIFICATION COMPLIANCE**: Removed extra patterns (dots, zigzag, transparent)
- ✅ **VISUAL ICONS**: Proper pattern previews (█ ▦ ▩) in Properties Panel
- ✅ **TYPE SAFETY**: Complete TypeScript compliance with new FillStyle type

### 15.5. Bottom-Left Zoom Control ✅
**Status**: Completed  
**Description**: Implemented bottom-left zoom control UI component based on design_examples/zoom-control-bot-left.png.
- ✅ Added ZoomControl component with horizontal layout (− | 125% | +)
- ✅ Positioned absolutely in bottom-left corner (16px margins from edges)
- ✅ Implemented zoom out button (−) with 10% decrement steps
- ✅ Added real-time zoom percentage display (e.g., "125%")
- ✅ Implemented zoom in button (+) with 10% increment steps
- ✅ Connected to existing viewport zoom system (10% to 500% range)
- ✅ Added button disabled states at min/max zoom levels
- ✅ Integrated with Ctrl+Scroll zoom functionality
- ✅ Maintained cursor-centered zoom behavior
- ✅ Added hover states and visual feedback
- ✅ Styled to match application theme (rounded corners, shadows)
- ✅ Added comprehensive tests for zoom control interactions (20/20 tests passing)
- ✅ Ensured no canvas layout displacement (absolute positioning)
- ✅ Added keyboard accessibility support with ARIA labels

### 16. Direct In-Shape Text Editing ✅
**Status**: Completed + Enhanced  
**Description**: Complete direct text editing system without overlay interfaces, fully matching spec.md requirements.
- ✅ **TRANSFORMATION**: Removed TextEditingOverlay component completely per user requirements
- ✅ **Direct Canvas Editing**: Text editing happens directly within shapes on the canvas - NO separate text input boxes or overlays
- ✅ **Blinking Cursor**: Visual text cursor rendered directly on canvas showing current editing position within shape (500ms blink interval)
- ✅ **Automatic Centering**: Text automatically centered horizontally and vertically within all shape bounds
- ✅ **Automatic Line Wrapping**: Text automatically wraps to new lines when exceeding shape width, creating multiple lines as needed
- ✅ **Shape-Constrained Text**: Text constrained to fit within shape boundaries with appropriate padding (rectangles: full width, circles: 70% inscribed)
- ✅ **Real-time Rendering**: Text and cursor appear immediately as typed, rendered directly on canvas within shape
- ✅ **Complete Keyboard Support**: 
  - Type directly to add text
  - Arrow keys for cursor movement between characters and lines
  - Enter for manual line breaks within text
  - **Shift+Enter Alternative**: Press Shift+Enter as alternative method to add line breaks
  - Backspace/Delete for full text editing capabilities
  - Escape or click outside shape to complete editing
- ✅ **Store Architecture**: New DirectTextEditingState with startTextEditing, updateTextContent, finishTextEditing, toggleCursor
- ✅ **Enhanced CanvasRenderer**: Cursor positioning with precise character-level placement and multi-line support
- ✅ **Word Boundaries**: Cursor movement respects word boundaries and line breaks for natural navigation
- ✅ **Multi-line Support**: Full support for multi-line text with proper line spacing and vertical centering of entire text block
- ✅ **Font Integration**: Text uses current font settings from properties panel (family, size, weight, style, color)
- ✅ **Specification Compliance**: Complete implementation matching updated spec.md direct editing behavior requirements
- ✅ **Double-click Any Shape**: Double-click on rectangles, circles, lines, or arrows to start text editing directly within shape

### 17. Advanced Selection Enhancements ✅
**Status**: Completed  
**Description**: Advanced selection features beyond basic multi-selection, implementing Phase 2 element management features.
- ✅ **Shift+Click Multi-Selection**: Add elements to selection with Shift+click without clearing existing selection
- ✅ **Select-All Functionality**: Implement Ctrl+A to select all visible elements on canvas
- ✅ **Enhanced Drag Selection**: Improve existing drag-selection rectangle with better visual feedback
- ✅ **Selection Visual Indicators**: Enhanced bounding box and resize handles for selected elements
- ✅ **Group Manipulation**: Move, resize, and transform multiple selected elements as a unit
- ✅ **Bulk Operations**: Delete, duplicate, and style multiple selected elements simultaneously  
- ✅ **Selection State Management**: Robust selection state with undo/redo support
- ✅ **Keyboard Selection**: Arrow keys to navigate between elements, Tab for selection cycling
- ✅ **Selection Performance**: Optimize selection operations for large numbers of elements
- ✅ **Advanced Selection Tests**: Comprehensive test coverage for all multi-selection scenarios

### 18. Simple Grid System ✅
**Status**: Completed and Simplified  
**Description**: Clean, efficient grid system with visibility and snapping controls.
- ✅ **Grid Visibility Controls**: Toggle grid display with G key shortcut and toolbar menu
- ✅ **Grid Size Configuration**: Adjustable grid size (5-100px) with numeric input and presets
- ✅ **Grid Snapping**: Simple snap-to-grid functionality with configurable snap distance
- ✅ **Snap Toggle**: Independent control for enabling/disabling grid snapping behavior
- ✅ **Drawing Tool Integration**: All drawing tools (line, arrow, rectangle, circle, pen, text) use grid snapping
- ✅ **Store Integration**: Clean state management with grid actions (removed magnetic complexity)
- ✅ **Toolbar Menu UI**: Simplified grid controls in toolbar dropdown menu
- ✅ **Visual Grid Rendering**: High-contrast grid lines visible at all zoom levels
- ✅ **Accessibility**: Full ARIA labels and keyboard navigation for grid controls
- ✅ **French UI Labels**: Complete French localization for grid functionality
- ✅ **Grid State Persistence**: Grid settings maintained across sessions
- ✅ **Simplified Architecture**: Removed magnetic system complexity for better maintainability
- ✅ **Comprehensive Tests**: Full test coverage for simplified grid system (15 test scenarios)
- ✅ **Clean Code**: Eliminated obsolete magnetic utilities, types, and UI components

## Phase 2: Advanced Features

### 19. Advanced Selection and Manipulation ⏳
**Status**: Not Started  
**Description**: Complete advanced selection capabilities and element manipulation.
- Advanced group selection manipulation (resize, rotate as unit)
- Element resizing handles and rotation controls
- Snap-to-objects (centers, edges, corners) during manipulation
- Advanced selection keyboard shortcuts
- Bulk operations on selected elements
- Selection performance optimization
- Advanced selection interaction tests

### 20. Advanced Element Operations ⏳
**Status**: Not Started  
**Description**: Implement comprehensive element management from spec.md Phase 2 features.
- **Z-order Control**: Layer management (bring forward, send back, bring to front, send to back) matching Properties Panel specification
- **Element Grouping**: Group/ungroup related elements (Ctrl+G, Ctrl+Shift+G) for unified manipulation
- **Enhanced Duplication**: Element duplication with smart offset positioning (Ctrl+D) and copy/paste with proper positioning
- **Element Locking**: Advanced locking system to prevent accidental edits with visual lock indicators
- **Alignment Tools**: Comprehensive alignment system (align left, center, right, top, middle, bottom)
- **Distribution Tools**: Even spacing tools for professional layout (distribute horizontally/vertically)
- **Style Transfer**: Copy styles between elements for consistent design
- **Bulk Style Operations**: Apply styles to multiple selected elements simultaneously
- **Advanced Copy/Paste**: Smart positioning with offset to prevent overlap
- **Element Hierarchy**: Visual indication of element relationships and grouping

### 21. Performance Optimizations ⏳
**Status**: Not Started  
**Description**: Implement comprehensive performance optimizations to meet spec.md requirements (60fps with 5000+ elements).
- **Viewport Culling**: Only render visible elements within viewport bounds for optimal performance
- **Spatial Indexing**: Quad-tree implementation for collision detection and hit testing optimization
- **Level-of-Detail Rendering**: Simplified rendering at low zoom levels (< 25%) for smooth interaction
- **Canvas Layer Separation**: Static vs dynamic content on separate layers to reduce unnecessary redraws
- **Memory Management**: Element pooling and garbage collection optimization for large drawings
- **Debounced Updates**: Batch rapid changes and throttle high-frequency updates for smooth performance
- **Rough.js Optimization**: Enhanced shape caching with intelligent cache invalidation
- **Performance Monitoring**: Real-time FPS monitoring and performance metrics dashboard
- **Stress Testing**: Comprehensive testing with 5000+ elements to validate performance targets
- **Event Optimization**: Throttled mouse events and optimized coordinate transformations

### 22. Enhanced Shape Tools ⏳
**Status**: Not Started  
**Description**: Implement advanced shape tools from spec.md Phase 2 enhanced drawing features.
- **Polygon Tool**: Configurable polygon with variable sides (3-20 sides) and size control
- **Star Tool**: Star shapes with inner/outer radius control and configurable points
- **Speech Bubble Shapes**: Communication bubbles with customizable tails and positioning
- **Connector Lines**: Smart lines that attach to shapes and maintain connections during movement
- **Shape Library**: Pre-built common symbols (flowchart, diagram elements, icons)
- **Custom Shape Creation**: Tool for creating and saving custom reusable shapes
- **Shape Templates**: Predefined shape combinations for common use cases
- **Bezier Curve Tool**: Advanced path creation with control points for smooth curves
- **Diamond Tool Enhancement**: Expand existing diamond tool with rotation and aspect ratio controls
- **Shape Snapping**: Magnetic alignment when shapes are near each other or grid points

### 23. Advanced Keyboard Shortcuts ⏳
**Status**: Not Started  
**Description**: Complete comprehensive keyboard shortcut system matching spec.md navigation requirements.
- **Quick Zoom Shortcuts**: Implement Ctrl+0 (reset zoom) and Ctrl+1 (zoom to fit) from spec.md
- **Advanced Navigation**: Enhanced Space+Drag pan controls and Ctrl+Scroll zoom refinements
- **Tool-Specific Modifiers**: Expanded Shift/Alt combinations for all drawing tools
- **Operation Shortcuts**: Complete implementation of Ctrl+G (group), Ctrl+Shift+G (ungroup), Ctrl+D (duplicate)
- **Help Overlay**: Interactive keyboard shortcut reference with visual demonstrations
- **Shortcut Customization**: User interface for customizing and reassigning keyboard shortcuts
- **Conflict Detection**: Automatic detection and resolution of shortcut conflicts
- **Accessibility Navigation**: Full keyboard navigation compliance for screen readers
- **Context-Aware Shortcuts**: Different shortcuts available based on current tool and selection
- **Shortcut Tooltips**: Enhanced tooltips showing current shortcuts in tool palette

## Phase 3: File Management

### 24. Export System ⏳
**Status**: Not Started  
**Description**: Implement comprehensive export system from spec.md Phase 3 file management.
- **PNG Export**: High-quality raster export with configurable DPI (72-300 DPI) and quality settings
- **SVG Export**: Vector format export preserving all shape data, Rough.js styling, and metadata
- **PDF Export**: Paginated output with proper page sizing for professional printing
- **Native Format**: .excalibox JSON format with full fidelity preservation of all element properties
- **Export Scope**: Selection-only export vs entire canvas export options
- **Background Options**: Transparent, white, or custom background color for exports
- **Export Preview**: Real-time preview dialog showing export output before saving
- **Batch Export**: Multiple format export in single operation with progress indicators
- **Export Settings**: Persistent user preferences for export quality and default formats
- **Metadata Preservation**: Include creation date, app version, and drawing metadata in exports

### 25. Import System ⏳
**Status**: Not Started  
**Description**: Implement comprehensive import system from spec.md Phase 3 file management.
- **Image Import**: PNG, JPG, SVG file support with drag-and-drop interface matching spec requirements
- **Native Import**: Load .excalibox files with full restoration of all element properties and metadata
- **Drag & Drop**: Direct file import to canvas with visual drop zones and feedback
- **Import Positioning**: Smart positioning with collision detection and user-selectable placement
- **Import Scaling**: Automatic and manual scaling options to fit content appropriately
- **Import Preview**: Preview dialog showing import content before final placement
- **Clipboard Support**: Paste images directly from clipboard into canvas
- **Bulk Import**: Multiple file import with batch processing and progress indicators
- **Error Handling**: Comprehensive validation and user-friendly error messages for invalid files
- **Format Detection**: Automatic file format detection and appropriate handling for each type

### 26. Native File Format ⏳
**Status**: Not Started  
**Description**: Create comprehensive .excalibox native file format from spec.md requirements.
- **JSON-Based Format**: Full fidelity preservation of all element properties, styling, and metadata
- **Compression Support**: File compression for large drawings to optimize storage and transfer
- **Version Compatibility**: Robust version handling for backward/forward compatibility across app updates
- **Rich Metadata**: Creation date, app version, author, modification history, and drawing statistics
- **Incremental Saves**: Differential save system for large files with change tracking
- **File Integrity**: Validation checksums and error detection for corrupted file recovery
- **Migration Tools**: Automatic format migration utilities for updating legacy files
- **Format Specification**: Complete documentation of file format for third-party integrations
- **Embedded Assets**: Support for embedded images and external asset references
- **Cloud Compatibility**: Format optimized for S3 integration and future collaboration features

### 27. Storage Integration ⏳
**Status**: Not Started  
**Description**: Implement comprehensive storage systems from spec.md Phase 3 requirements.
- **Browser Storage**: Auto-save to localStorage with configurable intervals and version history
- **File System API**: Local file operations for save/load using modern browser File System Access API
- **S3 Integration**: Cloud storage for future collaboration with AWS S3 backend connectivity
- **Storage Quota Management**: Intelligent quota monitoring with cleanup and optimization suggestions
- **Cross-Device Sync**: Synchronization capabilities between multiple devices using cloud backend
- **Offline Mode**: Full offline functionality with sync queue for when connectivity returns
- **Storage Preferences**: User-configurable auto-save intervals, local vs cloud preferences
- **Data Backup**: Automatic backup systems with configurable retention policies
- **Recovery Options**: File recovery from auto-saves, version history, and cloud backups
- **Storage Analytics**: Usage monitoring and storage optimization recommendations

## Phase 4: Collaboration Preparation

### 28. Backend Architecture ⏳
**Status**: Not Started  
**Description**: Set up comprehensive backend infrastructure for Phase 4 collaboration from spec.md.
- **Node.js/Express Setup**: API server with Express.js or Fastify framework for optimal performance
- **PostgreSQL Database**: Schema design for reliability and ACID compliance as specified
- **JWT Authentication**: Secure authentication with bcrypt password hashing and session management
- **RESTful API**: Complete API for drawing operations, user management, and collaboration features
- **WebSocket Infrastructure**: Socket.io integration for real-time collaborative editing capabilities
- **Security Measures**: Rate limiting, input validation, XSS prevention, and secure transmission (HTTPS)
- **API Documentation**: Comprehensive API documentation with interactive testing interface
- **Environment Management**: Separate development and production environments with CI/CD pipelines
- **Database Migrations**: Version-controlled database schema with migration tools
- **Monitoring & Logging**: Error tracking, performance monitoring, and audit logging systems

### 29. Data Synchronization ⏳
**Status**: Not Started  
**Description**: Implement comprehensive real-time collaboration foundation from spec.md Phase 4.
- **Operational Transform**: Conflict-free collaborative editing algorithm for simultaneous user changes
- **Event Sourcing**: Complete change tracking with timestamps and user attribution for version control
- **Optimistic Updates**: Immediate local feedback with rollback capability for failed operations
- **Live Cursors**: Show other users' cursor positions and activity indicators in real-time
- **Presence System**: User awareness with online status, active areas, and collaborative indicators
- **Network Resilience**: Robust offline mode handling with sync queue and conflict resolution
- **Data Consistency**: Validation systems ensuring drawing integrity across all collaborators
- **Performance Optimization**: Efficient sync algorithms handling large drawings and many users
- **Conflict Resolution**: Automated and manual merge strategies with user-friendly conflict UI
- **Branching Support**: Divergent edit paths with merge capabilities for complex collaborations

## Completed Features ✅

### Foundation ✅
**Status**: Completed  
**Description**: Basic React/TypeScript setup with Canvas rendering, Zustand state management, basic rectangle and circle tools, comprehensive test suite with 526 tests (100% passing), and development infrastructure.

### Test Infrastructure Complete ✅
**Status**: Completed - Option B Implementation  
**Description**: Comprehensive test infrastructure with zero technical debt.
- ✅ Perfect test status: 526/526 tests passing (100%)
- ✅ Zero act() warnings: Complete act() helper infrastructure  
- ✅ Robust Canvas mocks: Null safety guards and error handling
- ✅ Accessibility compliance: Full WCAG testing (38 tests)
- ✅ Error resilience: Comprehensive edge case handling (26 tests)
- ✅ Clean selectors: Role-based queries eliminating conflicts
- ✅ Future-proof architecture: Maintainable test patterns

### Management Scripts ✅
**Status**: Completed  
**Description**: Complete application lifecycle management scripts for development.
- ✅ start.sh/start.bat scripts for launching development server
- ✅ stop.sh/stop.bat scripts for stopping all processes  
- ✅ status.sh/status.bat scripts for monitoring application state
- ✅ Cross-platform support (Linux/Mac/Windows)
- ✅ npm scripts integration (npm run start/stop/status)
- ✅ Comprehensive system monitoring (ports, processes, resources)
- ✅ Complete documentation in SCRIPTS.md

---

## Development Guidelines

- **Test-First**: Write tests before implementing features
- **Incremental**: Complete one prompt fully before moving to next
- **Performance**: Consider performance impact of each feature
- **Clean Architecture**: Maintain separation of concerns
- **Documentation**: Update README and inline docs as needed
- **Git**: Commit each completed prompt with clear messages

## Current Status - DIRECT IN-SHAPE TEXT EDITING COMPLETE ✅

**LATEST COMPLETED**: Prompt 16 - Direct In-Shape Text Editing ✅  
**Phase 1 Progress**: 16/17 prompts completed (94.1%)  
**Recent Achievements**: Revolutionary direct canvas text editing system fully compliant with spec.md requirements  

### ✅ Recent Major Accomplishments:
- **Complete System Transformation**: Eliminated TextEditingOverlay completely per user requirements - NO separate text input boxes or overlays
- **Direct Canvas Rendering**: Text and blinking cursor rendered directly within shapes on canvas matching spec.md behavior
- **Advanced Cursor System**: Visual text cursor with 500ms blink interval and precise character-level positioning across multiple lines
- **Automatic Text Centering**: Text automatically centered horizontally and vertically within all shape bounds per specification
- **Intelligent Line Wrapping**: Text automatically wraps to new lines when exceeding shape width with proper word boundaries
- **Shape-Constrained Text**: Text constrained to fit within shape boundaries with appropriate padding (rectangles: full width, circles: 70% inscribed)
- **Real-time Text Updates**: Text and cursor appear immediately as typed with live visual feedback
- **Complete Keyboard Support**: Full spec.md compliance including Shift+Enter alternative for line breaks
- **Enhanced Store Architecture**: DirectTextEditingState with startTextEditing, updateTextContent, finishTextEditing, toggleCursor
- **Specification Compliance**: 100% implementation of spec.md direct editing behavior requirements with double-click activation

### 📋 Phase 1 Remaining (1 prompt):
- **Prompt 17**: Advanced Selection Enhancements (multi-selection, shift+click, select-all, group manipulation)

### 🔄 Revolutionary Text Editing Implementation:
- **Specification Alignment**: Complete implementation of spec.md "Direct In-Shape Text Editing Behavior" section
- **No Overlay Interface**: Eliminated all separate UI components per explicit user requirements
- **Advanced Canvas Integration**: Real-time cursor rendering with multi-line support and precise positioning
- **Shape-Aware Constraints**: Intelligent text wrapping for different shape types (rectangles vs circles)
- **Complete Keyboard Support**: Enter, Shift+Enter, arrows, backspace, delete, escape for comprehensive editing
- **Font Integration**: Full typography control via properties panel (family, size, weight, style, color)

**Next Development Focus**: **Advanced Selection Enhancements (Prompt 17)** - implementing Phase 2 element management features including shift+click multi-selection, select-all functionality, enhanced drag selection, and group manipulation capabilities.