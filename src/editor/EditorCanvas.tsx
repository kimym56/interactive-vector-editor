import type { PointerEventHandler } from "react";
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
  draftCursor: Point | null;
  activeDragObjectId: string | null;
  hoveredObjectId: string | null;
  onPointerDown: PointerEventHandler<SVGSVGElement>;
  onPointerMove: PointerEventHandler<SVGSVGElement>;
  onPointerUp: PointerEventHandler<SVGSVGElement>;
  onPointerCancel: PointerEventHandler<SVGSVGElement>;
  onPointerLeave: PointerEventHandler<SVGSVGElement>;
};

export const EditorCanvas = ({
  mode,
  isDragging,
  objects,
  draftPolygon,
  draftCursor,
  activeDragObjectId,
  hoveredObjectId,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave
}: EditorCanvasProps) => {
  return (
    <div className="canvas-panel" aria-label="Canvas workspace">
      <svg
        className={`editor-canvas editor-canvas--${mode}${isDragging ? " is-dragging" : ""}`}
        role="img"
        aria-label="Editable vector canvas"
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerLeave}
      >
        <rect className="canvas-fill" x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
        {objects.map((object) => (
          <Shape
            key={object.id}
            object={object}
            isActive={object.id === activeDragObjectId || object.id === hoveredObjectId}
            isDragging={object.id === activeDragObjectId}
          />
        ))}
        {draftPolygon.length > 0 && <DraftPolygon vertices={draftPolygon} cursor={draftCursor} />}
      </svg>
    </div>
  );
};

const Shape = ({ object, isActive, isDragging }: { object: GeometryObject; isActive: boolean; isDragging: boolean }) => {
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
};

const DraftPolygon = ({ vertices, cursor }: { vertices: Point[]; cursor: Point | null }) => {
  const previewVertices = cursor ? [...vertices, cursor] : vertices;

  return (
    <g className="draft-shape">
      <polyline points={toSvgPoints(previewVertices)} />
      {vertices.map((vertex, index) => (
        <circle key={`${vertex.x}-${vertex.y}-${index}`} cx={vertex.x} cy={vertex.y} r="6" />
      ))}
    </g>
  );
};

const toSvgPoints = (points: Point[]): string => {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
};

const shapeClassName = (base: string, isActive: boolean, isDragging: boolean): string => {
  return [base, isActive ? "is-active" : "", isDragging ? "is-dragging" : ""].filter(Boolean).join(" ");
};
