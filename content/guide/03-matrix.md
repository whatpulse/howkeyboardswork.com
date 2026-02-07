---
title: The Key Matrix
description: How keyboards read 100+ keys with minimal wiring
order: 3
slug: matrix
---

A full-size keyboard has over 100 keys. If each key had its own dedicated wire to the controller, you'd need over 100 input pins - far more than most microcontrollers provide. The solution is a matrix.

## How a Matrix Works

Keys are arranged in rows and columns. Instead of 100+ wires, a 10x10 matrix needs only 20 wires (10 rows + 10 columns) to address 100 keys. Each key sits at the intersection of one row and one column.

The controller scans one row at a time: it activates a row (sets it to a known voltage), then reads all column lines. If a key in that row is pressed, the corresponding column will show the signal. By rapidly scanning all rows, the controller can detect which keys are pressed.

::ToyFrame{title="Matrix Scanner" subtitle="Click keys to press them and watch the row-by-row scanning" :show-reset="true"}
:MatrixScanner
::

## The Ghosting Problem

Matrices have a weakness: ghosting. If you press three keys that form an "L" shape (sharing rows and columns), the controller might detect a fourth, phantom key at the corner of the rectangle.

This happens because electricity can flow backwards through the pressed keys. The solution is diodes - one-way electrical valves placed on each key. With diodes, current can only flow in one direction, preventing ghosting.

::Callout{title="Try it" type="tip"}
In the demo above, disable diodes and press Q, W, and A. You'll see a ghost key appear at S - a key you didn't press!
::

Most gaming keyboards and all quality mechanical keyboards include diodes for every key, enabling true "n-key rollover" - the ability to press any number of keys simultaneously without ghosting.
