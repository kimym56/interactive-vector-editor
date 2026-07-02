# PRD: Interactive Vector Editor

## 1. Overview

Build a web-based interactive vector editor that lets users create and manipulate geometric objects on a canvas. The project focuses on interaction logic, clear mode-based editing behavior, and a robust Undo/Redo history system.

The first version must support points and polygons, object movement, object deletion, and reversible history for creation, movement, and deletion actions.

## 2. Problem

Users need a simple canvas editor where they can create geometric shapes, change their positions, remove them, and safely reverse mistakes. The core challenge is not a broad design-tool feature set; it is reliable interaction behavior and predictable state transitions.

## 3. Target Users

- Primary user: evaluator or developer testing the project requirements.
- Secondary user: a user who needs a minimal geometry editor for points and polygons.
- Out of scope: production design-tool users who need advanced vector editing, layers, text, boolean operations, or export workflows beyond the requirements below.

## 4. Goals

- Provide a working web canvas for creating points and polygons.
- Support mode-based interactions for Point, Polygon, Move, and Delete modes.
- Maintain Undo/Redo history for creation, movement, and deletion.
- Include automated tests for core logic.
- Document setup, execution, and testing commands in the root README.

## 5. Non-Goals

- Freeform path editing.
- Text editing.
- Shape styling beyond what is required to distinguish objects visually.
- Advanced exports such as SVG, PNG, PDF, or design-tool formats.
- Real-time collaboration.
- Backend persistence or user accounts.
- Keyboard shortcuts, grid or coordinate overlays, and debugging-only object lists.

## 6. Core Functional Requirements

### 6.1 Object Creation

#### Point Mode

- When the editor is in Point Mode, clicking the canvas creates one point at the clicked canvas coordinates.
- The created point must be visible on the canvas.
- Point creation must be recorded in the history stack.

#### Polygon Mode

- When the editor is in Polygon Mode, each canvas click adds one polygon vertex at the clicked canvas coordinates.
- The in-progress polygon should show the vertices added so far.
- The polygon is finalized only when the user clicks a Complete button.
- The Complete button is enabled only when the in-progress polygon has at least three vertices.
- Completing a polygon connects the vertices into a closed shape.
- Polygon creation must be recorded in the history stack after the polygon is completed.

### 6.2 Manipulation And Deletion

#### Move Mode

- When the editor is in Move Mode, users can select and drag an existing point to a new position.
- When the editor is in Move Mode, users can select and drag an existing polygon to a new position.
- Moving a polygon must preserve the relative positions of its vertices.
- Drag-and-drop movement must be recorded as one history entry when the drag completes.

#### Delete Mode

- When the editor is in Delete Mode, clicking an existing point removes it from the canvas.
- When the editor is in Delete Mode, clicking an existing polygon removes it from the canvas.
- Deletion must be recorded in the history stack.

### 6.3 History: Undo And Redo

- The application must maintain a history stack.
- Users must be able to undo actions at any time when undo history exists.
- Users must be able to redo actions at any time when redo history exists.
- Performing a new action after undoing must clear redo history.
- History must cover:
  - Point creation.
  - Polygon creation.
  - Point movement.
  - Polygon movement.
  - Point deletion.
  - Polygon deletion.

## 7. Modes And User Workflows

### Workflow 1: Create A Point

1. User selects Point Mode.
2. User clicks the canvas.
3. A point appears at the clicked coordinates.
4. The action can be undone and redone.

### Workflow 2: Create A Polygon

1. User selects Polygon Mode.
2. User clicks multiple canvas locations to define vertices.
3. The editor displays the in-progress vertices.
4. User clicks Complete.
5. The polygon becomes a closed shape.
6. The action can be undone and redone.

### Workflow 3: Move An Object

1. User selects Move Mode.
2. User clicks or presses an existing point or polygon.
3. User drags the object to a new position.
4. User releases the object.
5. The action can be undone and redone.

### Workflow 4: Delete An Object

1. User selects Delete Mode.
2. User clicks an existing point or polygon.
3. The clicked object is removed from the canvas.
4. The action can be undone and redone.

## 8. MVP Scope

### Must Have

- Web-based canvas.
- Point Mode.
- Polygon Mode.
- Complete button for finalizing polygons.
- Move Mode.
- Delete Mode.
- Undo control.
- Redo control.
- Internal history stack for creation, movement, and deletion.
- Automated tests for core logic.
- Root README with development, installation, execution, and testing instructions.

### Should Have

- Clear visual distinction between points, polygon vertices, polygon outlines, and selected/hovered objects.
- Disabled state for Undo, Redo, and Complete when unavailable.
- Basic hit detection tolerance so small points are practical to select and delete.
- Stable object IDs for reliable history operations.

### Out Of MVP

- Keyboard shortcuts for mode switching, undo, and redo.
- Grid or coordinate display.
- Simple object list for debugging state.

## 9. Requirements

### Functional Requirements

| ID | Requirement | Priority | Notes |
| --- | --- | --- | --- |
| F-001 | Users can switch between Point, Polygon, Move, and Delete modes. | Must | Mode state must control canvas behavior. |
| F-002 | Users can create a point by clicking the canvas in Point Mode. | Must | Point uses clicked canvas coordinates. |
| F-003 | Users can create polygon vertices by clicking the canvas in Polygon Mode. | Must | Vertices remain in progress until completion. |
| F-004 | Users can finalize a polygon with a Complete button. | Must | Final polygon must be closed. |
| F-005 | Users can move a point by dragging it in Move Mode. | Must | Movement is one history action per completed drag. |
| F-006 | Users can move a polygon by dragging it in Move Mode. | Must | All vertices move together. |
| F-007 | Users can delete a point by clicking it in Delete Mode. | Must | Deletion is undoable. |
| F-008 | Users can delete a polygon by clicking it in Delete Mode. | Must | Deletion is undoable. |
| F-009 | Users can undo point and polygon creation. | Must | Applies to completed creations only. |
| F-010 | Users can undo point and polygon movement. | Must | Restores previous coordinates. |
| F-011 | Users can undo point and polygon deletion. | Must | Restores deleted object. |
| F-012 | Users can redo undone creation, movement, and deletion actions. | Must | Redo stack clears after a new action. |

### Non-Functional Requirements

| ID | Requirement | Target |
| --- | --- | --- |
| NF-001 | Canvas interactions feel responsive. | Dragging should update without obvious lag for typical project data sizes. |
| NF-002 | Shape state is deterministic and testable. | Core geometry and history logic should be separated enough to test without browser-only interaction. |
| NF-003 | The app works locally without accounts or backend services. | Local development and browser execution only. |
| NF-004 | Project setup is reproducible. | Node.js version, package manager, and lockfile are documented and committed. |

## 10. Testing Requirements

Automated tests must cover core logic. At minimum, tests should include representative cases for:

- Point creation at a given coordinate.
- Polygon vertex collection and completion.
- Movement coordinate calculations for points.
- Movement coordinate calculations for polygons.
- History stack behavior for create, move, delete, undo, and redo.
- Redo stack clearing after a new action follows an undo.

The root README must specify the exact command for running tests, such as `npm test`.

## 11. Documentation Requirements

The root `README.md` must include:

### Development Environment

- Node.js version used.
- Package manager used: npm, pnpm, or yarn.
- A committed lockfile:
  - `package-lock.json` for npm.
  - `pnpm-lock.yaml` for pnpm.
  - `yarn.lock` for yarn.

### Installation And Execution

- Dependency installation command, such as `npm install`.
- Development server command, such as `npm run dev`.

### Testing

- Automated test command, such as `npm test`.

## 12. AI Usage Policy

AI tools such as ChatGPT, Claude, and GitHub Copilot are permitted.

If AI tools are used, the project must include a separate root-level file named `AI_PROMPTS.md` listing the prompts used.

## 13. Submission Requirements

The final project must be submitted either as a compressed archive or as a public GitHub repository.

For a compressed archive:

- Exclude `node_modules`.
- Exclude generated build artifacts such as `dist` and `build`.
- Ensure `README.md` is at the project root.

For a public GitHub repository:

- Use a generic repository name such as `vector-editor-challenge` or `interactive-canvas-tool`.
- Do not include confidential company names or the words `Assessment`, `Assignment`, `Interview`, or `Test` in the repository name, description, or root README.

## 14. UX Notes

- The UI must make the active mode obvious.
- Canvas clicks must have mode-specific behavior and avoid ambiguous outcomes.
- The Complete button should be available only when Polygon Mode has at least three draft vertices.
- Undo and Redo controls should communicate when no action is available.
- Points should be large enough to click reliably.
- Polygons should be selectable by the filled area and outline. Vertices do not need separate editing behavior.

## 15. Data Model

The implementation should maintain a clear internal document state.

- Document: collection of geometric objects plus active mode and in-progress polygon state.
- Point object: stable ID and coordinate.
- Polygon object: stable ID and ordered vertex coordinates.
- In-progress polygon: ordered vertex coordinates not yet committed as a final object.
- History entry: action type, affected object ID, before state, and after state as needed.
- Undo stack: ordered list of completed reversible actions.
- Redo stack: ordered list of undone actions available for replay.

## 16. Technical Assumptions

- Runtime: Node.js-based web application.
- Package manager: choose one of npm, pnpm, or yarn during setup.
- Lockfile: mandatory and must match the chosen package manager.
- Rendering approach: SVG in the browser.
- State management: must support deterministic Undo/Redo operations.
- Testing: automated tests must run from a documented package script.

## 17. Success Criteria

- A user can create points and polygons on a web-based canvas.
- A user can move points and polygons with drag-and-drop.
- A user can delete points and polygons.
- Undo and Redo work correctly for creation, movement, and deletion.
- Automated tests cover core logic.
- README setup and test instructions are complete.
- `AI_PROMPTS.md` exists if AI tools were used.
- Final submission excludes `node_modules` and generated build artifacts.

## 18. Implementation Decisions

| Topic | Decision |
| --- | --- |
| Polygon selection | Select polygons by filled area and outline. |
| Polygon completion | Enable Complete at three or more vertices. |
| Movement history | Record one history entry per completed drag, not every pointer move. |
| Rendering surface | Use SVG in the browser. |
| Package manager and Node.js version | Use the values documented in the root README. |

## 19. Milestones

| Milestone | Outcome | Status |
| --- | --- | --- |
| PRD updated | Project requirements are captured clearly. | Complete |
| Project setup | Node.js app, package manager, lockfile, and README commands exist. | Not started |
| Core model and tests | Shape and history logic are implemented with automated tests. | Not started |
| Canvas interactions | Modes, creation, movement, deletion, undo, and redo work in the browser. | Not started |
| Final documentation | README and optional `AI_PROMPTS.md` satisfy project requirements. | Not started |
