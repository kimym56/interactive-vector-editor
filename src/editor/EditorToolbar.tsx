import type { EditorMode } from "./editorModel";

type EditorToolbarProps = {
  mode: EditorMode;
  draftVertexCount: number;
  canCompletePolygon: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onModeChange: (mode: EditorMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  onComplete: () => void;
  onCancelDraft: () => void;
};

const tools = [
  { mode: "point", label: "Point", hint: "Click to place a point" },
  { mode: "polygon", label: "Polygon", hint: "Click to add vertices, then Complete" },
  { mode: "move", label: "Move", hint: "Drag a point or polygon" },
  { mode: "delete", label: "Delete", hint: "Click an object to remove it" }
] as const;

export const EditorToolbar = ({
  mode,
  draftVertexCount,
  canCompletePolygon,
  canUndo,
  canRedo,
  onModeChange,
  onUndo,
  onRedo,
  onComplete,
  onCancelDraft
}: EditorToolbarProps) => {
  const isDrafting = mode === "polygon" && draftVertexCount > 0;
  const activeTool = tools.find((tool) => tool.mode === mode)!;

  return (
    <section className="toolbar">
      <div className="toolbar-row">
        <div className="toolbar-group" role="group" aria-label="Drawing tools">
          {tools.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              className={`tool-button${activeTool.mode === mode ? " is-active" : ""}`}
              aria-pressed={activeTool.mode === mode}
              onClick={() => onModeChange(mode)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="toolbar-group" role="group" aria-label="History controls">
          <button
            type="button"
            className="command-button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            Undo
          </button>
          <button
            type="button"
            className="command-button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            Redo
          </button>
        </div>

        {isDrafting && (
          <div className="toolbar-group draft-controls">
            <span className="count-chip">
              {draftVertexCount} {draftVertexCount === 1 ? "vertex" : "vertices"}
            </span>
            <button
              type="button"
              className="primary-button"
              onClick={onComplete}
              disabled={!canCompletePolygon}
              aria-label="Complete"
            >
              Complete
            </button>
            <button
              type="button"
              className="command-button"
              onClick={onCancelDraft}
              aria-label="Cancel"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <p className="toolbar-hint" aria-live="polite">
        {isDrafting ? "Keep clicking to add vertices." : activeTool.hint}
      </p>
    </section>
  );
};
