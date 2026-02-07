---
title: The Keyboard Pipeline
description: From finger to screen - the journey of a keystroke
order: 1
slug: pipeline
---

When you press a key, it feels instantaneous. But between your finger touching plastic and a character appearing on screen, an intricate chain of events unfolds in milliseconds.

This guide walks you through every step of that journey. We'll explore the physical mechanics of switches, the electronics of matrix scanning, the protocols that carry your keystrokes to the computer, and finally how your operating system delivers them to applications.

Understanding this pipeline helps you appreciate why some keyboards feel more responsive than others, why certain key combinations might not work, and how latency accumulates through the system.

::ToyFrame{title="Keystroke Pipeline" subtitle="Press the button below to watch a keystroke travel through the entire pipeline. You'll see the key physically press down, the switch contacts close, the signal travel through the matrix and controller, over the USB cable, and into your application." :show-reset="true"}
:PipelineStepper
::

The visualization above shows a cross-section of a keyboard and computer. Watch how the signal flows from the physical switch, through the PCB's matrix and controller chip, over the USB cable, and finally through the operating system to reach your application. The entire journey typically takes 5-25 milliseconds.
