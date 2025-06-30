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
**Status**: Completed  
**Description**: Integrated Rough.js for hand-drawn aesthetic matching Excalidraw.
- ✅ Install and configure Rough.js library (v4.6.6)
- ✅ Update CanvasRenderer to use Rough.js for all shapes (rectangles, circles, lines, arrows, pen)
- ✅ Add roughness controls to element styling in properties panel
- ✅ Implement hand-drawn style for rectangles and circles with fillStyle: 'hachure'
- ✅ Add configurable roughness levels (0-3 range) with presets (Precise, Smooth, Normal, Rough, Very Rough, Extreme)
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

### 14. Enhanced Stroke Styles ⏳
**Status**: Not Started  
**Description**: Add stroke style options to complete basic styling.
- Add stroke style options (solid, dashed, dotted)
- Implement line caps and joins (round, square, butt, miter, bevel)
- Update all drawing tools to use stroke styles
- Stroke style controls in properties panel
- Apply stroke styles with Rough.js rendering
- Style persistence and state management
- Tests for all stroke style combinations

### 15. Fill Patterns and Advanced Styling ⏳
**Status**: Not Started  
**Description**: Implement fill options and complete the styling system.
- Add fill options (solid, hachure, cross-hatch patterns)
- Implement fill patterns with Rough.js
- Fill style controls in properties panel
- Update existing shapes to support fill patterns
- Style copying/pasting between elements
- Complete properties panel styling UI
- Advanced styling tests

### 16. Double-Click Text Editing ⏳
**Status**: Not Started  
**Description**: Add text editing capability to all shapes via double-click.
- Implement double-click detection for all element types
- Add text property to all element types
- Create text editing overlay for in-place editing
- Text editing for rectangles, circles, lines, arrows
- Text positioning within shapes
- Font styling controls during editing
- Comprehensive text editing interaction tests

### 17. Advanced Selection Enhancements ⏳
**Status**: Not Started  
**Description**: Advanced selection features beyond basic multi-selection.
- Add shift+click for multi-selection
- Implement drag selection rectangle
- Add select-all functionality (Ctrl+A)
- Selection visual indicators (bounding box, handles)
- Basic group manipulation (move multiple elements)
- Delete multiple selected elements
- Selection state management and tests

## Phase 2: Advanced Features

### 18. Advanced Selection and Manipulation ⏳
**Status**: Not Started  
**Description**: Complete advanced selection capabilities and element manipulation.
- Advanced group selection manipulation (resize, rotate as unit)
- Element resizing handles and rotation controls
- Snap-to-objects (centers, edges, corners) during manipulation
- Advanced selection keyboard shortcuts
- Bulk operations on selected elements
- Selection performance optimization
- Advanced selection interaction tests

### 19. Advanced Element Operations ⏳
**Status**: Not Started  
**Description**: Implement layering, grouping, and duplication.
- Z-order control (bring forward, send back, bring to front, send to back)
- Element grouping and ungrouping (Ctrl+G, Ctrl+Shift+G)
- Element duplication with offset (Ctrl+D)
- Copy/paste with proper positioning
- Element locking to prevent accidental edits
- Alignment tools (align left, center, right, top, middle, bottom)
- Distribution tools for evenly spacing elements

### 20. Performance Optimizations ⏳
**Status**: Not Started  
**Description**: Implement performance optimizations for large drawings.
- Viewport culling (only render visible elements)
- Spatial indexing with quad-tree for collision detection
- Level-of-detail rendering at different zoom levels
- Canvas layer separation (static vs dynamic content)
- Memory management and element pooling
- Debounced updates for smooth interaction
- Performance monitoring and metrics
- Stress testing with thousands of elements

### 21. Enhanced Shape Tools ⏳
**Status**: Not Started  
**Description**: Add more shape types and drawing modes.
- Polygon tool with configurable sides
- Star tool with inner/outer radius control
- Speech bubble shapes
- Connector lines that attach to shapes
- Shape library with common symbols
- Custom shape creation and saving
- Shape templates and presets
- Bezier curve tool for advanced paths

### 22. Advanced Keyboard Shortcuts ⏳
**Status**: Not Started  
**Description**: Complete the keyboard shortcut system with advanced features.
- Quick zoom shortcuts (Ctrl+0, Ctrl+1)
- Advanced navigation shortcuts
- Tool-specific modifier combinations
- Help overlay showing all shortcuts
- Shortcut customization interface
- Shortcut conflict detection and resolution
- Accessibility keyboard navigation

## Phase 3: File Management

### 23. Export System ⏳
**Status**: Not Started  
**Description**: Implement comprehensive export functionality.
- PNG export with configurable quality and DPI
- SVG export preserving vector data and styles
- PDF export with proper page sizing
- Export selection vs entire canvas
- Background options (transparent, white, custom)
- Export preview and settings dialog
- Batch export capabilities
- Export quality optimization

### 24. Import System ⏳
**Status**: Not Started  
**Description**: Implement file import capabilities.
- Image import (PNG, JPG, SVG) with drag-and-drop
- Native .excalibox file import
- Import positioning and scaling options
- Import preview and confirmation
- Clipboard image paste support
- Bulk import capabilities
- Import error handling and validation
- File format detection and conversion

### 25. Native File Format ⏳
**Status**: Not Started  
**Description**: Create .excalibox native file format.
- JSON-based format with full fidelity
- Compression for large files
- Version compatibility handling
- Metadata inclusion (creation date, app version)
- Incremental save capabilities
- File integrity validation
- Migration tools for format updates
- Format documentation and specification

### 26. Storage Integration ⏳
**Status**: Not Started  
**Description**: Implement storage systems.
- Browser localStorage for auto-save
- File system API for local file operations
- S3 integration for cloud storage
- Storage quota management
- Sync capabilities between devices
- Offline mode with sync when online
- Storage preferences and configuration
- Data backup and recovery options

## Phase 4: Collaboration Preparation

### 27. Backend Architecture ⏳
**Status**: Not Started  
**Description**: Set up backend infrastructure for collaboration.
- Node.js/Express API server setup
- PostgreSQL database schema design
- Authentication system with JWT
- RESTful API for drawing operations
- WebSocket infrastructure for real-time updates
- Rate limiting and security measures
- API documentation and testing
- Development and production environments

### 28. Data Synchronization ⏳
**Status**: Not Started  
**Description**: Implement real-time data sync foundation.
- Operational Transform algorithm for conflict resolution
- Event sourcing for change tracking
- Optimistic updates with rollback capability
- Network state handling and offline mode
- Data consistency validation
- Sync performance optimization
- Conflict resolution UI and workflows
- Comprehensive sync testing

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

## Current Status - TEXT TOOL COMPLETE ✅

**LATEST COMPLETED**: Prompt 13 - Text Tool Implementation ✅  
**Phase 1 Progress**: 13/17 prompts completed (76.5%)  
**Recent Achievements**: Complete text tool with direct canvas editing, cursor-centered zoom, coordinate transformation fixes  

### ✅ Recent Major Accomplishments:
- **Text Tool Complete**: Full text editing directly on canvas with real-time rendering and cursor visualization
- **Advanced Typography**: Font family dropdown, B/I/U toggles, size presets, text alignment, underline decoration
- **Properties Panel Enhancement**: Reorganized font controls with logical grouping and clean UI
- **Cursor-Centered Zoom**: Precision zoom functionality keeping cursor point fixed during zoom operations
- **Coordinate System Fixes**: Resolved selection alignment issues and text dragging problems across zoom levels
- **Selection Scaling**: Fixed selection indicators to scale properly with viewport transformations
- **UI Organization**: Clean separation of font family (dropdown) and styles (B/I/U buttons) in properties panel
- **Git History**: Clean commits with descriptive messages (a424616, ffc7dff)

### 📋 Phase 1 Remaining (4 prompts):
- **Prompt 14**: Enhanced Stroke Styles (next target)
- **Prompt 15**: Fill Patterns and Advanced Styling
- **Prompt 16**: Double-Click Text Editing
- **Prompt 17**: Advanced Selection Enhancements

Next development focus: **Enhanced Stroke Styles (Prompt 14)** - implementing comprehensive line caps, joins, and stroke style refinements.