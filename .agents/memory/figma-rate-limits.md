---
name: Figma API rate limits
description: How to handle Figma REST API 429 errors
---

Figma's REST API rate-limits aggressive callers with HTTP 429. Response body: `{"status": 429, "err": "Rate limit exceeded"}`.

**Cooldown:** Wait ~90 seconds before retrying. 30s is not enough.

**Batch strategy:** Always fetch multiple nodes in ONE call using comma-separated IDs:
```
/v1/images/FILE_KEY?ids=1%3A287,1%3A1049,4%3A813&format=png&scale=2
```
(Note: `:` in node IDs must be URL-encoded as `%3A` in some contexts)

**File API vs Nodes API:**
- `/v1/files/FILE_KEY?depth=N` — full file tree, expensive, more likely to rate-limit
- `/v1/nodes/FILE_KEY?ids=...` — specific nodes, preferred
- `/v1/images/FILE_KEY?ids=...` — export nodes as PNG/SVG, separate endpoint

**Image export scale:** Use `scale=2` for retina-quality assets, `scale=1` for reference screenshots.
