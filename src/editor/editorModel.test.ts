import { describe, expect, it } from "vitest";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  cancelDraft,
  changeMode,
  clientPointToDocumentPoint,
  completePolygon,
  createInitialEditorState,
  createPoint,
  deleteObjectAt,
  getCanCompletePolygon,
  hitTest,
  moveObject,
  redo,
  startPolygonVertex,
  undo
} from "./editorModel";

describe("editor model", () => {
  it("creates points at document coordinates and records undoable history", () => {
    let state = createInitialEditorState();

    state = createPoint(state, { x: 120, y: 90 });

    expect(state.objects).toEqual([
      { id: "point-1", type: "point", position: { x: 120, y: 90 } }
    ]);
    expect(state.undoStack).toHaveLength(1);
    expect(state.redoStack).toHaveLength(0);

    state = undo(state);
    expect(state.objects).toEqual([]);

    state = redo(state);
    expect(state.objects).toHaveLength(1);
    expect(state.objects[0]?.id).toBe("point-1");
  });

  it("collects, completes, and cancels polygon drafts without draft history", () => {
    let state = createInitialEditorState();

    state = changeMode(state, "polygon");
    state = startPolygonVertex(state, { x: 10, y: 10 });
    state = startPolygonVertex(state, { x: 60, y: 10 });

    expect(getCanCompletePolygon(state)).toBe(false);
    expect(state.draftPolygon).toHaveLength(2);
    expect(state.undoStack).toHaveLength(0);

    state = startPolygonVertex(state, { x: 60, y: 60 });
    expect(getCanCompletePolygon(state)).toBe(true);

    state = cancelDraft(state);
    expect(state.draftPolygon).toEqual([]);
    expect(state.undoStack).toHaveLength(0);

    state = startPolygonVertex(state, { x: 10, y: 10 });
    state = startPolygonVertex(state, { x: 60, y: 10 });
    state = startPolygonVertex(state, { x: 60, y: 60 });
    state = completePolygon(state);

    expect(state.objects).toEqual([
      {
        id: "polygon-1",
        type: "polygon",
        vertices: [
          { x: 10, y: 10 },
          { x: 60, y: 10 },
          { x: 60, y: 60 }
        ]
      }
    ]);
    expect(state.draftPolygon).toEqual([]);
    expect(state.undoStack).toHaveLength(1);

    state = changeMode(startPolygonVertex(state, { x: 5, y: 5 }), "move");
    expect(state.draftPolygon).toEqual([]);
    expect(state.undoStack).toHaveLength(1);
  });

  it("moves points and polygons as one undoable action and ignores no-op movement", () => {
    let state = createInitialEditorState();
    state = createPoint(state, { x: 20, y: 20 });
    state = changeMode(state, "polygon");
    state = startPolygonVertex(state, { x: 100, y: 100 });
    state = startPolygonVertex(state, { x: 140, y: 100 });
    state = startPolygonVertex(state, { x: 140, y: 140 });
    state = completePolygon(state);

    state = moveObject(state, "point-1", { x: 5, y: -10 });
    expect(state.objects[0]).toEqual({
      id: "point-1",
      type: "point",
      position: { x: 25, y: 10 }
    });

    state = moveObject(state, "polygon-1", { x: -10, y: 20 });
    expect(state.objects[1]).toEqual({
      id: "polygon-1",
      type: "polygon",
      vertices: [
        { x: 90, y: 120 },
        { x: 130, y: 120 },
        { x: 130, y: 160 }
      ]
    });

    const historyLength = state.undoStack.length;
    state = moveObject(state, "polygon-1", { x: 0, y: 0 });
    expect(state.undoStack).toHaveLength(historyLength);

    state = undo(state);
    expect(state.objects[1]).toEqual({
      id: "polygon-1",
      type: "polygon",
      vertices: [
        { x: 100, y: 100 },
        { x: 140, y: 100 },
        { x: 140, y: 140 }
      ]
    });
  });

  it("deletes points and polygons through shared hit-test precedence", () => {
    let state = createInitialEditorState();
    state = createPoint(state, { x: 50, y: 50 });
    state = changeMode(state, "polygon");
    state = startPolygonVertex(state, { x: 20, y: 20 });
    state = startPolygonVertex(state, { x: 100, y: 20 });
    state = startPolygonVertex(state, { x: 100, y: 100 });
    state = startPolygonVertex(state, { x: 20, y: 100 });
    state = completePolygon(state);

    expect(hitTest(state.objects, { x: 50, y: 50 })?.id).toBe("point-1");

    state = deleteObjectAt(state, { x: 50, y: 50 });
    expect(state.objects.map((object) => object.id)).toEqual(["polygon-1"]);

    state = undo(state);
    expect(state.objects.map((object) => object.id)).toEqual(["point-1", "polygon-1"]);

    state = deleteObjectAt(state, { x: 80, y: 80 });
    expect(state.objects.map((object) => object.id)).toEqual(["point-1"]);
  });

  it("clears redo history after a new completed action follows undo", () => {
    let state = createInitialEditorState();
    state = createPoint(state, { x: 10, y: 10 });
    state = createPoint(state, { x: 30, y: 30 });

    state = undo(state);
    expect(state.redoStack).toHaveLength(1);

    state = createPoint(state, { x: 60, y: 60 });
    expect(state.redoStack).toHaveLength(0);
    expect(state.objects.map((object) => object.id)).toEqual(["point-1", "point-3"]);
  });

  it("converts browser pointer coordinates into SVG document coordinates", () => {
    const point = clientPointToDocumentPoint(
      {
        left: 50,
        top: 20,
        width: 500,
        height: 320
      },
      { x: 300, y: 180 }
    );

    expect(point).toEqual({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2
    });
  });
});
