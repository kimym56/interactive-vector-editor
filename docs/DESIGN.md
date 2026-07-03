# Interactive Vector Editor Design System

This document describes the current design system for the Interactive Vector Editor.

The implementation is intentionally small: React, TypeScript, Vite, SVG, and one plain CSS file at `src/App.css`. There is no component framework, theme provider, icon package, Tailwind runtime, or shadcn/ui layer in the current version.

## 1. Foundations

### Product Feel

The editor should feel like a compact drawing tool, not a marketing page or a general-purpose design suite. The canvas is the primary workspace. The surrounding UI provides fast mode switching, visible history controls, and lightweight draft status without competing with the drawing surface.

Design priorities:

- Clear active mode at all times.
- Large, calm SVG canvas workspace.
- Tool controls that are easy to scan and use repeatedly.
- Strong distinction between committed objects, draft geometry, hovered targets, active dragging, and disabled controls.
- Low-elevation surfaces so geometry remains the visual focus.

### Token Model

Current styles are defined directly in `src/App.css`. Because the app is small, the CSS file is the source of truth for color, radius, typography, spacing, and SVG visual states.

Rules:

- Keep app chrome mostly neutral.
- Use the red destructive color only for delete-target feedback.
- Reuse the same literal values consistently instead of introducing nearby variants.
- If the UI grows, move repeated values into CSS custom properties before adding a larger design-system layer.

## 2. Color

The current palette is intentionally monochrome with one destructive accent.

| Role | Current value | Usage |
| --- | --- | --- |
| App foreground | `#171717` | Primary text, active buttons, committed geometry, draft geometry |
| App background | `#fafafa` | Page background |
| Surface | `#ffffff` | Toolbar groups and canvas fill |
| Secondary text | `#737373` | Header copy, hints, inactive commands, count chip text |
| Border | `#e5e5e5` | Toolbar groups and canvas border |
| Hover surface | `#f5f5f5` | Inactive button hover |
| Active hover | `#262626` | Active and primary button hover |
| Disabled text | `#a3a3a3` | Disabled command labels |
| Delete accent | `#dc2626` | Delete-mode target stroke |
| Subtle neutral fill | `rgba(23, 23, 23, 0.08)` | Polygon fills and count chip |
| Active neutral fill | `rgba(23, 23, 23, 0.14)` | Hovered/active polygon fill |
| Draft group fill | `rgba(23, 23, 23, 0.04)` | Draft-control toolbar group |

Usage rules:

- App chrome stays quiet and neutral.
- Committed geometry uses the primary foreground color.
- Active, hovered, dragging, and draft states use stronger contrast or stroke width rather than new hues.
- Delete-mode feedback is the only non-neutral color.

## 3. Typography

The current font stack is:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Typography rules:

- Use one sans-serif family for the full interface.
- Create hierarchy with weight, size, spacing, and color rather than multiple fonts.
- Keep UI copy short and operational.
- Do not scale font sizes with viewport width.

| Element | Style |
| --- | --- |
| App title | `1.5rem`, `line-height: 1.2`, weight `650` |
| Header copy and toolbar hint | `14px`, `line-height: 1.45`, secondary color |
| Buttons and chips | `0.875rem`, weight `550`, inherited font family |

## 4. Radius, Shadow, and Motion

| Element | Current treatment |
| --- | --- |
| Buttons and chips | `8px` radius, `36px` minimum height |
| Toolbar groups | `8px` radius, `1px` neutral border |
| Canvas | `8px` radius, `1px` neutral border, soft shadow |
| Canvas shadow | `0 14px 40px rgba(0, 0, 0, 0.08)` |

Motion rules:

- Shape movement must not animate during drag; pointer feedback should stay direct.
- Button hover/focus states can change background, foreground, and outline.
- Avoid decorative motion that does not clarify state or hierarchy.

## 5. Layout and Spacing

The app uses a compact editor shell with three primary zones.

| Region | Purpose | Current implementation |
| --- | --- | --- |
| Header | Product title and compact description | Top of `.app-shell` |
| Toolbar | Mode switching, history, polygon commands, and contextual status | Wrapped row below the header |
| Canvas workspace | SVG drawing surface | Horizontally scrollable panel when viewport is narrower than the canvas |

Desktop layout:

```text
+-------------------------------------------------------+
  Header
  Toolbar: tools, history, polygon commands
  Canvas workspace
+-------------------------------------------------------+
```

Responsive behavior:

- `.app-shell` is constrained to `1024px`, centered, and padded.
- Toolbar groups wrap as space tightens.
- The canvas panel scrolls horizontally below the `900px` canvas width.
- The SVG keeps a stable `900 x 560` document coordinate system through its `viewBox`.
- On viewports below `600px`, shell padding drops from `40px 16px` to `24px 16px`.

Spacing rules:

- Use `gap` on flex containers.
- Preserve stable dimensions for buttons, chips, toolbar groups, and the canvas.
- Keep page sections unframed; use bordered groups only for compact tool clusters.

## 6. Component Conventions

### Toolbar

The toolbar uses native `button` elements and small CSS classes.

- Tool buttons live in a `role="group"` with `aria-label="Drawing tools"`.
- Active mode uses `aria-pressed` plus the `.is-active` class.
- History controls live in a separate `role="group"` with `aria-label="History controls"`.
- Undo and Redo use native `disabled` states.
- Complete and Cancel appear only while a polygon draft exists.
- Complete is disabled until the draft has at least three vertices.
- A count chip displays the draft vertex count.

| Tool | Label | Behavior |
| --- | --- | --- |
| Point | `Point` | Click canvas to create a point |
| Polygon | `Polygon` | Click canvas to add draft vertices |
| Move | `Move` | Drag a point or polygon |
| Delete | `Delete` | Click an object to remove it |

Button class roles:

| Class | Responsibility |
| --- | --- |
| `.tool-button` | Mode switching |
| `.command-button` | Secondary commands such as Undo, Redo, Cancel |
| `.primary-button` | Primary contextual command such as Complete |
| `.count-chip` | Read-only draft status |

### Canvas Surface

The canvas is an SVG element with a `900 x 560` logical coordinate space.

Visual rules:

- White canvas fill.
- Thin neutral border and soft shadow.
- Stable `900px` by `560px` rendered size.
- `touch-action: none` and `user-select: none` for direct pointer editing.
- Cursor changes by mode:
  - Point / Polygon: `crosshair`
  - Move: object-level `grab`
  - Active drag: `grabbing`
  - Delete: object-level `pointer`

### Status Text

The toolbar includes one polite live region with short operational text:

- Active tool hint when no polygon draft exists.
- Draft guidance while the user is adding polygon vertices.

## 7. Shape Visual Language

### Points

- Visible point radius: `7`.
- Hit area radius: `15`.
- Fill: `#171717`.
- Stroke: white by default.
- Active/hover state: thicker dark outline.

### Polygons

- Fill: translucent neutral.
- Stroke: `#171717`.
- Stroke width: `2.5`.
- Vertices: small white circles with neutral stroke.
- Active/hover state: darker translucent fill and thicker outline.

### Draft Polygons

- Draft geometry uses the primary foreground color but remains dashed so it differs from committed polygons.
- Line: dark, dashed, rounded joins and caps.
- Vertices: dark circles with white stroke.
- Draft shapes are non-interactive until completed.

## 8. Interaction States

| State | Visual treatment |
| --- | --- |
| Default tool | Quiet text button |
| Active tool | Filled dark button with strong contrast |
| Hovered tool | Subtle light background |
| Focused tool/button | Visible `:focus-visible` outline |
| Disabled command | Native disabled state with muted text |
| Hovered object | Object active styling |
| Dragging object | Shape preview follows pointer; cursor switches to grabbing |
| Canceled drag | Preview is discarded; committed coordinates and history are unchanged |
| Polygon draft | Dashed temporary geometry and draft toolbar group |
| Delete target | Red stroke on the target shape |

State rules:

- Active mode must be clear without relying on color alone.
- Disabled controls must use native `disabled` where possible.
- Hovered object state must match the object that Move/Delete would affect.
- Shape movement should be direct and unanimated during drag.

## 9. Accessibility

- The header orients the app.
- Toolbar groups expose descriptive `aria-label` values.
- Mode controls are native buttons with `aria-pressed`.
- Undo, Redo, and Complete expose accurate disabled states.
- Cancel appears only while a polygon draft exists.
- The SVG drawing surface uses `role="img"` and `aria-label="Editable vector canvas"`.
- Text labels are visible; there are no icon-only controls.
- Focus states remain visible for keyboard users on toolbar controls.
- The current canvas interaction model is pointer-first. If keyboard canvas editing is added later, the SVG role, focus model, and live status feedback should be revisited together.

## 10. Base Layer Rules

Current global layer:

- `:root` defines foreground, background, font stack, and font rendering.
- `*` receives `box-sizing: border-box`.
- `html`, `body`, and `#root` provide minimum viewport dimensions.
- `button` inherits the app font.
- Focus-visible outlines are defined for toolbar buttons.

## 11. Files

Current files:

| File | Responsibility |
| --- | --- |
| `src/App.css` | Global app styling, toolbar styling, canvas styling, and SVG visual states |
| `src/App.tsx` | Editor shell, pointer-event orchestration, preview drag state |
| `src/editor/EditorToolbar.tsx` | Tool, history, polygon command, and status controls |
| `src/editor/EditorCanvas.tsx` | SVG canvas rendering and visual states |
| `src/editor/editorModel.ts` | Pure geometry, history, hit-testing, coordinate conversion, and state transitions |

Future larger-system equivalents, if the app grows:

| Future area | Responsibility |
| --- | --- |
| CSS custom properties | Shared color, radius, spacing, and shadow tokens |
| `components/ui/*` | Reusable low-level controls, if repeated patterns justify extraction |
| `components/vector-editor/*` | Feature-specific editor UI |

## 12. Extending the System

When adding UI:

- Add repeated values as CSS custom properties before scattering new raw values.
- Keep the effective palette small: neutral shell colors plus delete/error feedback.
- Use the delete accent only for destructive target feedback.
- Prefer native controls and small local components while the project remains minimum-spec.
- Add a framework or icon dependency only when it removes real duplication or unlocks a needed interaction.

When introducing a larger design-system layer:

- Preserve the current visual language before changing primitives.
- Define semantic tokens before replacing component CSS.
- Keep SVG geometry tokens feature-specific rather than folding them into generic app chrome.
- Preserve current accessible names, disabled states, focus states, and mode semantics.

## 13. Current Non-goals

The current design system deliberately does not include:

- Dark mode.
- Theme switching.
- Tailwind CSS runtime.
- shadcn/ui runtime.
- Material UI.
- Emotion styling.
- Token generation.
- Icon-only controls.
- Advanced drawing tools.
- Export UI.

These remain out of scope for the minimum-spec assignment unless the product requirements change.
