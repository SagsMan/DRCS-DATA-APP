---
name: Expo startup rendering
description: Expo font loading can stall the first render, so startup must retain a splash gate with a bounded fallback.
---

The Expo app keeps the splash screen while fonts load, but renders after a short bounded timeout if a non-critical font request hangs. This prevents a device or web preview from remaining on a white screen indefinitely.

**Why:** A tunnel-connected Metro server and valid bundle can still show a blank app when font loading never resolves.

**How to apply:** Preserve the bounded startup fallback when changing the root layout or font-loading setup; keep the splash gate and error path intact.