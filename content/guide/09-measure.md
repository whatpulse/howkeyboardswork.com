---
title: Measuring Latency
description: How to test your keyboard's real-world performance
order: 9
slug: measure
---

Marketing claims about latency are one thing; measuring real-world performance is another. Here's how to objectively test your keyboard's responsiveness.

## Tools for Measurement

**High-speed cameras** can capture the moment a key actuates and when a pixel changes on screen. At 1000fps, you can measure latency to the millisecond. This is the gold standard for objective measurement.

**Hardware latency testers** like the LDAT (Latency Display Analysis Tool) use light sensors to detect both key actuation and screen changes, automating the measurement process.

**Software tools** can measure parts of the chain. Utilities exist to timestamp keyboard events at the driver level, showing USB and OS latency (though not keyboard internal processing).

::Callout{title="Perception vs. Reality" type="warning"}
Human perception of latency varies by individual and context. Most people notice latency above 50ms, many notice above 20ms, and trained professionals might detect differences of 5-10ms. But "feeling faster" isn't the same as being faster - always verify with measurements.
::

## What to Measure

When comparing keyboards, measure:

1. **End-to-end latency**: Full stack from key press to screen change
2. **Consistency**: Standard deviation matters as much as average
3. **Worst-case latency**: Occasional spikes can be more disruptive than steady higher latency
4. **Release latency**: Time from key release to the release event registering

## Realistic Expectations

A well-designed gaming keyboard with 1000Hz polling, proper debouncing, and a responsive game can achieve end-to-end latency under 15ms. A budget keyboard at 125Hz with conservative debounce might measure 40-60ms.

For most users, improvements below 20ms are diminishing returns. Focus on consistency and build quality rather than chasing the lowest possible number.
