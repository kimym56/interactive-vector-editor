export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 560;
export const POINT_HIT_RADIUS = 15;
export const POLYGON_OUTLINE_HIT_RADIUS = 10;

export type EditorMode = "point" | "polygon" | "move" | "delete";

export type Point = {
  x: number;
  y: number;
};

export type PointObject = {
  id: string;
  type: "point";
  position: Point;
};

export type PolygonObject = {
  id: string;
  type: "polygon";
  vertices: Point[];
};

export type GeometryObject = PointObject | PolygonObject;

type HistoryAction =
  | {
      type: "create";
      object: GeometryObject;
    }
  | {
      type: "delete";
      object: GeometryObject;
      index: number;
    }
  | {
      type: "move";
      before: GeometryObject;
      after: GeometryObject;
    };

export type EditorState = {
  mode: EditorMode;
  objects: GeometryObject[];
  draftPolygon: Point[];
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
  nextPointId: number;
  nextPolygonId: number;
};

export type HitTarget = {
  id: string;
};

export type ClientRectLike = Pick<DOMRect, "left" | "top" | "width" | "height">;

export function createInitialEditorState(): EditorState {
  return {
    mode: "point",
    objects: [],
    draftPolygon: [],
    undoStack: [],
    redoStack: [],
    nextPointId: 1,
    nextPolygonId: 1
  };
}

export function changeMode(state: EditorState, mode: EditorMode): EditorState {
  return {
    ...state,
    mode,
    draftPolygon: state.mode === "polygon" && mode !== "polygon" ? [] : state.draftPolygon
  };
}

export function createPoint(state: EditorState, position: Point): EditorState {
  const object: PointObject = {
    id: `point-${state.nextPointId}`,
    type: "point",
    position
  };

  return pushHistory(
    {
      ...state,
      objects: [...state.objects, object],
      nextPointId: state.nextPointId + 1
    },
    { type: "create", object }
  );
}

export function startPolygonVertex(state: EditorState, vertex: Point): EditorState {
  return {
    ...state,
    draftPolygon: [...state.draftPolygon, vertex]
  };
}

export function getCanCompletePolygon(state: EditorState): boolean {
  return state.mode === "polygon" && state.draftPolygon.length >= 3;
}

export function completePolygon(state: EditorState): EditorState {
  if (!getCanCompletePolygon(state)) {
    return state;
  }

  const object: PolygonObject = {
    id: `polygon-${state.nextPolygonId}`,
    type: "polygon",
    vertices: state.draftPolygon
  };

  return pushHistory(
    {
      ...state,
      objects: [...state.objects, object],
      draftPolygon: [],
      nextPolygonId: state.nextPolygonId + 1
    },
    { type: "create", object }
  );
}

export function cancelDraft(state: EditorState): EditorState {
  return {
    ...state,
    draftPolygon: []
  };
}

export function moveObject(state: EditorState, objectId: string, delta: Point): EditorState {
  if (delta.x === 0 && delta.y === 0) {
    return state;
  }

  const before = state.objects.find((object) => object.id === objectId);
  if (!before) {
    return state;
  }

  const after = translateObject(before, delta);
  const objects = state.objects.map((object) => (object.id === objectId ? after : object));

  return pushHistory(
    {
      ...state,
      objects
    },
    { type: "move", before, after }
  );
}

export function deleteObjectAt(state: EditorState, point: Point): EditorState {
  const hit = hitTest(state.objects, point);
  if (!hit) {
    return state;
  }

  const index = state.objects.findIndex((object) => object.id === hit.id);
  if (index === -1) {
    return state;
  }

  const object = state.objects[index];
  const objects = state.objects.filter((candidate) => candidate.id !== hit.id);

  return pushHistory(
    {
      ...state,
      objects
    },
    { type: "delete", object, index }
  );
}

export function undo(state: EditorState): EditorState {
  const action = state.undoStack.at(-1);
  if (!action) {
    return state;
  }

  return {
    ...applyUndoAction(state, action),
    undoStack: state.undoStack.slice(0, -1),
    redoStack: [...state.redoStack, action]
  };
}

export function redo(state: EditorState): EditorState {
  const action = state.redoStack.at(-1);
  if (!action) {
    return state;
  }

  return {
    ...applyRedoAction(state, action),
    undoStack: [...state.undoStack, action],
    redoStack: state.redoStack.slice(0, -1)
  };
}

export function hitTest(objects: GeometryObject[], point: Point): HitTarget | null {
  return (
    findPointHit(objects, point) ??
    findPolygonOutlineHit(objects, point) ??
    findPolygonFillHit(objects, point)
  );
}

export function clientPointToDocumentPoint(rect: ClientRectLike, clientPoint: Point): Point {
  return {
    x: clamp(((clientPoint.x - rect.left) / rect.width) * CANVAS_WIDTH, 0, CANVAS_WIDTH),
    y: clamp(((clientPoint.y - rect.top) / rect.height) * CANVAS_HEIGHT, 0, CANVAS_HEIGHT)
  };
}

function pushHistory(state: EditorState, action: HistoryAction): EditorState {
  return {
    ...state,
    undoStack: [...state.undoStack, action],
    redoStack: []
  };
}

function applyUndoAction(state: EditorState, action: HistoryAction): EditorState {
  switch (action.type) {
    case "create":
      return {
        ...state,
        objects: state.objects.filter((object) => object.id !== action.object.id)
      };
    case "delete": {
      const objects = [...state.objects];
      objects.splice(action.index, 0, action.object);
      return { ...state, objects };
    }
    case "move":
      return {
        ...state,
        objects: state.objects.map((object) =>
          object.id === action.before.id ? action.before : object
        )
      };
  }
}

function applyRedoAction(state: EditorState, action: HistoryAction): EditorState {
  switch (action.type) {
    case "create":
      return {
        ...state,
        objects: [...state.objects, action.object]
      };
    case "delete":
      return {
        ...state,
        objects: state.objects.filter((object) => object.id !== action.object.id)
      };
    case "move":
      return {
        ...state,
        objects: state.objects.map((object) =>
          object.id === action.after.id ? action.after : object
        )
      };
  }
}

export function translateObject(object: GeometryObject, delta: Point): GeometryObject {
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

function findPointHit(objects: GeometryObject[], point: Point): HitTarget | null {
  for (let index = objects.length - 1; index >= 0; index -= 1) {
    const object = objects[index];
    if (object.type === "point" && distance(object.position, point) <= POINT_HIT_RADIUS) {
      return { id: object.id };
    }
  }
  return null;
}

function findPolygonOutlineHit(objects: GeometryObject[], point: Point): HitTarget | null {
  for (let index = objects.length - 1; index >= 0; index -= 1) {
    const object = objects[index];
    if (object.type === "polygon" && isNearPolygonOutline(object.vertices, point)) {
      return { id: object.id };
    }
  }
  return null;
}

function findPolygonFillHit(objects: GeometryObject[], point: Point): HitTarget | null {
  for (let index = objects.length - 1; index >= 0; index -= 1) {
    const object = objects[index];
    if (object.type === "polygon" && isPointInPolygon(object.vertices, point)) {
      return { id: object.id };
    }
  }
  return null;
}

function isNearPolygonOutline(vertices: Point[], point: Point): boolean {
  if (vertices.length < 2) {
    return false;
  }

  return vertices.some(
    (vertex, index) =>
      distanceToSegment(point, vertex, vertices[(index + 1) % vertices.length]) <= POLYGON_OUTLINE_HIT_RADIUS
  );
}

function isPointInPolygon(vertices: Point[], point: Point): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i, i += 1) {
    const current = vertices[i];
    const previous = vertices[j];
    const intersects =
      current.y > point.y !== previous.y > point.y &&
      point.x < ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y) + current.x;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return distance(point, start);
  }

  const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
  return distance(point, {
    x: start.x + t * dx,
    y: start.y + t * dy
  });
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
