---
name: Figma nodes endpoint path
description: Correct Figma REST API path for fetching specific nodes
---

Fetch specific nodes with `/v1/files/FILE_KEY/nodes?ids=...` — `/v1/nodes/FILE_KEY` is not a real endpoint and returns 404 even with a valid key and token.

**Why:** A 404 from the wrong path looks like a bad file key and wastes rate-limit cooldown cycles on the wrong diagnosis.

**How to apply:** Also note `/v1/files/KEY?depth=N` (full file) rate-limits far more aggressively than the nodes endpoint; the nodes endpoint often works while the files endpoint still 429s.
