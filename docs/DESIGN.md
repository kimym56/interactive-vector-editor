# Interactive Vector Editor Design System

This document describes the design system for the Interactive Vector Editor.

The reference system is based on Tailwind CSS v4, shadcn/ui tokens, OKLCH color values, and semantic utility classes. The current project implementation stays intentionally small: React, TypeScript, Vite, SVG, Material UI, Emotion styling, and the shared MUI theme in `src/designSystem.ts`.

The design direction below translates the reference system into the current codebase while keeping a clean migration path to Tailwind/shadcn later.

## 1. Foundations

### Product Feel

The editor should feel like a compact drawing tool, not a marketing page or a general-purpose design suite. The canvas is the primary workspace. The surrounding UI should provide fast mode switching, visible history controls, and lightweight document status without competing with the drawing surface.

Design priorities:

- Clear active mode at all times.
- Large, calm SVG canvas workspace.
- Tool controls that are easy to scan and use repeatedly.
- Strong distinction between committed objects, draft geometry, selected objects, hovered targets, active dragging, and disabled controls.
- Low-elevation panels and quiet surfaces so geometry remains the visual focus.

### Token Model

The reference system uses semantic tokens, not literal color utilities. Tailwind/shadcn implementations should define raw OKLCH variables in `:root` and `.dark`, then expose them through `@theme inline` as `--color-*` aliases.

The current implementation mirrors that idea with a compact Material UI theme in `src/designSystem.ts`.

Current rules:

- The Material UI theme is the source of truth for app chrome.
- Components consume `theme.palette`, `theme.shape`, `theme.typography`, and shared constants such as `toolbarControlHeight`.
- Literal colors are acceptable only for one-off SVG-derived states such as translucent grid dots.
- The app shell should stay mostly monochrome; editor geometry may use a small set of feature-specific colors.

### Theming Model

Reference target:

- Light is the default via `:root`.
- Dark can activate through a `.dark` class or `prefers-color-scheme: dark`, unless a `.light` override is present.
- Components never hardcode light or dark values. They consume semantic tokens.

Current implementation:

- Light mode only.
- Dark mode and theme switching are out of scope for the minimum app.
- If dark mode is added, every semantic token must receive both light and dark values before components are changed.

## 2. Color Tokens

The reference palette is intentionally monochrome, with a single non-neutral destructive accent. For this editor, that base remains the shell language, while drawing objects use editor-specific geometry colors because points, polygons, draft geometry, and active state must be visually distinguishable.

### Core Semantic Tokens

These are the tokens to preserve if the app migrates to Tailwind/shadcn.

| Semantic token | Reference light | Reference dark | Current MUI theme value | Usage |
| --- | --- | --- | --- | --- |
| `background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | `palette.background.default` | App background |
| `foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | `palette.text.primary` | Primary text |
| `card` / `popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | `palette.background.paper` | Toolbar groups and canvas surface |
| `primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | `palette.primary.main` | Primary command and active geometry |
| `primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | `palette.primary.contrastText` | Text/icons on primary commands |
| `secondary` / `muted` / `accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | `palette.text.secondary` and derived alpha fills | Helper text and subtle states |
| `muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | `palette.text.secondary` | Secondary/helper text |
| `destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | `palette.error.main` | Delete-mode target state |
| `border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | `palette.divider` | Standard dividers and borders |
| `input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | `palette.divider` | Control/canvas borders |
| `ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | active/focus outline color | Focus rings |

Rule: component styling should use the Material UI theme. Avoid ad hoc hex values in components unless the value is a local SVG rendering detail.

### Editor Geometry Tokens

These tokens are allowed because they encode drawing state, not general app chrome.

| Current theme/source | Value | Usage |
| --- | --- | --- |
| `palette.background.paper` | `#ffffff` | SVG canvas fill |
| `palette.text.primary` | `#171717` | Committed point and polygon geometry |
| `palette.primary.main` | `#171717` | Active/dragging geometry and primary command |
| `palette.error.main` | `#dc2626` | Delete-mode target state |

Usage rules:

- Keep the app shell neutral and restrained.
- Use neutral geometry for committed objects so the editor shell stays quiet.
- Use the primary token for active, hovered, dragging, and draft geometry.
- Use the error token only for delete-mode target feedback.
- Do not add new hues unless they represent a new editor state the user must distinguish.

## 3. Typography

Reference target:

| Role | Token | Font |
| --- | --- | --- |
| Body / UI | `--font-sans` | Geist Sans with fallback |
| Headings | `--font-heading` | Geist Sans |
| Code / mono | `--font-mono` | Geist Mono with fallback |

Current implementation:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Typography rules:

- Use one sans family for the full interface.
- Create hierarchy with weight, size, spacing, and color rather than multiple fonts.
- Keep UI copy short and operational.
- Avoid explanatory paragraphs inside the app.
- Do not scale font sizes with viewport width.

| Element | Style |
| --- | --- |
| App title | `1.5rem`, weight `650`, tight line height |
| Active mode label | `0.88rem`, secondary color |
| Tool labels | Material UI button typography, compact, single line |
| Panel headings | `0.82rem`, uppercase, weight `760` |
| Metric values | `1.22rem`, weight `760` |
| Object metadata | `0.82rem` to `0.86rem` |

## 4. Radius, Shadow, and Motion

Reference target:

```css
--radius: 0.625rem;
```

Tailwind radius utilities derive proportionally from that base:

| Utility | Formula | Approximate value |
| --- | --- | --- |
| `rounded-sm` | `radius * 0.6` | `6px` |
| `rounded-md` | `radius * 0.8` | `8px` |
| `rounded-lg` | `radius` | `10px` |
| `rounded-xl` | `radius * 1.4` | `14px` |
| `rounded-2xl` | `radius * 1.8` | `18px` |
| `rounded-3xl` | `radius * 2.2` | `22px` |
| `rounded-4xl` | `radius * 2.6` | `26px` |

Current implementation:

| Theme/source | Value | Usage |
| --- | --- | --- |
| `theme.shape.borderRadius` | `8px` | Buttons, toolbar groups, canvas |
| Canvas shadow | `0 14px 40px rgba(0, 0, 0, 0.08)` | Canvas separation from app background |
| MUI defaults | Component default transitions | Button and toggle states |

Motion rules:

- Buttons may transition background, text color, transform, border, and shadow.
- Command buttons may lift by `1px` on hover/focus.
- Shape movement must not animate during drag; pointer feedback must stay direct.
- Avoid decorative motion that does not clarify state or hierarchy.

## 5. Layout and Spacing

The app uses a compact editor shell with three primary zones.

| Region | Purpose | Current implementation |
| --- | --- | --- |
| Header | Product title and compact description | Top of app shell |
| Toolbar | Mode switching, history, polygon commands, and contextual status | Wrapped row below header |
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

- The toolbar wraps controls across rows as space tightens.
- The canvas panel scrolls horizontally below `900px` content width.
- The SVG canvas keeps a stable `900 x 560` coordinate system through its `viewBox`.

Spacing rules:

- Use `gap` on flex and grid containers.
- Prefer stable dimensions for tool buttons, command buttons, metric cards, rows, and the canvas.
- Use scale-based spacing when migrating to Tailwind (`p-4`, `gap-2`, `py-6`) instead of arbitrary one-off values.
- Avoid nested cards and decorative page sections.

## 6. Component Conventions

### Toolbar

The toolbar is a compact Material UI surface for repeated editor commands.

- Icons come from `@mui/icons-material`.
- Buttons use Material UI `Button`, `ToggleButton`, and `ToggleButtonGroup`.
- Tool buttons use icon-and-label layout in a wrapping row.
- Active mode uses a strong filled state.
- Inactive buttons remain quiet and transparent.
- Hover/focus uses Material UI component states.
- The exclusive toggle group exposes the selected mode.

| Tool | Icon | Behavior |
| --- | --- | --- |
| Point | `AdjustRounded` | Click canvas to create a point |
| Polygon | `PentagonOutlined` | Click canvas to add draft vertices |
| Move | `OpenWithRounded` | Drag a point or polygon |
| Delete | `DeleteOutlineRounded` | Click an object to remove it |

### History And Polygon Commands

History and polygon finalization commands live in bordered toolbar groups.

- Undo and Redo are disabled when their stacks are empty.
- Cancel appears only when Polygon Mode has at least one draft vertex.
- Complete appears only when Polygon Mode has at least one draft vertex and is disabled until the draft has at least three vertices.
- When a draft exists, the toolbar shows a chip with the current vertex count.

Tailwind/shadcn migration:

- Active primary command maps to shadcn `Button` `default`.
- Inactive commands map to `outline` or `ghost`.
- Delete-specific commands should use `destructive` only when they perform a destructive action directly.

### Canvas Surface

The canvas is an SVG element with a `900 x 560` logical coordinate space.

Visual rules:

- White canvas fill from `palette.background.paper`.
- Light grid pattern every `24` SVG units.
- `8px` radius in the current implementation; `rounded-md` in Tailwind.
- Thin neutral border and soft shadow.
- Cursor changes by mode:
  - Point / Polygon: `crosshair`
  - Move: default, with object-level grab cursor
  - Active drag: grabbing cursor
  - Delete: pointer on pickable objects

### Status Text

The toolbar includes one polite live region with short operational text:

- Active tool hint when no polygon draft exists.
- Draft guidance while the user is adding polygon vertices.

## 7. Shape Visual Language

### Points

- Visible point radius: `7`.
- Hit area radius: `15`.
- Fill: `palette.text.primary`.
- Stroke: `palette.background.paper` by default.
- Active/hover state: thicker `palette.primary.main` outline.

### Polygons

- Fill: translucent neutral.
- Stroke: `palette.text.primary`.
- Stroke width: `2.5`.
- Vertices: small white circles with neutral stroke.
- Active/hover state: primary-tinted fill and thicker primary stroke.

### Draft Polygons

- Draft geometry uses the primary token but remains dashed so it differs from committed polygons.
- Line: primary, dashed, rounded joins.
- Vertices: primary circles with white stroke.
- Draft shapes are non-interactive until completed.

## 8. Interaction States

| State | Visual treatment |
| --- | --- |
| Default tool | Quiet Material UI toggle button |
| Active tool | Filled button with strong contrast |
| Hovered tool | Subtle overlay |
| Focused tool/button | Visible Material UI focus state |
| Disabled command | Material UI disabled state |
| Hovered object | Object active styling |
| Selected object | Same object styling as hover, held through active drag |
| Dragging object | Shape preview follows pointer; history commits on pointer release |
| Canceled drag | Preview is discarded; committed object coordinates and history are unchanged |
| Polygon draft | Primary dashed temporary geometry |

State rules:

- Active mode must be clear without relying on color alone.
- Disabled controls must use native `disabled` where possible.
- Hovered object state must match the object that Move/Delete would affect.
- Shape movement should be direct and unanimated during drag.

## 9. Accessibility

- The header orients the app; toolbar groups expose descriptive `aria-label` values.
- Mode controls use Material UI toggle buttons inside an exclusive toggle group.
- Undo, Redo, and Complete expose accurate disabled states; Cancel appears only while a polygon draft exists.
- The SVG drawing surface uses `role="img"` and `aria-label="Editable vector canvas"`.
- Icon buttons include visible text labels.
- Text labels avoid relying on color alone.
- Focus states must remain visible for keyboard users.
- Future component swaps must preserve accessible names and focus behavior from the current Material UI controls.

## 10. Base Layer Rules

Reference Tailwind/shadcn base layer:

- `*` receives `border-border` and `outline-ring/50`.
- `body` receives `bg-background text-foreground`.
- `html` receives `font-sans`.

Current global layer:

- Global `box-sizing: border-box`.
- `html`, `body`, and `#root` provide minimum viewport dimensions.
- Material UI `CssBaseline` supplies the baseline reset.
- Material UI components provide their own focus states.

## 11. Files

Current files:

| File | Responsibility |
| --- | --- |
| `src/designSystem.ts` | Material UI theme, typography, palette, component defaults, shared control dimensions |
| `src/App.css` | Minimal global box sizing and viewport constraints |
| `src/App.tsx` | Editor shell, pointer-event orchestration, preview drag state |
| `src/editor/EditorToolbar.tsx` | Tool, history, polygon command, and status controls |
| `src/editor/EditorCanvas.tsx` | SVG canvas rendering and visual states |
| `src/editor/editorModel.ts` | Pure geometry, history, hit-testing, and state transitions |

Future Tailwind/shadcn equivalents:

| Future file | Responsibility |
| --- | --- |
| `app/globals.css` or equivalent | OKLCH token definitions, `@theme inline`, base layer |
| `app/layout.tsx` or equivalent | Font wiring, metadata, root theme classes |
| `components/ui/*` | shadcn primitives consuming semantic tokens |
| `components/vector-editor/*` | Feature-specific editor UI |

## 12. Extending the System

When adding UI:

- Add new semantic values to the Material UI theme before scattering raw color values.
- Keep the effective palette small: neutral shell colors plus delete/error feedback.
- Use `palette.error` only when delete actions need stronger visual emphasis.
- Prefer theme tokens over raw values so future light/dark themes and rebrands are manageable.
- Prefer Material UI controls and small local components while the project remains minimum-spec.
- Introduce Tailwind/shadcn only if the app grows enough to justify the dependency and setup cost.

When migrating to Tailwind/shadcn:

- Define each token in both `:root` and `.dark`.
- Alias tokens in `@theme inline` as `--color-*`.
- Replace component CSS literals with semantic utilities.
- Preserve the current SVG geometry tokens as feature tokens rather than folding them into generic app chrome.

## 13. Current Non-goals

The current design system deliberately does not include:

- Dark mode.
- Theme switching.
- Tailwind CSS runtime.
- shadcn/ui runtime.
- Token generation.
- Icon-only controls.
- Advanced drawing tools.
- Export UI.

These remain out of scope for the minimum-spec assignment unless the product requirements change.
