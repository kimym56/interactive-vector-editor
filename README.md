# Interactive Vector Editor

A web-based vector editor for creating and manipulating points and polygons on an SVG canvas. The app supports Point, Polygon, Move, and Delete modes, plus Undo/Redo history for creation, movement, and deletion actions.

## Development Environment

- Node.js: `v25.9.0`
- Package manager: `npm` `11.12.1`
- Lockfile: `package-lock.json`

## Installation

```bash
npm install
```

## Run The App

```bash
npm run dev
```

The development server prints a local URL, typically `http://localhost:5173/`.

## Verification

```bash
npm run check
```

The automated checks cover core editor logic, including point creation, polygon completion, movement coordinate calculations, deletion, Undo/Redo behavior, and redo-stack clearing.

## Production Build

```bash
npm run build
```

## Scope Checklist

- Point and polygon creation.
- Move and delete modes.
- Undo and redo for completed create, move, and delete actions.
- Polygon draft cancelation before completion.
- Deterministic point, polygon outline, then polygon fill picking.
- No backend, accounts, exports, layers, text tools, or collaboration.
- AI usage disclosure: `docs/AI_PROMPTS.md`.

## Submission Notes

When sharing an archive, exclude `node_modules`, `dist`, `build`, and other generated artifacts.

For a public repository, use a generic name and keep the repository description and README wording neutral.
