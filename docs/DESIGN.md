# Interactive Vector Editor Design System

This document describes the UI design system for the Interactive Vector Editor. The pasted reference system is based on Tailwind CSS v4 and shadcn/ui, but this project intentionally keeps the minimum implementation: React, TypeScript, Vite, SVG, and custom CSS.

The same design-system ideas are applied here through semantic CSS variables in `src/App.css`, native buttons, lucide icons, and a small set of editor-specific components. Tailwind, shadcn/ui, and OKLCH tokens are useful future migration targets, not current dependencies.

## 1. Foundations

### Product Feel

The editor should feel like a compact drawing tool. The canvas is the primary surface, while the surrounding UI provides fast mode switching, visible history controls, and lightweight document status.

Design priorities:

- Clear active mode at all times.
- Large, calm canvas workspace.
- Tool controls that are easy to scan and repeat-use.
- Strong visual distinction between committed objects, draft geometry, selected objects, and disabled controls.
- Minimal styling that can be understood directly from `src/App.css`.

### Token Model

The implementation uses raw CSS custom properties in `:root`.

If this system is later migrated to Tailwind CSS v4, each variable should map to a semantic `--color-*`, radius, shadow, or motion token in a theme layer. Components should continue consuming semantic tokens instead of hardcoded values.

Current rules:

- Light mode only.
- Semantic CSS variables are the source of truth.
- Components should use variables such as `--color-surface` and `--color-primary`.
- Literal colors are acceptable only for one-off derived states such as translucent shadows or SVG grid opacity.

## 2. Color Tokens

The palette is intentionally small and editor-focused. The pasted reference recommends grayscale plus one destructive accent; this app keeps a restrained neutral base, then uses distinct drawing colors so users can distinguish object types and states quickly.

| CSS variable | Value | Usage |
| --- | --- | --- |
| `--color-text` | `#20242a` | Primary text, headings, strong labels |
| `--color-rail` | `#22272d` | Persistent tool rail |
| `--color-app-bg` | `#eef2ef` | Application shell background |
| `--color-canvas` | `#fbfcfb` | SVG canvas fill |
| `--color-surface` | `#ffffff` | Top bar, command buttons, cards, inspector rows |
| `--color-primary` | `#2f6f73` | Brand mark, Complete button, polygon stroke |
| `--color-primary-dark` | `#163f42` | Active polygon stroke |
| `--color-active` | `#f4b24e` | Active mode button and polygon vertices |
| `--color-point` | `#e85d4f` | Committed point geometry |
| `--color-draft` | `#b45a9c` | In-progress polygon draft geometry |
| `--color-secondary-text` | `#65706f` | Active mode subtitle |
| `--color-muted-text` | `#697574` | Metric labels and object metadata |
| `--color-border` | `rgba(32, 36, 42, 0.12)` | Standard dividers and borders |
| `--color-border-strong` | `rgba(32, 36, 42, 0.16)` | Canvas border |

Usage rules:

- Use teal for committed polygon geometry and primary commands.
- Use amber for active tool state and polygon vertices.
- Use red only for point geometry; destructive UI should not reuse point styling unless a delete-specific token is added.
- Use purple only for uncommitted polygon drafts.
- Keep neutral surfaces quiet so canvas objects remain the focus.

### Future Tailwind / shadcn Mapping

If Tailwind and shadcn/ui are introduced later, map the current variables to semantic tokens rather than replacing intent:

| Current intent | Future semantic token |
| --- | --- |
| App background | `background` |
| Primary text | `foreground` |
| Raised panels | `card` / `popover` |
| Primary action | `primary` / `primary-foreground` |
| Subtle fills | `secondary` / `muted` / `accent` |
| Secondary text | `muted-foreground` |
| Delete-specific action | `destructive` |
| Borders and focus | `border` / `input` / `ring` |

## 3. Typography

The UI uses a system-friendly sans stack:

```css
"Avenir Next", "Segoe UI", system-ui, -apple-system, sans-serif
```

Typography should use one family for the full interface. Weight, size, spacing, and color create hierarchy.

| Element | Style |
| --- | --- |
| App title | `1.2rem`, weight `760`, tight line height |
| Active mode label | `0.88rem`, secondary color, capitalized |
| Tool labels | `0.72rem`, compact, single line |
| Panel headings | `0.82rem`, uppercase, weight `760` |
| Metric values | `1.22rem`, weight `760` |
| Object list metadata | `0.82rem` to `0.86rem` |

Guidelines:

- Keep UI copy short and operational.
- Avoid explanatory paragraphs inside the app.
- Use direct labels such as `Point`, `Move`, `Undo`, `Objects`.
- Do not scale font sizes with viewport width.

## 4. Radius, Shadow, and Motion

The current system uses one radius token:

| CSS variable | Value | Usage |
| --- | --- | --- |
| `--radius-control` | `8px` | Buttons, canvas, cards, rows, rail brand |

The reference system uses a base radius and proportional utilities. If the project grows, introduce a single base variable such as `--radius: 10px` and derive small, medium, large, and extra-large radii from it.

Current motion and elevation:

| CSS variable | Value | Usage |
| --- | --- | --- |
| `--shadow-canvas` | `0 18px 48px rgba(32, 36, 42, 0.12)` | Canvas separation from app background |
| `--motion-fast` | `160ms ease` | Button, row, border, and shadow transitions |

Motion rules:

- Buttons may transition background, text color, transform, and shadow.
- Command buttons lift by `1px` on hover/focus.
- Shape changes should not animate during drag; pointer feedback must stay direct.

## 5. Layout and Spacing

The app uses a fixed editor shell with four primary zones.

| Region | Purpose | Current implementation |
| --- | --- | --- |
| Left tool rail | Mode switching | `88px` desktop rail |
| Top bar | Product title, active mode, Undo, Redo, Complete | `76px` desktop header |
| Main workspace | SVG drawing surface | Flexible center column |
| Right inspector | Object count, draft count, history depth, object list | `304px` desktop panel |

Desktop layout:

```text
┌──────────┬───────────────────────────────┬────────────────┐
│ Tool rail│ Top bar                       │ Top bar        │
│          ├───────────────────────────────┼────────────────┤
│          │ Canvas workspace              │ Inspector      │
└──────────┴───────────────────────────────┴────────────────┘
```

Responsive behavior:

- Below `980px`, the inspector moves below the canvas.
- Below `620px`, the tool rail becomes horizontal and the layout stacks vertically.
- The SVG canvas keeps a stable `1000 x 640` coordinate system through its `viewBox`.

Spacing rules:

- Use `gap` on flex and grid containers.
- Prefer stable dimensions for tool buttons, command buttons, metric cards, rows, and the canvas.
- Avoid nested cards and decorative page sections.

## 6. Component Conventions

### Tool Rail

The tool rail is a persistent dark surface for editor mode selection.

- Icons come from `lucide-react`.
- Buttons are `64px` wide with icon above label.
- Active button uses amber fill, dark text, and a subtle amber shadow.
- Inactive buttons are transparent with light text.
- Hover and focus use a translucent white overlay.
- Buttons use `aria-pressed` to expose selected mode.

Tools:

| Tool | Icon | Behavior |
| --- | --- | --- |
| Point | `CircleDot` | Click canvas to create a point |
| Polygon | `Pentagon` | Click canvas to add vertices |
| Move | `Move` | Drag a point or polygon |
| Delete | `Trash2` | Click an object to remove it |

### Top Bar

The top bar orients the user and holds history/finalization commands.

- Left side: app title and active mode text.
- Right side: Undo, Redo, Complete.
- Background is semi-opaque white with blur.
- Undo and Redo are disabled when their stacks are empty.
- Complete is disabled unless Polygon Mode has at least three draft vertices.

### Canvas Surface

The canvas is an SVG element with a `1000 x 640` logical coordinate space.

Visual rules:

- Off-white canvas fill.
- Light grid pattern every `40` SVG units.
- `8px` border radius.
- Thin neutral border and soft shadow.
- Cursor changes by mode:
  - Point / Polygon: `crosshair`
  - Move: default, with object-level grab cursor
  - Delete: `not-allowed`

### Inspector

The inspector provides lightweight document feedback.

Sections:

- Document metrics: Objects, Draft, Undo, Redo.
- Object list: object index, object type, coordinate or vertex count.

Metric cards and object rows use white surfaces, thin borders, `8px` radius, and compact labels for scanning.

## 7. Shape Visual Language

### Points

- Visible point radius: `7`.
- Hit area radius: `15`.
- Fill: `--color-point`.
- Stroke: `--color-surface` by default.
- Active state: dark stroke, thicker outline.

### Polygons

- Fill: translucent teal.
- Stroke: `--color-primary`.
- Stroke width: `3`.
- Vertices: small amber circles.
- Active state: deeper teal fill, darker stroke, thicker vertex outline.

### Draft Polygons

- Draft geometry is visually distinct from committed geometry.
- Line: purple, dashed, rounded joins.
- Vertices: purple circles with white stroke.
- Draft shapes are non-interactive until completed.

## 8. Interaction States

| State | Visual treatment |
| --- | --- |
| Default tool | Transparent dark-rail button |
| Active tool | Amber filled button |
| Hovered tool | Translucent white overlay |
| Focused tool/button | Visible outline using active or primary color |
| Disabled command | Lower opacity and `not-allowed` cursor |
| Hovered object | Inspector row highlight and object active styling |
| Dragging object | Shape preview follows pointer; history commits on pointer release |
| Polygon draft | Purple dashed temporary geometry |

## 9. Accessibility

- `main`, `aside`, `header`, and `section` landmarks structure the app.
- Mode buttons use native `button` elements and `aria-pressed`.
- Undo, Redo, and Complete use native `disabled`.
- The SVG drawing surface uses `role="img"` and `aria-label="Editable vector canvas"`.
- Icon buttons include visible text labels on desktop.
- Text labels avoid relying on color alone.
- Focus states must remain visible for keyboard users.

## 10. Files

| File | Responsibility |
| --- | --- |
| `src/App.css` | Design tokens, layout, component styles, SVG visual states |
| `src/App.tsx` | Editor shell, tool controls, canvas markup, inspector markup |
| `src/editor/editorModel.ts` | State transitions that drive UI states |

Future Tailwind/shadcn equivalents would be:

| Future file | Responsibility |
| --- | --- |
| `app/globals.css` or equivalent | Token definitions, theme aliases, base layer |
| `components/ui/*` | Shared component primitives |
| `components/vector-editor/*` | Feature-specific editor UI |

## 11. Extending the System

When adding UI, follow these rules:

- Add new values as semantic CSS variables before scattering raw color values.
- Keep the effective palette small: neutral surfaces plus editor-specific geometry colors.
- Add a destructive token only when delete actions need stronger visual emphasis.
- Prefer native controls and small local components while the project remains minimum-spec.
- Introduce Tailwind/shadcn only if the app grows enough to justify the extra dependency and setup cost.

## 12. Current Non-goals

The current design system deliberately does not include:

- Dark mode.
- Theme switching.
- Tailwind CSS.
- shadcn/ui.
- Material UI.
- Token generation.
- Icon-only controls.
- Advanced drawing tools.
- Export UI.

These remain out of scope for the minimum-spec assignment unless the product requirements change.
