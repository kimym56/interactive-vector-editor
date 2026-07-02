# Interactive Vector Editor Design System

This document describes the design system for the Interactive Vector Editor.

The reference system is based on Tailwind CSS v4, shadcn/ui tokens, OKLCH color values, and semantic utility classes. The current project implementation stays intentionally small: React, TypeScript, Vite, SVG, native buttons, lucide icons, and custom CSS in `src/App.css`.

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

The current implementation mirrors that idea with CSS custom properties in `src/App.css`.

Current rules:

- Semantic CSS variables are the source of truth.
- Components consume variables such as `--color-surface`, `--color-primary`, and `--color-border`.
- Literal colors are acceptable only for one-off derived states such as translucent SVG grid lines or shadows.
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

| Semantic token | Reference light | Reference dark | Current CSS variable | Usage |
| --- | --- | --- | --- | --- |
| `background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | `--color-app-bg` | App background |
| `foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | `--color-text` | Primary text |
| `card` / `popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | `--color-surface` | Header, panels, rows, controls |
| `primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | `--color-primary` | Primary command and committed polygon stroke |
| `primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | `--color-surface` | Text/icons on primary commands |
| `secondary` / `muted` / `accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | derived neutral surfaces | Subtle fills, hover states |
| `muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | `--color-muted-text` | Secondary/helper text |
| `destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | future `--color-destructive` | Delete-specific UI, if needed |
| `border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | `--color-border` | Standard dividers and borders |
| `input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | `--color-border-strong` | Stronger control/canvas borders |
| `ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | active/focus outline color | Focus rings |

Rule: component styling should use semantic variables or semantic utility classes. Avoid literal values like `bg-white`, `text-black`, or ad hoc hex values in components.

### Editor Geometry Tokens

These tokens are allowed because they encode drawing state, not general app chrome.

| Current CSS variable | Value | Usage |
| --- | --- | --- |
| `--color-canvas` | `#fbfcfb` | SVG canvas fill |
| `--color-primary` | `#2f6f73` | Polygon stroke and primary command |
| `--color-primary-dark` | `#163f42` | Active polygon stroke |
| `--color-active` | `#f4b24e` | Active tool and polygon vertices |
| `--color-point` | `#e85d4f` | Committed point geometry |
| `--color-draft` | `#b45a9c` | In-progress polygon draft |

Usage rules:

- Keep the app shell neutral and restrained.
- Use teal for committed polygon geometry and the primary Complete action.
- Use amber for active mode and polygon vertices.
- Use red only for point geometry unless a distinct destructive token is added.
- Use purple only for uncommitted polygon drafts.
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
"Avenir Next", "Segoe UI", system-ui, -apple-system, sans-serif
```

Typography rules:

- Use one sans family for the full interface.
- Create hierarchy with weight, size, spacing, and color rather than multiple fonts.
- Keep UI copy short and operational.
- Avoid explanatory paragraphs inside the app.
- Do not scale font sizes with viewport width.

| Element | Style |
| --- | --- |
| App title | `1.2rem`, weight `760`, tight line height |
| Active mode label | `0.88rem`, secondary color |
| Tool labels | `0.72rem`, compact, single line |
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

| CSS variable | Value | Usage |
| --- | --- | --- |
| `--radius-control` | `8px` | Buttons, canvas, rows, metric cards, rail brand |
| `--shadow-canvas` | `0 18px 48px rgba(32, 36, 42, 0.12)` | Canvas separation from app background |
| `--motion-fast` | `160ms ease` | Button, row, border, and shadow transitions |

Motion rules:

- Buttons may transition background, text color, transform, border, and shadow.
- Command buttons may lift by `1px` on hover/focus.
- Shape movement must not animate during drag; pointer feedback must stay direct.
- Avoid decorative motion that does not clarify state or hierarchy.

## 5. Layout and Spacing

The app uses a fixed editor shell with four primary zones.

| Region | Purpose | Current implementation |
| --- | --- | --- |
| Left tool rail | Mode switching | `88px` desktop rail |
| Top bar | Product title, active mode, Undo, Redo, Cancel Draft, Complete | `76px` desktop header |
| Main workspace | SVG drawing surface | Flexible center column |
| Right inspector | Object count, draft count, history depth, object list | `304px` desktop panel |

Desktop layout:

```text
+-----------+-------------------------------+----------------+
  Tool rail   Top bar                         Top bar
              Canvas workspace                Inspector
+-----------+-------------------------------+----------------+
```

Responsive behavior:

- Below `980px`, the inspector moves below the canvas.
- Below `620px`, the tool rail becomes horizontal and the layout stacks vertically.
- The SVG canvas keeps a stable `1000 x 640` coordinate system through its `viewBox`.

Spacing rules:

- Use `gap` on flex and grid containers.
- Prefer stable dimensions for tool buttons, command buttons, metric cards, rows, and the canvas.
- Use scale-based spacing when migrating to Tailwind (`p-4`, `gap-2`, `py-6`) instead of arbitrary one-off values.
- Avoid nested cards and decorative page sections.

## 6. Component Conventions

### Tool Rail

The tool rail is a persistent dark surface for editor mode selection.

- Icons come from `lucide-react`.
- Buttons are native `button` elements.
- Desktop tool buttons are `64px` wide with icon above label.
- Active mode uses a strong filled state.
- Inactive buttons remain quiet and transparent.
- Hover/focus uses a subtle overlay and visible outline.
- Buttons use `aria-pressed` to expose the selected mode.

| Tool | Icon | Behavior |
| --- | --- | --- |
| Point | `CircleDot` | Click canvas to create a point |
| Polygon | `Pentagon` | Click canvas to add draft vertices |
| Move | `Move` | Drag a point or polygon |
| Delete | `Trash2` | Click an object to remove it |

### Top Bar

The top bar orients the user and holds history/finalization commands.

- Left side: app title and active mode text.
- Right side: Undo, Redo, Cancel Draft, Complete.
- Background is semi-opaque white with subtle blur.
- Undo and Redo are disabled when their stacks are empty.
- Cancel Draft is disabled unless Polygon Mode has at least one draft vertex.
- Complete is disabled unless Polygon Mode has at least three draft vertices.

Tailwind/shadcn migration:

- Active primary command maps to shadcn `Button` `default`.
- Inactive commands map to `outline` or `ghost`.
- Delete-specific commands should use `destructive` only when they perform a destructive action directly.

### Canvas Surface

The canvas is an SVG element with a `1000 x 640` logical coordinate space.

Visual rules:

- Off-white canvas fill.
- Light grid pattern every `40` SVG units.
- `8px` radius in the current implementation; `rounded-md` in Tailwind.
- Thin neutral border and soft shadow.
- Cursor changes by mode:
  - Point / Polygon: `crosshair`
  - Move: default, with object-level grab cursor
  - Active drag: grabbing cursor
  - Delete: pointer on pickable objects

### Inspector

The inspector provides lightweight document feedback.

Sections:

- Document metrics: Objects, Draft, Undo, Redo.
- Object list: object index, object type, coordinate or vertex count.

Metric cards and object rows use neutral surfaces, thin borders, compact text, and stable dimensions. They are cards because they are repeated information units, not decorative wrappers.

## 7. Shape Visual Language

### Points

- Visible point radius: `7`.
- Hit area radius: `15`.
- Fill: `--color-point`.
- Stroke: `--color-surface` by default.
- Active/hover state: darker and thicker outline.

### Polygons

- Fill: translucent teal.
- Stroke: `--color-primary`.
- Stroke width: `3`.
- Vertices: small amber circles.
- Active/hover state: deeper fill, darker stroke, thicker vertex outline.

### Draft Polygons

- Draft geometry is visually distinct from committed geometry.
- Line: purple, dashed, rounded joins.
- Vertices: purple circles with white stroke.
- Draft shapes are non-interactive until completed.

## 8. Interaction States

| State | Visual treatment |
| --- | --- |
| Default tool | Transparent dark-rail button |
| Active tool | Filled button with strong contrast |
| Hovered tool | Subtle overlay |
| Focused tool/button | Visible outline using ring/active color |
| Disabled command | Lower opacity and `not-allowed` cursor |
| Hovered object | Inspector row highlight and object active styling |
| Selected object | Same object styling as hover, held through active drag |
| Dragging object | Shape preview follows pointer; history commits on pointer release |
| Polygon draft | Purple dashed temporary geometry |

State rules:

- Active mode must be clear without relying on color alone.
- Disabled controls must use native `disabled` where possible.
- Hovered object state must match the object that Move/Delete would affect.
- Shape movement should be direct and unanimated during drag.

## 9. Accessibility

- `main`, `aside`, `header`, and `section` landmarks structure the app.
- Mode buttons use native `button` elements and `aria-pressed`.
- Undo, Redo, Cancel Draft, and Complete use native `disabled`.
- The SVG drawing surface uses `role="img"` and `aria-label="Editable vector canvas"`.
- Icon buttons include visible text labels.
- Text labels avoid relying on color alone.
- Focus states must remain visible for keyboard users.
- Future shadcn components must preserve accessible names and focus behavior from the current native controls.

## 10. Base Layer Rules

Reference Tailwind/shadcn base layer:

- `*` receives `border-border` and `outline-ring/50`.
- `body` receives `bg-background text-foreground`.
- `html` receives `font-sans`.

Current CSS equivalent:

- Global `box-sizing: border-box`.
- `body` sets app background and removes default margin.
- Buttons inherit font.
- `button:focus-visible` and `svg:focus-visible` provide visible focus rings.

## 11. Files

Current files:

| File | Responsibility |
| --- | --- |
| `src/App.css` | Design tokens, layout, component styles, SVG visual states |
| `src/App.tsx` | Editor shell, tool controls, canvas markup, inspector markup |
| `src/editor/editorModel.ts` | State transitions that drive UI state |

Future Tailwind/shadcn equivalents:

| Future file | Responsibility |
| --- | --- |
| `app/globals.css` or equivalent | OKLCH token definitions, `@theme inline`, base layer |
| `app/layout.tsx` or equivalent | Font wiring, metadata, root theme classes |
| `components/ui/*` | shadcn primitives consuming semantic tokens |
| `components/vector-editor/*` | Feature-specific editor UI |

## 12. Extending the System

When adding UI:

- Add new semantic values as CSS variables before scattering raw color values.
- Keep the effective palette small: neutral shell colors plus editor-specific geometry tokens.
- Add a destructive token only when delete actions need stronger visual emphasis.
- Prefer semantic tokens over raw values so future light/dark themes and rebrands are manageable.
- Prefer native controls and small local components while the project remains minimum-spec.
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
- Material UI.
- Token generation.
- Icon-only controls.
- Advanced drawing tools.
- Export UI.

These remain out of scope for the minimum-spec assignment unless the product requirements change.
