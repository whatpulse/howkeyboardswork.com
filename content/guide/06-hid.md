---
title: USB HID Protocol
description: How keystrokes travel over the USB cable
order: 6
slug: hid
---

The Human Interface Device (HID) protocol defines how keyboards communicate with computers over USB. It's a standardized format that works across all operating systems without special drivers.

## The HID Report

When you press or release keys, the keyboard sends a small data packet called a "report". A standard keyboard report is just 8 bytes:

```
Byte 0: Modifier keys (Ctrl, Shift, Alt, GUI as bit flags)
Byte 1: Reserved (always 0)
Bytes 2-7: Up to 6 simultaneous key codes
```

This structure allows reporting up to 6 regular keys plus any combination of modifier keys simultaneously. The 6-key limit comes from this fixed report format, which is why standard USB keyboards are limited to "6-key rollover" (6KRO).

::ToyFrame{title="HID Report Viewer" subtitle="Click keys and modifiers to build a live HID report packet" :show-reset="true"}
:HidReportViewer
::

::Callout{title="N-Key Rollover" type="tip"}
Gaming keyboards often advertise "n-key rollover" (NKRO). They achieve this by using custom HID descriptors with larger reports, or by sending multiple reports. This allows unlimited simultaneous key presses at the cost of some compatibility.
::

## Polling Rate

The USB host (your computer) polls the keyboard at regular intervals, asking "any new data?". Standard keyboards use a 125Hz polling rate (8ms intervals). Gaming keyboards often support higher rates:

- 125Hz = 8ms maximum latency
- 500Hz = 2ms maximum latency
- 1000Hz = 1ms maximum latency

Higher polling rates mean keystrokes reach the computer faster, but consume more USB bandwidth and CPU time.

## Boot Protocol vs. Report Protocol

USB keyboards support two modes. Boot Protocol is simple and works in BIOS/UEFI before drivers load. Report Protocol is the full-featured mode used after the OS boots, supporting advanced features like media keys and custom reports.
