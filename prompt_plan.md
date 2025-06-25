# Excalibox Development Prompt Plan

Based on the technical specification, this plan breaks down development into implementable prompts following the phased approach.

## Phase 1: Core Drawing Tools (MVP)

### 1. Pen/Freehand Drawing Tool ó
**Status**: Not Started  
**Description**: Implement the pen tool (P key) for freehand drawing with smooth curve rendering.
- Add pen tool to types and constants
- Implement pen drawing logic in App.tsx 
- Update CanvasRenderer to handle pen elements with point arrays
- Add smooth curve interpolation for better drawing experience
- Ensure pen tool integrates with existing event handling
- Add comprehensive tests for pen functionality
- Update UI to show pen tool selection

### 2. Line Drawing Tool ó
**Status**: Not Started  
**Description**: Implement line tool (L key) for drawing straight lines.
- Add line tool type and constants
- Implement line drawing with start/end points
- Add angle snapping (45-degree increments with Shift modifier)
- Update CanvasRenderer for line rendering
- Handle line drawing interaction (click-drag-release)
- Add visual feedback during line drawing
- Add tests for line tool functionality

### 3. Arrow Drawing Tool ó
**Status**: Not Started  
**Description**: Implement arrow tool (A key) for drawing arrows with customizable heads.
- Add arrow element type with arrowhead properties
- Implement arrow drawing similar to line tool
- Update CanvasRenderer with improved arrow rendering
- Add different arrowhead styles (triangle, circle, diamond)
- Support double-headed arrows option
- Add arrow-specific styling controls
- Comprehensive testing for arrow functionality

### 4. Text Tool and Editing ó
**Status**: Not Started  
**Description**: Implement text tool (T key) and double-click text editing for all shapes.
- Add text tool for creating standalone text elements
- Implement double-click text editing for any shape type
- Create text editing interface with proper focus handling
- Add text styling controls (font family, size, weight, style)
- Handle text positioning and alignment
- Support text wrapping for bounded text areas
- Add keyboard shortcuts for text formatting
- Comprehensive text editing tests

### 5. Enhanced Styling System ó
**Status**: Not Started  
**Description**: Implement comprehensive styling system matching Excalidraw.
- Research and implement Excalidraw color palette
- Add color picker component for custom colors
- Implement recent colors history
- Add stroke style options (solid, dashed, dotted)
- Implement line caps and joins (round, square, butt, miter, bevel)
- Add fill options (solid, hachure, cross-hatch patterns)
- Create floating style palette UI
- Add style copying/pasting between elements

### 6. Grid System and Snapping ó
**Status**: Not Started  
**Description**: Implement grid system with snap functionality.
- Add configurable grid system with size controls
- Implement snap-to-grid functionality
- Add snap-to-objects (centers, edges, corners)
- Visual grid rendering on canvas
- Grid toggle and configuration controls
- Snap distance configuration
- Visual snap indicators during drawing
- Grid and snap preference persistence

### 7. Multi-Selection and Manipulation ó
**Status**: Not Started  
**Description**: Implement advanced selection capabilities.
- Add shift+click for multi-selection
- Implement drag selection rectangle
- Add select-all functionality (Ctrl+A)
- Group selection manipulation (move, resize, rotate as unit)
- Selection visual indicators (bounding box, handles)
- Selection-specific keyboard shortcuts
- Bulk operations on selected elements
- Comprehensive selection interaction tests

### 8. Enhanced Keyboard Shortcuts ó
**Status**: Not Started  
**Description**: Implement complete keyboard shortcut system.
- Tool switching with letter keys (S, R, C, L, A, P, T)
- Standard editing shortcuts (Ctrl+Z/Y, Ctrl+C/V, Delete)
- Canvas navigation (Space+drag pan, Ctrl+scroll zoom)
- Modifier keys for constrained drawing (Shift, Alt)
- Quick zoom shortcuts (Ctrl+0, Ctrl+1)
- Help overlay showing all shortcuts
- Shortcut conflict prevention and customization

## Phase 2: Advanced Features

### 9. Advanced Element Operations ó
**Status**: Not Started  
**Description**: Implement layering, grouping, and duplication.
- Z-order control (bring forward, send back, bring to front, send to back)
- Element grouping and ungrouping (Ctrl+G, Ctrl+Shift+G)
- Element duplication with offset (Ctrl+D)
- Copy/paste with proper positioning
- Element locking to prevent accidental edits
- Alignment tools (align left, center, right, top, middle, bottom)
- Distribution tools for evenly spacing elements

### 10. Performance Optimizations ó
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

### 11. Enhanced Shape Tools ó
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

## Phase 3: File Management

### 12. Export System ó
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

### 13. Import System ó
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

### 14. Native File Format ó
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

### 15. Storage Integration ó
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

### 16. Backend Architecture ó
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

### 17. Data Synchronization ó
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

## Completed Features 

### Foundation 
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

Start with **Prompt 1: Pen/Freehand Drawing Tool** as the next implementation task.