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

## Testing

```bash
npm test
```

The automated tests cover core editor logic, including point creation, polygon completion, movement coordinate calculations, deletion, Undo/Redo behavior, and redo-stack clearing.

## Production Build

```bash
npm run build
```

## Project Documents

- `docs/PRD.md` - product requirements.
- `docs/DESIGN.md` - UI design direction.
- `AI_PROMPTS.md` - AI usage disclosure and prompt list.

## Submission Notes

When sharing an archive, exclude `node_modules`, `dist`, `build`, and other generated artifacts.

For a public repository, use a generic name and keep the repository description and README wording neutral.
