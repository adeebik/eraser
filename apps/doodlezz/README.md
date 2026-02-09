# Doodlzz - Collaborative Canvas Application

A feature-rich, real-time collaborative drawing canvas built with React, TypeScript, and WebSocket.

## Features

### 🎨 **Drawing Tools**
- **Select Tool** (V) - Select, move, resize, and rotate shapes
- **Pencil** (P) - Freehand drawing
- **Circle** (O) - Draw circles/ellipses
- **Rectangle** (R) - Draw rectangles
- **Eraser** (E) - Erase content

### 🎯 **Shape Manipulation**
- **Move** - Drag shapes to reposition
- **Resize** - 8 resize handles (corners + edges)
- **Rotate** - Green handle above shape for rotation
- **Multi-Select** - Ctrl/Cmd+Click or drag selection box
- **Duplicate** - Ctrl/Cmd+D to duplicate selected shapes

### 🎨 **Styling**
- **Stroke Color** - Choose from 13 colors
- **Stroke Width** - 5 thickness options (1px - 8px)
- **Fill Style** - None, Solid, Hatch pattern, Dots pattern
- **Fill Color** - 14 colors including transparent
- **Opacity** - 25% opacity for fills

### 🔍 **Canvas Navigation**
- **Zoom** - Ctrl+Mouse Wheel (10% - 1000%)
- **Pan** - Shift+Drag or Middle Mouse Button
- **Scroll** - Mouse Wheel (vertical), Shift+Wheel (horizontal)
- **Infinite Grid** - Visual guide for positioning

### 💾 **History & Collaboration**
- **Undo** - Ctrl+Z (50 action history)
- **Redo** - Ctrl+Shift+Z
- **Real-time Sync** - All changes broadcast to collaborators
- **Auto-save** - Changes saved to server

## Keyboard Shortcuts

### Tools
- `V` or `1` - Select Tool
- `P` or `2` - Pencil
- `O` or `3` - Circle
- `R` or `4` - Rectangle
- `E` or `5` - Eraser

### Actions
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` or `Ctrl+Y` - Redo
- `Ctrl+D` - Duplicate selected shape
- `Delete` or `Backspace` - Delete selected shape
- `Ctrl+Click` - Multi-select shapes

### Navigation
- `Mouse Wheel` - Scroll vertically
- `Shift+Wheel` - Scroll horizontally
- `Ctrl+Wheel` - Zoom in/out
- `Shift+Drag` - Pan canvas
- `Middle Mouse+Drag` - Pan canvas

## Component Architecture

```
CanvasPage.tsx          # WebSocket connection & room management
  └─ Canvas.tsx         # Main canvas orchestration & state
      ├─ TopToolbar.tsx     # Undo/Redo/Clear controls
      ├─ ToolsPanel.tsx     # Left tool selector
      ├─ BottomStylePanel.tsx # Stroke/Fill style controls
      ├─ ZoomControls.tsx   # Zoom level controls
      └─ Game.ts           # Core canvas logic & rendering
```

## Technical Details

### Shape Types
```typescript
- RECT: Rectangle with x, y, width, height
- CIRCLE: Ellipse with x, y, width, height
- PENCIL: Freehand path with array of {x, y} points
- ERASER: Erase marks with array of {x, y} points
- SELECT: Selection mode (not a shape)
```

### Shape Properties
```typescript
- rotation: Angle in radians
- style: {
    strokeColor: string
    strokeWidth: number
    backgroundColor: string
    fillStyle: "none" | "solid" | "hatch" | "dots"
  }
- centerX, centerY: Rotation pivot point (for pencil)
```

### WebSocket Events
```typescript
// New shape created
{ type: "chat", payload: { message: JSON.stringify(shape), roomId } }

// Shape updated (moved/resized/rotated)
{ type: "update", payload: { shapeIndex, shape, roomId } }

// Full state sync (undo/redo)
{ type: "state_sync", payload: { shapes, roomId } }

// Clear canvas
{ type: "clear_canvas", payload: { roomId } }
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```env
NEXT_PUBLIC_WS_URL=ws://your-websocket-server
NEXT_PUBLIC_BE_URL=https://your-backend-api
```

3. Run development server:
```bash
npm run dev
```

## File Structure

```
/app
  /components
    CanvasPage.tsx          # WebSocket setup
    Canvas.tsx              # Main component
    TopToolbar.tsx          # History controls
    ToolsPanel.tsx          # Tool selector
    BottomStylePanel.tsx    # Style controls
    ZoomControls.tsx        # Zoom controls
  /draw
    Game.ts                 # Canvas engine
    http.ts                 # API calls
/types
  types.ts                  # TypeScript types
/config
  config.ts                 # Environment config
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- **Optimized rendering** - Only redraws when necessary
- **Zoom scaling** - Line widths adjust with zoom level
- **Efficient history** - Max 50 actions stored
- **Smart broadcasting** - Only changed shapes sent over WebSocket

## Known Limitations

1. **Eraser collaboration** - Eraser strokes apply as layers, not true deletions
2. **Local undo** - Undo only affects your own actions, not collaborators
3. **No layers** - All shapes on single layer
4. **No text tool** - Text shapes not supported yet

## Future Enhancements

- [ ] Text tool
- [ ] Image uploads
- [ ] Layer system
- [ ] Export to PNG/SVG
- [ ] Color picker (custom colors)
- [ ] Shape grouping
- [ ] Alignment tools
- [ ] Shape libraries/templates

## Troubleshooting

### Canvas not loading
- Check WebSocket connection in dev tools
- Verify `WS_URL` is correct
- Ensure backend server is running

### Shapes not syncing
- Check network tab for WebSocket messages
- Verify roomId is consistent
- Check for console errors

### Performance issues
- Reduce number of shapes
- Lower zoom level
- Clear canvas periodically

## License

MIT

## Credits

Built with React, TypeScript, Next.js, and Tailwind CSS.