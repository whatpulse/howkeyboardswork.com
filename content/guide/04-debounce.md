---
title: Debouncing
description: Filtering the noise of mechanical contacts
order: 4
slug: debounce
---

Mechanical contacts don't make clean connections. When switch contacts meet, they bounce - rapidly making and breaking contact for a few milliseconds before settling. Without handling, one key press could register as 5-20 separate presses.

## The Bounce Pattern

A typical mechanical switch bounces for 1-5 milliseconds after initial contact. During this time, the signal might look like rapid on-off-on-off switching. The keyboard's controller must filter this noise to detect a single, clean key press.

::ToyFrame{title="Debounce Visualizer" subtitle="Watch how debouncing filters contact bounce into a clean signal" :show-reset="true"}
:DebounceVisualizer
::

## Debouncing Strategies

**Hardware debouncing** uses capacitors and resistors to smooth the electrical signal. The capacitor charges slowly, filtering out rapid transitions. This adds cost and complexity to the PCB.

**Software debouncing** is more common in modern keyboards. The controller ignores state changes for a short "debounce window" after detecting a transition. Common approaches include:

- **Delay-based**: After detecting a press, wait 5-20ms before checking again
- **Integration**: Count consecutive samples in the same state before confirming
- **Symmetric**: Apply the same delay to both press and release events

::Callout{title="The Latency Trade-off" type="warning"}
Debounce time directly affects latency. A 10ms debounce window adds 10ms to every keystroke. Gaming keyboards often use shorter debounce times (5ms or less) for faster response, while standard keyboards may use 10-20ms for reliability.
::

## Real-World Considerations

Different switches have different bounce characteristics. Cherry MX switches typically settle within 5ms, while some cheaper switches may bounce for 10-15ms. A well-tuned keyboard adjusts debounce time to match its switches - short enough for responsiveness, long enough for reliability.
