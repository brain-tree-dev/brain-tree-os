# UI Specification

Pixel-perfect design spec for the clsh.dev mobile terminal.

## Screen Layout

```
┌─────────────────────────┐
│ ● clsh.dev    Connected │  Status Bar (32px)
├─────────────────────────┤
│                         │
│  $ npm run dev          │
│  > vite dev server      │
│  > ready in 1.2s        │
│  > http://localhost:5173│
│  $ █                    │  Terminal Area (flexible)
│                         │
├─────────────────────────┤
│ Ctrl Tab  ↑  ↓  Esc    │  Shortcut Bar (44px)
├─────────────────────────┤
│ 1 2 3 4 5 6 7 8 9 0    │  Number Row (40px)
├─────────────────────────┤
│ q w e r t y u i o p     │
│ a s d f g h j k l       │  Keyboard (156px)
│ ⇧ z x c v b n m ⌫     │
├─────────────────────────┤
│ ?123  ␣ space     ⏎    │  Bottom Row (48px)
└─────────────────────────┘
```

## Color Palette

| Element | Hex |
|---------|-----|
| Background | #1A1A2E |
| Terminal text | #E0E0E0 |
| Cursor | #00FF41 |
| Status connected | #22C55E |
| Status disconnected | #EF4444 |
| Keyboard bg | #2D2D44 |
| Key face | #3D3D5C |
| Key active | #6366F1 |

## Touch Interactions

| Gesture | Action |
|---------|--------|
| Tap key | Type character |
| Swipe left | Move cursor left |
| Swipe right | Move cursor right |
| Swipe up | Previous command |
| Long press | Alternate characters |
| Pinch | Zoom terminal text |

Feature tracking in [[Features]].
