---
name: Figma full-frame export clipping
description: How to render Figma full-screen exports without showing unwanted UI from the frame
---

When Figma screen exports contain a complete frame (including multiple UI zones like a blue header + white bottom sheet), rendering them naively causes a "double UI" bug where content from the image overlaps your own layout.

**Rule:** Render the image top-aligned and clip to a container smaller than the full image height.

```tsx
const ILLUS_H = H * 0.56;           // desired visible height
const FRAME_RENDERED_H = W * (852 / 393); // Figma frame aspect ratio

<View style={{ height: ILLUS_H, backgroundColor: C.primary, overflow: 'hidden' }}>
  <Image
    source={slide.img}
    style={{ position: 'absolute', top: 0, left: 0, width: W, height: FRAME_RENDERED_H }}
    resizeMode="stretch"
  />
</View>
```

**Why `resizeMode="stretch"`:** cover/contain centers the image vertically, showing the middle section of the frame (which may include unwanted UI). stretch + explicit height pins the image to the top.

**Why `backgroundColor: C.primary`:** Acts as fallback if the image is fractionally shorter than the container (rounding).

**Safety margin:** Set ILLUS_H to ~56% of H; the Figma white sheet boundary is at ~57–58%, giving a small buffer.
