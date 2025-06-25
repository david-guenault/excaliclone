# Excalibox - Technical Specification

## Overview

Excalibox is a comprehensive drawing and whiteboarding application designed for personal use with future collaboration capabilities. It features an infinite canvas, comprehensive drawing tools, and a clean desktop-focused interface.

## Vision & Goals

### Primary Goals
- **Personal Drawing Tool**: Comprehensive sketching and diagramming for individual use
- **Future Collaboration**: Architecture designed for real-time collaborative editing
- **Performance**: Handle unlimited canvas size with thousands of objects without lag
- **Desktop-First**: Optimized for desktop workflows with keyboard shortcuts

### Success Criteria
- Smooth drawing experience at 60fps with 1000+ objects
- Sub-100ms response time for all drawing operations
- Unlimited canvas with efficient viewport culling
- Clean, maintainable architecture for collaboration features

## Technical Architecture

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: Zustand for simplicity and performance
- **Canvas Rendering**: HTML5 Canvas with custom rendering engine
- **Styling**: CSS Modules for component isolation
- **Drawing Library**: Rough.js for hand-drawn aesthetic

### Backend Stack (Future Collaboration)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js or Fastify for API
- **Database**: PostgreSQL for reliability and ACID compliance
- **Real-time**: WebSockets with Socket.io for collaboration
- **Authentication**: JWT with bcrypt for password hashing
- **File Storage**: AWS S3 for drawing persistence

### Data Architecture

#### Core Types
```typescript
interface Point {
  x: number;
  y: number;
}

interface Element {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  fillStyle: 'solid' | 'hachure' | 'cross-hatch' | 'transparent';
  roughness: number;
  opacity: number;
  points?: Point[]; // For freehand/pen tool
  text?: string; // For text elements
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
}

interface Viewport {
  zoom: number; // 0.1 to 2.5
  pan: Point;
  bounds: Rect;
}

interface GridState {
  enabled: boolean;
  size: number;
  snapEnabled: boolean;
}

interface UIState {
  propertiesPanel: {
    visible: boolean;
    width: number; // 250-400px
  };
  toolPalette: {
    position: 'top';
    visible: boolean;
  };
}
```

## Feature Specification

### Phase 1: Core Drawing Tools (MVP)

#### User Interface Behavior
- **Header Removal**: No application header, maximizes canvas space
- **Top Tool Palette**: Always visible, horizontal layout at screen top
- **Conditional Properties Panel**: 
  - Only visible when elements are selected
  - Automatically shows/hides based on selection state
  - Smooth slide animation from left edge
  - Contains all element styling and manipulation controls

#### Canvas System
- **Infinite Canvas**: Dynamically expanding drawing surface
- **Viewport Management**: Smooth pan and zoom (10% to 250%)
- **Grid System**: Configurable grid with snap-to-grid functionality
- **Visual Feedback**: Real-time guides during drawing operations

#### Drawing Tools
- **Selection Tool** (S): Select, move, resize, rotate elements
- **Rectangle Tool** (R): Draw rectangles with constraint modifiers
- **Circle Tool** (C): Draw circles and ellipses
- **Line Tool** (L): Draw straight lines with angle snapping
- **Arrow Tool** (A): Draw arrows with customizable heads
- **Pen Tool** (P): Freehand drawing with pressure sensitivity
- **Text Tool** (T): Add and edit text annotations

#### Tool Modifiers
- **Shift**: Constrain proportions (squares, circles, 45° angles)
- **Alt**: Draw from center point
- **Double-click**: Enter text editing mode for any shape

#### Styling System
- **Color Palette**: Excalidraw-compatible predefined colors
- **Recent Colors**: History of recently used colors
- **Custom Colors**: Full color picker for palette expansion
- **Stroke Styles**: Solid, dashed, dotted lines
- **Line Caps**: Round, square, butt endings
- **Line Joins**: Round, bevel, miter connections
- **Fill Options**: Solid, hachure, cross-hatch patterns
- **Typography**: Font family, size, weight, style controls

### Phase 2: Advanced Features

#### Element Management
- **Layering**: Z-order control (bring forward, send back)
- **Grouping**: Group/ungroup related elements
- **Duplication**: Copy/paste with offset positioning
- **Multi-selection**: Shift+click and drag selection
- **Style Transfer**: Copy styles between elements

#### Enhanced Drawing
- **Shape Library**: Polygons, stars, speech bubbles
- **Connectors**: Smart lines that attach to shapes
- **Image Support**: Import and embed images
- **Advanced Text**: Rich text formatting, text boxes

#### Performance Optimizations
- **Viewport Culling**: Only render visible elements
- **Level-of-Detail**: Simplified rendering at low zoom
- **Canvas Pooling**: Reuse canvas instances for efficiency
- **Debounced Updates**: Batch rapid changes for smooth performance

### Phase 3: File Management

#### Export System
- **PNG Export**: High-quality raster with configurable DPI
- **SVG Export**: Vector format preserving all shape data
- **PDF Export**: Paginated output for printing
- **Native Format**: .excalibox JSON format with full fidelity

#### Import System
- **Image Import**: PNG, JPG, SVG file support
- **Native Import**: Load .excalibox files with full restoration
- **Drag & Drop**: Direct file import to canvas

#### Storage System
- **Browser Storage**: Auto-save to localStorage
- **File System**: Save/load to local files
- **S3 Integration**: Cloud storage for future collaboration

### Phase 4: Collaboration Features

#### Real-time Editing
- **Live Cursors**: Show other users' cursor positions
- **Operational Transform**: Conflict-free collaborative editing
- **Presence System**: User awareness and activity indicators
- **Optimistic Updates**: Immediate local feedback

#### Version Control
- **Change History**: Track all edits with timestamps
- **User Attribution**: Associate changes with users
- **Branching**: Support for divergent edit paths
- **Conflict Resolution**: Automated and manual merge strategies

#### Communication
- **Integrated Chat**: Text communication within drawings
- **Comments**: Anchored feedback on specific elements
- **Voice Chat**: WebRTC-based audio communication
- **Screen Sharing**: Share external content during collaboration

#### Authentication & Access
- **User Accounts**: Email/password authentication
- **Drawing Sharing**: Link-based access control
- **Permissions**: Owner, editor, viewer roles
- **Session Management**: Secure token-based access

## User Interface Design

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Tool Palette (Top)                   │
├─────────┬───────────────────────────────────────────────┤
│Properties│                                             │
│Panel     │              Infinite Canvas                 │
│(Left)    │                                             │
│(Visible  │                                             │
│only when │                                             │
│elements  │                                             │
│selected) │                                             │
│          │                                             │
└─────────┴─────────────────────────────────────────────┘
```

### Top Tool Palette
- **Position**: Top of screen, horizontally arranged
- **Contents**: Tool icons (Select, Rectangle, Circle, Line, Arrow, Pen, Text)
- **Layout**: Centered or left-aligned toolbar
- **Behavior**: Always visible, compact design
- **Style**: Clean, minimalist design matching Excalidraw

### Left Properties Panel
- **Position**: Left side of screen, vertical panel
- **Visibility**: Only appears when one or more elements are selected
- **Contents**: 
  - Element properties (stroke color, fill color, stroke width)
  - Style controls (stroke style, opacity, roughness)
  - Alignment and positioning tools
  - Element-specific options
- **Behavior**: 
  - Slides in from left when elements selected
  - Auto-hides when selection is cleared
  - Resizable width (minimum 250px, maximum 400px)
- **Animation**: Smooth slide transition (200ms)

### Keyboard Shortcuts

#### Tool Selection
- `S` - Selection tool
- `R` - Rectangle tool
- `C` - Circle tool
- `L` - Line tool
- `A` - Arrow tool
- `P` - Pen tool
- `T` - Text tool

#### Operations
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Ctrl+A` - Select all
- `Delete` - Delete selected
- `Ctrl+D` - Duplicate
- `Ctrl+G` - Group
- `Ctrl+Shift+G` - Ungroup

#### Navigation
- `Space+Drag` - Pan canvas
- `Ctrl+Scroll` - Zoom
- `Ctrl+0` - Reset zoom
- `Ctrl+1` - Zoom to fit

## Performance Requirements

### Rendering Performance
- **Target FPS**: 60fps during drawing operations
- **Element Capacity**: Smooth with 5000+ elements
- **Zoom Performance**: No lag during zoom/pan operations
- **Memory Usage**: < 100MB for typical drawings

### Optimization Strategies
- **Spatial Indexing**: Quad-tree for collision detection
- **Dirty Rectangle**: Only redraw changed regions
- **Canvas Layers**: Separate static and dynamic content
- **Event Debouncing**: Throttle high-frequency updates

## Development Roadmap

### Sprint 1-2: Foundation (2-3 weeks)
- [ ] Canvas rendering engine
- [ ] Basic viewport management
- [ ] Selection and rectangle tools
- [ ] Grid system implementation

### Sprint 3-4: Core Tools (2-3 weeks)
- [ ] Circle, line, arrow tools
- [ ] Pen tool with smooth curves
- [ ] Text editing system
- [ ] Basic styling controls

### Sprint 5-6: Advanced Drawing (2-3 weeks)
- [ ] Complete styling system
- [ ] Multi-selection and manipulation
- [ ] Keyboard shortcuts
- [ ] Performance optimizations

### Sprint 7-8: File Management (2 weeks)
- [ ] Export functionality (PNG, SVG, PDF)
- [ ] Native file format
- [ ] Import system
- [ ] Browser storage

### Sprint 9-12: Collaboration Prep (3-4 weeks)
- [ ] Backend API design
- [ ] Authentication system
- [ ] Database schema
- [ ] Real-time infrastructure

### Sprint 13-16: Collaboration (4 weeks)
- [ ] Real-time editing
- [ ] User presence
- [ ] Version control
- [ ] Communication features

## Quality Assurance

### Testing Strategy
- **Unit Tests**: All utility functions and core logic
- **Integration Tests**: Component interactions
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Large drawing stress tests
- **Visual Regression**: Canvas rendering consistency

### Code Quality
- **TypeScript**: Strict mode with full type coverage
- **ESLint**: Consistent code style and best practices
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks for quality gates

### Browser Support
- **Primary**: Chrome 100+, Firefox 100+, Safari 15+
- **Secondary**: Edge 100+
- **Mobile**: Not supported in Phase 1

## Security Considerations

### Data Protection
- **Client-side Encryption**: Sensitive drawing data
- **Secure Transmission**: HTTPS for all communications
- **Input Validation**: Sanitize all user inputs
- **XSS Prevention**: Content Security Policy headers

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Short-lived tokens with refresh
- **Rate Limiting**: Prevent brute force attacks
- **Session Management**: Secure token storage

## Deployment Strategy

### Development Environment
- **Local Setup**: Docker containers for consistency
- **Hot Reload**: Vite dev server for rapid iteration
- **API Mocking**: MSW for backend simulation

### Production Deployment
- **Frontend**: Vercel or Netlify for static hosting
- **Backend**: Railway or Render for Node.js API
- **Database**: Managed PostgreSQL instance
- **CDN**: CloudFront for global asset delivery
- **Storage**: AWS S3 for file persistence

## Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: FCP, LCP, FID, CLS tracking
- **Custom Metrics**: Drawing operations per second
- **Error Tracking**: Sentry for exception monitoring
- **Performance Profiling**: Canvas rendering bottlenecks

### Usage Analytics
- **Tool Usage**: Which drawing tools are most popular
- **Performance**: Client-side performance metrics
- **Feature Adoption**: Track new feature usage
- **Error Rates**: Monitor and reduce error frequency

## Future Enhancements

### Advanced Features
- **AI Assistance**: Shape recognition and auto-completion
- **Templates**: Pre-built drawing templates
- **Plugins**: Extensible architecture for third-party tools
- **Mobile Apps**: Native iOS/Android applications

### Enterprise Features
- **SSO Integration**: SAML/OAuth enterprise auth
- **Advanced Permissions**: Team and organization management
- **Audit Logs**: Complete change tracking
- **On-premise**: Self-hosted deployment options

---

**Document Version**: 1.0  
**Last Updated**: 2025-06-25  
**Author**: Development Team  
**Review Status**: Draft