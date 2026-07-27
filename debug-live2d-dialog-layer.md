# Live2D dialog layer debug

Status: OPEN

## Symptom

The Live2D model renders above its dialog despite attempted z-index overrides.

## Hypotheses

1. The model node follows the dialog node in the same stacking context.
2. The runtime class names do not match the current CSS selectors.
3. A parent stacking context prevents the dialog z-index from taking effect.
4. Broad body selectors affect unrelated fixed elements instead of the Live2D nodes.

## Evidence

Pending runtime DOM inspection.

## Fix

Pending evidence.
