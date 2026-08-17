---
name: Expo tunnel mode for Expo Go
description: How to switch from web preview to Expo Go QR scanning
---

**Web mode** (default for Replit webview): `expo start --web --port 8099`
**Expo Go mode** (for phone): `expo start --tunnel`

To switch:
1. Use `configureWorkflow` callback to update the command
2. Use `WorkflowsRestart` to restart
3. Check logs — you'll see "Tunnel connected. Tunnel ready." then a QR code
4. The tunnel URL looks like: `exp://xxxxxxxx-anonymous-8081.exp.direct`

**Note:** Tunnel mode uses port 8081 internally (Metro default). The `.replit` port mapping for 8099→80 is no longer relevant in tunnel mode; leave it in place but it has no effect.

**Switching back to web:** Change command back to `expo start --web --port 8099`.
