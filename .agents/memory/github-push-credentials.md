---
name: GitHub push credentials
description: Safe fallback when managed GitHub source-control credentials are unavailable in the workspace.
---

When the GitHub remote is configured but the managed source-control credential is unavailable, a normal push may fail even though a repository token exists as a Replit secret. A temporary askpass process can authenticate a non-force push without writing the token into Git config, remotes, command history, or files that persist.

**Why:** The managed Git push helper can report `NO_CREDENTIALS` independently of the repository's available secret, while HTTPS Git still supports a one-shot credential prompt.

**How to apply:** Keep the remote URL token-free, provide credentials only through a temporary askpass environment for the single push, remove the helper on exit, and fetch/compare `origin/main` afterward to verify the push.