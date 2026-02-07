---
title: Input Latency
description: Where those precious milliseconds go
order: 8
slug: latency
---

The time between pressing a key and seeing a result is called input latency. For competitive gaming and professional use, every millisecond counts. Let's trace where latency accumulates.

## The Latency Stack

**Keyboard Hardware (1-20ms)**
- Switch travel to actuation: ~1-2ms
- Debounce processing: 5-15ms
- Matrix scan cycle: 0.1-1ms
- Report generation: <0.1ms

**USB Transport (0.5-8ms)**
- Waiting for next poll: 0-8ms (depends on polling rate)
- USB packet transmission: <0.5ms

**Operating System (0.5-3ms)**
- USB driver processing: 0.5-1ms
- Input subsystem: 0.5-1ms
- Event dispatch: 0.5-1ms

**Application (1-16ms)**
- Event processing: 1-3ms
- Render frame wait: 0-16ms (60fps = 16ms per frame)

::ToyFrame{title="Latency Breakdown" subtitle="Adjust parameters to see how latency accumulates through the stack" :show-reset="true"}
:LatencyBreakdown
::

::Callout{title="Total Stack Latency" type="info"}
In ideal conditions, a keystroke might reach the screen in 5-10ms. In worst-case scenarios (long debounce, 125Hz polling, vsync-limited rendering), latency could exceed 50ms. The difference is perceptible.
::

## Reducing Latency

**Keyboard choices:**
- Lower debounce times (if switch quality permits)
- Higher polling rates (1000Hz vs. 125Hz)
- Optical switches (no debounce needed)

**System tuning:**
- Gaming mode in keyboards (prioritizes speed)
- USB controller configuration
- Reduced OS processing overhead

**Application settings:**
- Higher frame rates
- Reduced input buffering
- Raw input APIs

The quest for lower latency drives innovation in gaming peripherals, but understanding the full stack helps set realistic expectations. A 1000Hz keyboard won't help much if your monitor runs at 60Hz.
