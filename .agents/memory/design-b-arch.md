---
name: Design B architecture
description: How Design B is structured and wired into the app
---

DesignBApp lives in `components/DesignBApp.tsx` (NOT `app/design-b.tsx`).

**Why:** Expo Router treats every file inside `app/` as a route and requires a `default export`. A named-only export causes a runtime warning and breaks bundling.

**How to apply:** Any new full-screen design variant or standalone feature app should go in `components/`, then be imported and conditionally rendered from `app/index.tsx`.

**Wiring in index.tsx:**
```tsx
const isDesignB = designVariant === 'B';
if (isDesignB) return <DesignBApp onSwitchDesign={toggleDesign} />;
```
Use `const isDesignB = ...` (not inline `if (designVariant === 'B')`) to prevent TypeScript from narrowing `designVariant` to `'A'` for the rest of the component, which would cause TS2367 errors on the toggle button comparisons below.
