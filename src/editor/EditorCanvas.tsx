import type { PointerEventHandler } from "react";
import { Box } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  type EditorMode,
  type GeometryObject,
  type Point
} from "./editorModel";

type EditorCanvasProps = {
  mode: EditorMode;
  isDragging: boolean;
  objects: GeometryObject[];
  draftPolygon: Point[];
  selectedObjectId: string | null;
  activeDragObjectId: string | null;
  hoveredObjectId: string | null;
  onPointerDown: PointerEventHandler<SVGSVGElement>;
  onPointerMove: PointerEventHandler<SVGSVGElement>;
  onPointerUp: PointerEventHandler<SVGSVGElement>;
  onPointerCancel: PointerEventHandler<SVGSVGElement>;
  onPointerLeave: PointerEventHandler<SVGSVGElement>;
};

export function EditorCanvas({
  mode,
  isDragging,
  objects,
  draftPolygon,
  selectedObjectId,
  activeDragObjectId,
  hoveredObjectId,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave
}: EditorCanvasProps) {
  return (
    <Workspace>
      <CanvasPanel aria-label="Canvas workspace" data-testid="canvas-panel">
        <CanvasSvg
          className={`editor-canvas--${mode}${isDragging ? " is-dragging" : ""}`}
          role="img"
          aria-label="Editable vector canvas"
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={onPointerLeave}
        >
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(23, 23, 23, 0.12)" />
            </pattern>
          </defs>
          <rect className="canvas-fill" x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
          <rect className="canvas-grid" x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#grid)" />
          {objects.map((object) => (
            <Shape
              key={object.id}
              object={object}
              isActive={object.id === selectedObjectId || object.id === hoveredObjectId}
              isDragging={object.id === activeDragObjectId}
            />
          ))}
          {draftPolygon.length > 0 && <DraftPolygon vertices={draftPolygon} />}
        </CanvasSvg>
      </CanvasPanel>
    </Workspace>
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

  const points = toSvgPoints(object.vertices);
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
  return (
    <g className="draft-shape">
      <polyline points={toSvgPoints(vertices)} />
      {vertices.map((vertex, index) => (
        <circle key={`${vertex.x}-${vertex.y}-${index}`} cx={vertex.x} cy={vertex.y} r="6" />
      ))}
    </g>
  );
}

function toSvgPoints(points: Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function shapeClassName(base: string, isActive: boolean, isDragging: boolean): string {
  return [base, isActive ? "is-active" : "", isDragging ? "is-dragging" : ""].filter(Boolean).join(" ");
}

const Workspace = styled(Box)(() => ({
  display: "block",
  minWidth: 0
}));

const CanvasPanel = styled(Box)(() => ({
  width: "100%",
  minWidth: 0,
  overflow: "auto",
  padding: 0
}));

const CanvasSvg = styled("svg")(({ theme }) => ({
  display: "block",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  flexShrink: 0,
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
