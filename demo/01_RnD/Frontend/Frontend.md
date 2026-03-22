# Frontend Architecture

React 18 + Vite + xterm.js application optimized for mobile-first terminal access.

## Component Tree

```
App
├── ConnectionScreen (ngrok URL input, QR code)
├── TerminalView
│   ├── XTermWrapper (xterm.js instance, WebSocket bridge)
│   ├── KeyboardOverlay
│   │   ├── MainKeyboard (custom touch keyboard)
│   │   ├── NumberRow (0-9, common symbols)
│   │   ├── SymbolGrid (brackets, pipes, slashes)
│   │   └── ShortcutBar (Ctrl+C, Tab, Up/Down, Esc)
│   ├── StatusBar (connection state, session info)
│   └── SwipeHandler (gesture navigation)
└── SettingsPanel (theme, font size, keyboard layout)
```

## Mobile Keyboard System

The core innovation. iOS/Android keyboards are unusable for terminal work, so we built custom overlays:

- **Main keyboard**: Full QWERTY with terminal-optimized layout
- **Number row**: Always visible, no mode switching
- **Symbol grid**: All programming symbols accessible in one tap
- **Shortcut bar**: Ctrl+C, Tab, arrow keys, Esc as dedicated buttons

## WebSocket Bridge

Maintains a persistent WebSocket to the [[Backend]]. Data flows bidirectionally: keystrokes from xterm.js to PTY, output from PTY to xterm.js. Reconnection logic handles network interruptions gracefully.

Full UI specifications in [[UI-Spec]].
