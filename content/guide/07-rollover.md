---
title: Key Rollover
description: Why some key combinations don't work together
order: 7
slug: rollover
---

"Rollover" describes how many keys can be pressed simultaneously while still having each one register correctly. It's a combination of hardware capabilities (matrix design, diodes) and protocol limitations (HID report format).

## Understanding Rollover

**2-key rollover (2KRO)** means only 2 keys are guaranteed to work together. This was common in cheap membrane keyboards without diodes - pressing a third key might cause ghosting or blocking.

**6-key rollover (6KRO)** is standard for USB keyboards. The HID boot protocol limits reports to 6 simultaneous keys (plus modifiers). For most typing, this is sufficient.

**N-key rollover (NKRO)** means any number of keys can be pressed simultaneously. This requires both proper hardware (diodes on every key) and extended HID reports or alternative protocols.

## When Rollover Matters

For normal typing, 6KRO is plenty - you rarely press more than 6 non-modifier keys at once. But in gaming or specialized applications:

- Fighting games might require 5+ simultaneous inputs
- DAW software uses complex keyboard shortcuts
- Stenography keyboards need 20+ simultaneous keys

::Callout{title="The PS/2 Advantage" type="info"}
PS/2 keyboards don't have the USB protocol's 6-key limitation. A PS/2 keyboard with proper diodes naturally supports NKRO. Some gaming keyboards include PS/2 adapters specifically for this reason.
::

## Blocking and Jamming

Beyond ghosting, matrices can exhibit "blocking" (jamming) - where pressing certain key combinations prevents another key from registering at all. This happens when the electrical paths through pressed keys prevent accurate detection of additional keys. Good keyboard design and diode placement minimize these issues.
