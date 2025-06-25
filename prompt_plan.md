# Excalibox Development Prompt Plan

Based on the technical specification, this plan breaks down development into implementable prompts following the phased approach with optimized dependencies and sizing.

## Phase 1: Core Drawing Tools (MVP)

### 1. Keyboard Shortcuts Foundation ⏳
**Status**: Not Started  
**Description**: Implement core keyboard shortcut system that other tools will use.
- Tool switching with letter keys (S, R, C, L, A, P, T)
- Standard editing shortcuts (Ctrl+Z/Y, Ctrl+C/V, Delete)
- Canvas navigation (Space+drag pan, Ctrl+scroll zoom)
- Modifier key handling (Shift, Alt) for constrained drawing
- Keyboard event manager with conflict prevention
- Add comprehensive tests for keyboard handling
- Foundation for tool-specific shortcuts

### 2. Rough.js Integration ⏳
**Status**: Not Started  
**Description**: Integrate Rough.js for hand-drawn aesthetic matching Excalidraw.
- Install and configure Rough.js library
- Update CanvasRenderer to use Rough.js for all shapes
- Add roughness controls to element styling
- Implement hand-drawn style for rectangles and circles
- Add configurable roughness levels
- Ensure performance with Rough.js rendering
- Add tests for Rough.js integration

### 3. Basic Color Palette ⏳
**Status**: Not Started  
**Description**: Implement Excalidraw-compatible color system.
- Research and implement Excalidraw color palette
- Add color selection to floating palette UI
- Update toolOptions with proper color management
- Apply colors to existing rectangle and circle tools
- Add recent colors functionality
- Basic color picker for custom colors
- Color persistence and state management

### 4. Grid System and Snapping ⏳
**Status**: Not Started  
**Description**: Implement grid system with snap functionality for better drawing precision.
- Add configurable grid system with size controls
- Visual grid rendering on canvas background
- Implement snap-to-grid functionality
- Grid toggle and size configuration controls
- Snap distance configuration and visual indicators
- Grid state persistence
- Add comprehensive tests for grid and snapping

### 5. Line Drawing Tool ⏳
**Status**: Not Started  
**Description**: Implement line tool (L key) for drawing straight lines.
- Add line tool type and constants
- Implement line drawing with start/end point interaction
- Add angle snapping (45-degree increments with Shift modifier)
- Update CanvasRenderer for line rendering with Rough.js
- Handle line drawing interaction (click-drag-release)
- Add visual feedback during line drawing
- Integration with grid snapping and keyboard shortcuts

### 6. Arrow Drawing Tool ⏳
**Status**: Not Started  
**Description**: Implement arrow tool (A key) building on line tool foundation.
- Add arrow element type with arrowhead properties
- Implement arrow drawing similar to line tool
- Update CanvasRenderer with arrow rendering (main line + arrowhead)
- Basic triangle arrowhead style
- Support for arrow styling with current color system
- Arrow-specific interaction handling
- Comprehensive testing for arrow functionality

### 7. Pen/Freehand Drawing Tool ⏳
**Status**: Not Started  
**Description**: Implement pen tool (P key) for freehand drawing.
- Add pen tool to types and constants
- Implement pen drawing with point array collection
- Update CanvasRenderer to handle pen elements with Rough.js
- Basic point collection during mouse drag
- Smooth curve rendering for better drawing experience
- Integration with existing event handling and styling
- Comprehensive tests for pen functionality

### 8. Text Tool Implementation ⏳
**Status**: Not Started  
**Description**: Implement standalone text tool (T key).
- Add text tool for creating text elements
- Create text editing interface with proper focus handling
- Basic text styling controls (font family, size)
- Text positioning and basic alignment
- Text tool integration with keyboard shortcuts
- Text element rendering with Rough.js
- Comprehensive text tool tests

### 9. Enhanced Stroke Styles ⏳
**Status**: Not Started  
**Description**: Add stroke style options to complete basic styling.
- Add stroke style options (solid, dashed, dotted)
- Implement line caps and joins (round, square, butt, miter, bevel)
- Update all drawing tools to use stroke styles
- Stroke style controls in floating palette
- Apply stroke styles with Rough.js rendering
- Style persistence and state management
- Tests for all stroke style combinations

### 10. Fill Patterns and Advanced Styling ⏳
**Status**: Not Started  
**Description**: Implement fill options and complete the styling system.
- Add fill options (solid, hachure, cross-hatch patterns)
- Implement fill patterns with Rough.js
- Fill style controls in floating palette
- Update existing shapes to support fill patterns
- Style copying/pasting between elements
- Complete floating style palette UI
- Advanced styling tests

### 11. Double-Click Text Editing ⏳
**Status**: Not Started  
**Description**: Add text editing capability to all shapes via double-click.
- Implement double-click detection for all element types
- Add text property to all element types
- Create text editing overlay for in-place editing
- Text editing for rectangles, circles, lines, arrows
- Text positioning within shapes
- Font styling controls during editing
- Comprehensive text editing interaction tests

### 12. Basic Selection Enhancements ⏳
**Status**: Not Started  
**Description**: Improve selection tool with essential multi-selection features.
- Add shift+click for multi-selection
- Implement drag selection rectangle
- Add select-all functionality (Ctrl+A)
- Selection visual indicators (bounding box, handles)
- Basic group manipulation (move multiple elements)
- Delete multiple selected elements
- Selection state management and tests

## Phase 2: Advanced Features

### 13. Advanced Selection and Manipulation ⏳
**Status**: Not Started  
**Description**: Complete advanced selection capabilities and element manipulation.
- Advanced group selection manipulation (resize, rotate as unit)
- Element resizing handles and rotation controls
- Snap-to-objects (centers, edges, corners) during manipulation
- Advanced selection keyboard shortcuts
- Bulk operations on selected elements
- Selection performance optimization
- Advanced selection interaction tests

### 14. Advanced Element Operations ⏳
**Status**: Not Started  
**Description**: Implement layering, grouping, and duplication.
- Z-order control (bring forward, send back, bring to front, send to back)
- Element grouping and ungrouping (Ctrl+G, Ctrl+Shift+G)
- Element duplication with offset (Ctrl+D)
- Copy/paste with proper positioning
- Element locking to prevent accidental edits
- Alignment tools (align left, center, right, top, middle, bottom)
- Distribution tools for evenly spacing elements

### 15. Performance Optimizations ⏳
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

### 16. Enhanced Shape Tools ⏳
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

### 17. Advanced Keyboard Shortcuts ⏳
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

### 18. Export System ⏳
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

### 19. Import System ⏳
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

### 20. Native File Format ⏳
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

### 21. Storage Integration ⏳
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

### 22. Backend Architecture ⏳
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

### 23. Data Synchronization ⏳
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
**Description**: Basic React/TypeScript setup with Canvas rendering, Zustand state management, basic rectangle and circle tools, comprehensive test suite with 191 tests, and development infrastructure.

---

## Development Guidelines

- **Test-First**: Write tests before implementing features
- **Incremental**: Complete one prompt fully before moving to next
- **Performance**: Consider performance impact of each feature
- **Clean Architecture**: Maintain separation of concerns
- **Documentation**: Update README and inline docs as needed
- **Git**: Commit each completed prompt with clear messages

## Current Priority

Start with **Prompt 1: Keyboard Shortcuts Foundation** as the foundation for all other tools.