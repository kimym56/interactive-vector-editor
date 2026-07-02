import type { SvgIconComponent } from "@mui/icons-material";
import AdjustRounded from "@mui/icons-material/AdjustRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import OpenWithRounded from "@mui/icons-material/OpenWithRounded";
import PentagonOutlined from "@mui/icons-material/PentagonOutlined";
import RedoRounded from "@mui/icons-material/RedoRounded";
import UndoRounded from "@mui/icons-material/UndoRounded";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { PointerEvent, useMemo, useState } from "react";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  EditorMode,
  EditorState,
  GeometryObject,
  Point,
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
} from "./editor/editorModel";

type ToolDefinition = {
  mode: EditorMode;
  label: string;
  hint: string;
  Icon: SvgIconComponent;
};

type DragState = {
  objectId: string;
  start: Point;
  current: Point;
};

const tools: ToolDefinition[] = [
  { mode: "point", label: "Point", hint: "Click to place a point", Icon: AdjustRounded },
  { mode: "polygon", label: "Polygon", hint: "Click to add vertices, then Complete", Icon: PentagonOutlined },
  { mode: "move", label: "Move", hint: "Drag a point or polygon", Icon: OpenWithRounded },
  { mode: "delete", label: "Delete", hint: "Click an object to remove it", Icon: DeleteOutlineRounded }
];

const modeCopy: Record<EditorMode, string> = {
  point: "Point placement",
  polygon: "Polygon drafting",
  move: "Object movement",
  delete: "Object deletion"
};

export default function App() {
  const [state, setState] = useState<EditorState>(() => createInitialEditorState());
  const [drag, setDrag] = useState<DragState | null>(null);

  const canComplete = getCanCompletePolygon(state);
  const canCancelDraft = state.mode === "polygon" && state.draftPolygon.length > 0;
  const activeTool = tools.find((tool) => tool.mode === state.mode) ?? tools[0];
  const pointCount = state.objects.filter((object) => object.type === "point").length;
  const polygonCount = state.objects.filter((object) => object.type === "polygon").length;
  const previewObjects = useMemo(() => {
    if (!drag) {
      return state.objects;
    }
    const delta = getDragDelta(drag);
    return state.objects.map((object) => (object.id === drag.objectId ? translateForPreview(object, delta) : object));
  }, [drag, state.objects]);

  function getDocumentPoint(event: PointerEvent<SVGSVGElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return clientPointToDocumentPoint(rect, { x: event.clientX, y: event.clientY });
  }

  function handleModeChange(mode: EditorMode | null) {
    if (!mode) {
      return;
    }
    setDrag(null);
    setState((current) => changeMode(current, mode));
  }

  function handleCanvasPointerDown(event: PointerEvent<SVGSVGElement>) {
    const point = getDocumentPoint(event);

    if (state.mode === "point") {
      setState((current) => createPoint(current, point));
      return;
    }

    if (state.mode === "polygon") {
      setState((current) => startPolygonVertex(current, point));
      return;
    }

    if (state.mode === "delete") {
      setState((current) => deleteObjectAt(current, point));
      return;
    }

    const hit = hitTest(state.objects, point);
    if (!hit) {
      setState((current) => ({
        ...current,
        selectedObjectId: null,
        activeDragObjectId: null
      }));
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDrag({
      objectId: hit.id,
      start: point,
      current: point
    });
    setState((current) => ({
      ...current,
      selectedObjectId: hit.id,
      activeDragObjectId: hit.id
    }));
  }

  function handleCanvasPointerMove(event: PointerEvent<SVGSVGElement>) {
    const point = getDocumentPoint(event);

    if (drag) {
      setDrag((current) => (current ? { ...current, current: point } : current));
      return;
    }

    if (state.mode === "move" || state.mode === "delete") {
      const hit = hitTest(state.objects, point);
      setState((current) =>
        current.hoveredObjectId === (hit?.id ?? null)
          ? current
          : {
              ...current,
              hoveredObjectId: hit?.id ?? null
            }
      );
    }
  }

  function handleCanvasPointerUp(event: PointerEvent<SVGSVGElement>) {
    if (!drag) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const delta = getDragDelta(drag);
    setState((current) => ({
      ...moveObject(current, drag.objectId, delta),
      selectedObjectId: null,
      activeDragObjectId: null,
      hoveredObjectId: null
    }));
    setDrag(null);
  }

  function handleCanvasPointerLeave() {
    if (!drag && state.hoveredObjectId) {
      setState((current) => ({ ...current, hoveredObjectId: null }));
    }
  }

  function handleUndo() {
    setDrag(null);
    setState((current) => undo(current));
  }

  function handleRedo() {
    setDrag(null);
    setState((current) => redo(current));
  }

  function handleComplete() {
    setState((current) => completePolygon(current));
  }

  function handleCancelDraft() {
    setState((current) => cancelDraft(current));
  }

  return (
    <AppShell>
      <Stack component="header" spacing={0.5}>
        <Typography variant="h1">Interactive Vector Editor</Typography>
        <Typography color="text.secondary" fontSize={14}>
          {modeCopy[state.mode]}
        </Typography>
      </Stack>

      <ToolbarSurface>
        <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
          <ToolGroup
            exclusive
            value={state.mode}
            aria-label="Drawing tools"
            onChange={(_, mode) => handleModeChange(mode)}
          >
            {tools.map(({ mode, label, Icon }) => (
              <ToggleButton key={mode} value={mode} aria-label={label}>
                <Icon fontSize="small" aria-hidden="true" />
                {label}
              </ToggleButton>
            ))}
          </ToolGroup>

          <ButtonGroupSurface aria-label="History controls">
            <Button
              type="button"
              variant="text"
              color="secondary"
              startIcon={<UndoRounded />}
              onClick={handleUndo}
              disabled={state.undoStack.length === 0}
              aria-label="Undo"
            >
              Undo
            </Button>
            <Button
              type="button"
              variant="text"
              color="secondary"
              startIcon={<RedoRounded />}
              onClick={handleRedo}
              disabled={state.redoStack.length === 0}
              aria-label="Redo"
            >
              Redo
            </Button>
          </ButtonGroupSurface>

          {canCancelDraft && (
            <DraftControls>
              <Chip
                size="small"
                label={`${state.draftPolygon.length} ${state.draftPolygon.length === 1 ? "vertex" : "vertices"}`}
              />
              <Button
                type="button"
                size="small"
                variant="contained"
                startIcon={<CheckRounded />}
                onClick={handleComplete}
                disabled={!canComplete}
                aria-label="Complete"
              >
                Complete
              </Button>
              <Button
                type="button"
                size="small"
                variant="text"
                color="secondary"
                startIcon={<CloseRounded />}
                onClick={handleCancelDraft}
                aria-label="Cancel Draft"
              >
                Cancel Draft
              </Button>
            </DraftControls>
          )}

          {!canCancelDraft && (
            <ButtonGroupSurface aria-label="Polygon commands">
              <Button
                type="button"
                variant="contained"
                startIcon={<CheckRounded />}
                onClick={handleComplete}
                disabled={!canComplete}
                aria-label="Complete"
              >
                Complete
              </Button>
              <Button
                type="button"
                variant="text"
                color="secondary"
                startIcon={<CloseRounded />}
                onClick={handleCancelDraft}
                disabled={!canCancelDraft}
                aria-label="Cancel Draft"
              >
                Cancel Draft
              </Button>
            </ButtonGroupSurface>
          )}
        </Stack>

        <Typography color="text.secondary" fontSize={14} aria-live="polite">
          {canCancelDraft ? "Keep clicking to add vertices." : activeTool.hint}
        </Typography>
      </ToolbarSurface>

      <Workspace>
        <CanvasPanel aria-label="Canvas workspace">
          <EditorCanvas
            className={`editor-canvas--${state.mode}${drag ? " is-dragging" : ""}`}
            role="img"
            aria-label="Editable vector canvas"
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerCancel={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerLeave}
          >
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="rgba(23, 23, 23, 0.12)" />
              </pattern>
            </defs>
            <rect className="canvas-fill" x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
            <rect className="canvas-grid" x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#grid)" />
            {previewObjects.map((object) => (
              <Shape
                key={object.id}
                object={object}
                isActive={object.id === state.selectedObjectId || object.id === state.hoveredObjectId}
                isDragging={object.id === state.activeDragObjectId}
              />
            ))}
            {state.draftPolygon.length > 0 && <DraftPolygon vertices={state.draftPolygon} />}
          </EditorCanvas>
        </CanvasPanel>

        <Inspector component="aside" aria-label="Document inspector">
          <PanelSection>
            <Typography variant="h2">Document</Typography>
            <MetricsGrid>
              <Metric label="Objects" value={`${state.objects.length} ${state.objects.length === 1 ? "object" : "objects"}`} />
              <Metric label="Points" value={String(pointCount)} />
              <Metric label="Polygons" value={String(polygonCount)} />
              <Metric label="Draft" value={`${state.draftPolygon.length} draft`} />
              <Metric label="Undo" value={String(state.undoStack.length)} />
              <Metric label="Redo" value={String(state.redoStack.length)} />
            </MetricsGrid>
          </PanelSection>

          <Divider />

          <PanelSection>
            <Typography variant="h2">Objects</Typography>
            <Stack spacing={1}>
              {state.objects.length === 0 ? (
                <Typography color="text.secondary" fontSize={14}>
                  No objects
                </Typography>
              ) : (
                state.objects.map((object, index) => (
                  <ObjectRow
                    key={object.id}
                    object={object}
                    index={index}
                    isActive={object.id === state.selectedObjectId || object.id === state.hoveredObjectId}
                  />
                ))
              )}
            </Stack>
          </PanelSection>
        </Inspector>
      </Workspace>

      <Stack direction="row" flexWrap="wrap" gap={3} color="text.secondary" fontSize={14}>
        <span>{pointCount} points</span>
        <span>{polygonCount} polygons</span>
      </Stack>
    </AppShell>
  );
}

function Shape({ object, isActive, isDragging }: { object: GeometryObject; isActive: boolean; isDragging: boolean }) {
  if (object.type === "point") {
    return (
      <g className={shapeClassName("point-shape", isActive, isDragging)}>
        <circle className="point-hit-area" cx={object.position.x} cy={object.position.y} r="15" />
        <circle className="point-core" cx={object.position.x} cy={object.position.y} r="7" />
      </g>
    );
  }

  const points = object.vertices.map((point) => `${point.x},${point.y}`).join(" ");
  return (
    <g className={shapeClassName("polygon-shape", isActive, isDragging)}>
      <polygon className="polygon-fill" points={points} />
      <polygon className="polygon-outline" points={points} />
      {object.vertices.map((vertex, index) => (
        <circle key={`${object.id}-vertex-${index}`} className="polygon-vertex" cx={vertex.x} cy={vertex.y} r="5" />
      ))}
    </g>
  );
}

function DraftPolygon({ vertices }: { vertices: Point[] }) {
  const polylinePoints = vertices.map((point) => `${point.x},${point.y}`).join(" ");
  return (
    <g className="draft-shape">
      <polyline points={polylinePoints} />
      {vertices.map((vertex, index) => (
        <circle key={`${vertex.x}-${vertex.y}-${index}`} cx={vertex.x} cy={vertex.y} r="6" />
      ))}
    </g>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <MetricTile>
      <Typography component="span" color="text.secondary" fontSize={12}>
        {label}
      </Typography>
      <Typography component="strong" fontSize={15} fontWeight={650}>
        {value}
      </Typography>
    </MetricTile>
  );
}

function ObjectRow({ object, index, isActive }: { object: GeometryObject; index: number; isActive: boolean }) {
  const detail =
    object.type === "point"
      ? `${Math.round(object.position.x)}, ${Math.round(object.position.y)}`
      : `${object.vertices.length} vertices`;

  return (
    <ObjectTile data-active={isActive ? "true" : "false"}>
      <Typography component="span" color="text.secondary" fontSize={13}>
        {index + 1}
      </Typography>
      <Box>
        <Typography fontSize={14} fontWeight={650}>
          {object.type === "point" ? "Point" : "Polygon"}
        </Typography>
        <Typography color="text.secondary" fontSize={12}>
          {detail}
        </Typography>
      </Box>
    </ObjectTile>
  );
}

function getDragDelta(drag: DragState): Point {
  return {
    x: drag.current.x - drag.start.x,
    y: drag.current.y - drag.start.y
  };
}

function translateForPreview(object: GeometryObject, delta: Point): GeometryObject {
  if (object.type === "point") {
    return {
      ...object,
      position: {
        x: object.position.x + delta.x,
        y: object.position.y + delta.y
      }
    };
  }

  return {
    ...object,
    vertices: object.vertices.map((vertex) => ({
      x: vertex.x + delta.x,
      y: vertex.y + delta.y
    }))
  };
}

function shapeClassName(base: string, isActive: boolean, isDragging: boolean): string {
  return [base, isActive ? "is-active" : "", isDragging ? "is-dragging" : ""].filter(Boolean).join(" ");
}

const AppShell = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2.5),
  maxWidth: 1240,
  margin: "0 auto",
  padding: theme.spacing(5, 3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3, 2)
  }
}));

const ToolbarSurface = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(1.25),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper
}));

const ToolGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  maxWidth: "100%",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  "& .MuiToggleButtonGroup-grouped": {
    margin: 0,
    borderRadius: theme.shape.borderRadius
  }
}));

const ButtonGroupSurface = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: theme.spacing(0.5),
  maxWidth: "100%",
  padding: theme.spacing(0.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper
}));

const DraftControls = styled(ButtonGroupSurface)(({ theme }) => ({
  borderColor: alpha(theme.palette.primary.main, 0.28),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  "& .MuiChip-root": {
    height: 28,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.text.secondary
  }
}));

const Workspace = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 280px",
  gap: theme.spacing(2.5),
  alignItems: "stretch",
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr"
  }
}));

const CanvasPanel = styled(Paper)(({ theme }) => ({
  minWidth: 0,
  overflow: "auto",
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper
}));

const EditorCanvas = styled("svg")(({ theme }) => ({
  display: "block",
  width: "100%",
  aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
  minWidth: 0,
  maxHeight: "calc(100vh - 270px)",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: `0 14px 40px ${alpha(theme.palette.common.black, 0.08)}`,
  touchAction: "none",
  userSelect: "none",
  "&.editor-canvas--point, &.editor-canvas--polygon": {
    cursor: "crosshair"
  },
  "&.editor-canvas--move": {
    cursor: "default"
  },
  "&.editor-canvas--move .point-shape, &.editor-canvas--move .polygon-shape": {
    cursor: "grab"
  },
  "&.editor-canvas--move.is-dragging, &.editor-canvas--move .is-dragging": {
    cursor: "grabbing"
  },
  "&.editor-canvas--delete .point-shape, &.editor-canvas--delete .polygon-shape": {
    cursor: "pointer"
  },
  "& .canvas-fill": {
    fill: theme.palette.background.paper
  },
  "& .canvas-grid": {
    opacity: 0.95
  },
  "& .point-hit-area": {
    fill: "transparent"
  },
  "& .point-core": {
    fill: theme.palette.text.primary,
    stroke: theme.palette.background.paper,
    strokeWidth: 3
  },
  "& .point-shape.is-active .point-core, & .point-shape.is-dragging .point-core": {
    stroke: theme.palette.primary.main,
    strokeWidth: 5
  },
  "& .polygon-fill": {
    fill: alpha(theme.palette.text.primary, 0.08)
  },
  "& .polygon-outline": {
    fill: "none",
    stroke: theme.palette.text.primary,
    strokeLinejoin: "round",
    strokeWidth: 2.5
  },
  "& .polygon-vertex": {
    fill: theme.palette.background.paper,
    stroke: theme.palette.text.primary,
    strokeWidth: 2
  },
  "& .polygon-shape.is-active .polygon-fill, & .polygon-shape.is-dragging .polygon-fill": {
    fill: alpha(theme.palette.primary.main, 0.14)
  },
  "& .polygon-shape.is-active .polygon-outline, & .polygon-shape.is-dragging .polygon-outline": {
    stroke: theme.palette.primary.main,
    strokeWidth: 3.5
  },
  "&.editor-canvas--delete .polygon-shape.is-active .polygon-outline, &.editor-canvas--delete .point-shape.is-active .point-core": {
    stroke: theme.palette.error.main
  },
  "& .draft-shape polyline": {
    fill: "none",
    stroke: theme.palette.primary.main,
    strokeWidth: 2.5,
    strokeLinejoin: "round",
    strokeLinecap: "round",
    strokeDasharray: "6 4"
  },
  "& .draft-shape circle": {
    fill: theme.palette.primary.main,
    stroke: theme.palette.background.paper,
    strokeWidth: 2
  }
}));

const Inspector = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper
}));

const PanelSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5)
}));

const MetricsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: theme.spacing(1)
}));

const MetricTile = styled(Box)(({ theme }) => ({
  minHeight: 58,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 2,
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#fafafa"
}));

const ObjectTile = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "24px 1fr",
  gap: theme.spacing(1),
  alignItems: "center",
  minHeight: 54,
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#fafafa",
  '&[data-active="true"]': {
    borderColor: alpha(theme.palette.primary.main, 0.45),
    backgroundColor: alpha(theme.palette.primary.main, 0.04)
  }
}));
