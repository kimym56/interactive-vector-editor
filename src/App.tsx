import { Box, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type PointerEvent, useState } from "react";
import { EditorCanvas } from "./editor/EditorCanvas";
import { EditorToolbar } from "./editor/EditorToolbar";
import {
  type EditorMode,
  type EditorState,
  type GeometryObject,
  type Point,
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
  translateObject,
  undo
} from "./editor/editorModel";

type DragState = {
  objectId: string;
  start: Point;
  current: Point;
};

const appSubtitle =
  "Create points and polygons, move and delete objects, and step through your full edit history with undo and redo.";

const App = () => {
  const [state, setState] = useState<EditorState>(() => createInitialEditorState());
  const [drag, setDrag] = useState<DragState | null>(null);
  const [draftCursor, setDraftCursor] = useState<Point | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  const previewObjects = getPreviewObjects(state.objects, drag);
  const activeDragObjectId = drag?.objectId ?? null;

  function getDocumentPoint(event: PointerEvent<SVGSVGElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return clientPointToDocumentPoint(rect, { x: event.clientX, y: event.clientY });
  }

  function handleModeChange(mode: EditorMode) {
    setDrag(null);
    setDraftCursor(null);
    setSelectedObjectId(null);
    setHoveredObjectId(null);
    setState((current) => changeMode(current, mode));
  }

  function handleCanvasPointerDown(event: PointerEvent<SVGSVGElement>) {
    const point = getDocumentPoint(event);

    if (state.mode === "point") {
      setState((current) => createPoint(current, point));
      return;
    }

    if (state.mode === "polygon") {
      setDraftCursor(point);
      setState((current) => startPolygonVertex(current, point));
      return;
    }

    if (state.mode === "delete") {
      setState((current) => deleteObjectAt(current, point));
      setSelectedObjectId(null);
      setHoveredObjectId(null);
      return;
    }

    const hit = hitTest(state.objects, point);
    if (!hit) {
      setSelectedObjectId(null);
      setHoveredObjectId(null);
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDrag({
      objectId: hit.id,
      start: point,
      current: point
    });
    setSelectedObjectId(hit.id);
  }

  function handleCanvasPointerMove(event: PointerEvent<SVGSVGElement>) {
    const point = getDocumentPoint(event);

    if (drag) {
      setDrag((current) => (current ? { ...current, current: point } : current));
      return;
    }

    if (state.mode === "polygon" && state.draftPolygon.length > 0) {
      setDraftCursor(point);
      return;
    }

    if (state.mode === "move" || state.mode === "delete") {
      const hit = hitTest(state.objects, point);
      setHoveredObjectId((current) => (current === (hit?.id ?? null) ? current : hit?.id ?? null));
    }
  }

  function handleCanvasPointerUp(event: PointerEvent<SVGSVGElement>) {
    if (!drag) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const delta = getDragDelta(drag);
    setState((current) => moveObject(current, drag.objectId, delta));
    setSelectedObjectId(null);
    setHoveredObjectId(null);
    setDrag(null);
  }

  function handleCanvasPointerCancel(event: PointerEvent<SVGSVGElement>) {
    if (!drag) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setSelectedObjectId(null);
    setHoveredObjectId(null);
    setDrag(null);
  }

  function handleCanvasPointerLeave() {
    if (state.mode === "polygon") {
      setDraftCursor(null);
    }

    if (!drag && hoveredObjectId) {
      setHoveredObjectId(null);
    }
  }

  function handleUndo() {
    setDrag(null);
    setDraftCursor(null);
    setSelectedObjectId(null);
    setHoveredObjectId(null);
    setState((current) => undo(current));
  }

  function handleRedo() {
    setDrag(null);
    setDraftCursor(null);
    setSelectedObjectId(null);
    setHoveredObjectId(null);
    setState((current) => redo(current));
  }

  function handleComplete() {
    setDraftCursor(null);
    setState((current) => completePolygon(current));
  }

  function handleCancelDraft() {
    setDraftCursor(null);
    setState((current) => cancelDraft(current));
  }

  return (
    <AppShell>
      <Stack component="header" spacing={0.5}>
        <Typography variant="h1">Interactive Vector Editor</Typography>
        <Typography color="text.secondary" fontSize={14}>
          {appSubtitle}
        </Typography>
      </Stack>

      <EditorToolbar
        mode={state.mode}
        draftVertexCount={state.draftPolygon.length}
        canCompletePolygon={getCanCompletePolygon(state)}
        canUndo={state.undoStack.length > 0}
        canRedo={state.redoStack.length > 0}
        onModeChange={handleModeChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onComplete={handleComplete}
        onCancelDraft={handleCancelDraft}
      />

      <EditorCanvas
        mode={state.mode}
        isDragging={Boolean(drag)}
        objects={previewObjects}
        draftPolygon={state.draftPolygon}
        draftCursor={draftCursor}
        selectedObjectId={selectedObjectId}
        activeDragObjectId={activeDragObjectId}
        hoveredObjectId={hoveredObjectId}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerCancel}
        onPointerLeave={handleCanvasPointerLeave}
      />
    </AppShell>
  );
};

export default App;

function getPreviewObjects(objects: GeometryObject[], drag: DragState | null): GeometryObject[] {
  if (!drag) {
    return objects;
  }

  const delta = getDragDelta(drag);
  return objects.map((object) => (object.id === drag.objectId ? translateObject(object, delta) : object));
}

function getDragDelta(drag: DragState): Point {
  return {
    x: drag.current.x - drag.start.x,
    y: drag.current.y - drag.start.y
  };
}

const AppShell = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2.5),
  maxWidth: 1024,
  margin: "0 auto",
  padding: theme.spacing(5, 2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3, 2)
  }
}));
