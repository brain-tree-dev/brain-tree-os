# Product Vision

> Your Mac, in your pocket.

## The Problem

You're at dinner, your server goes down, and you need to run one command. You pull out your phone and the iOS keyboard is useless for terminal work. Brackets, pipes, Ctrl+C, arrow keys, Tab completion are all buried behind multiple taps.

## The Solution

A browser-based terminal with a UI built from scratch for mobile:

1. **Custom keyboards**: Replace iOS/Android keyboard entirely with terminal-optimized overlays
2. **Touch gestures**: Swipe for cursor movement, pinch to zoom, long-press for selection
3. **One-command setup**: `npx clsh` and scan a QR code
4. **Real shell**: Full zsh/bash, not a sandboxed environment

## Design Philosophy

Guided by [[Vision-Mission]]:
- Every interaction designed for thumbs, not mice
- Most common terminal operations reachable in one tap
- No compromise on shell capabilities

See [[MVP]] for the minimal feature set that delivers this vision.
