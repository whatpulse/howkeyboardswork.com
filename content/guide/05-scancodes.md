---
title: Scan Codes
description: The universal language of key positions
order: 5
slug: scancodes
---

Once the keyboard detects a key press, it needs to communicate which key was pressed. This is where scan codes come in - standardized numbers that identify each physical key position.

## Position, Not Character

A critical distinction: scan codes represent physical positions, not characters. The key in the top-left letter row sends the same scan code whether your layout is QWERTY (Q), AZERTY (A), or Dvorak ('). The operating system later maps scan codes to characters based on your selected layout.

This separation allows one keyboard to work with any language or layout - the keyboard just reports positions, and the OS handles interpretation.

::ToyFrame{title="Scan Code Explorer" subtitle="Click a key and switch layouts to see how scan codes map to characters" :show-reset="true"}
:ScanCodeExplorer
::

## Scan Code Sets

Historically, keyboards used different scan code sets:

- **Set 1**: The original IBM PC XT codes (still emulated for compatibility)
- **Set 2**: IBM AT extended codes (most PS/2 keyboards)
- **Set 3**: Terminal keyboards (rarely used)

Modern USB keyboards use **HID Usage Codes**, a standardized set defined by the USB-IF (USB Implementers Forum). These codes are part of the Human Interface Device specification and provide a consistent mapping across all USB keyboards.

::Callout{title="Make and Break" type="info"}
Keyboards send two types of codes: a "make" code when you press a key, and a "break" code when you release it. This allows the computer to know exactly when you're holding a key for repeating, or holding Shift while typing.
::

## Common Scan Codes

Some notable USB HID usage codes:
- `0x04` - 'A' key position
- `0x1E` - '1' key position
- `0x28` - Enter
- `0x29` - Escape
- `0xE0-E7` - Modifier keys (Ctrl, Shift, Alt, GUI)

The full specification includes hundreds of codes for every conceivable key, from standard letters to multimedia controls and international keys.
