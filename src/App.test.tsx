import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

function mockCanvasRect(element: Element) {
  element.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 900,
      bottom: 560,
      width: 900,
      height: 560,
      toJSON: () => ({})
    }) as DOMRect;
}

function getPointCount(canvas: Element) {
  return canvas.querySelectorAll(".point-shape").length;
}

function getPolygonCount(canvas: Element) {
  return canvas.querySelectorAll(".polygon-shape").length;
}

function getDraftVertexCount(canvas: Element) {
  return canvas.querySelectorAll(".draft-shape circle").length;
}

function getDraftPolylinePoints(canvas: Element) {
  return canvas.querySelector(".draft-shape polyline")?.getAttribute("points");
}

function getPointPosition(canvas: Element) {
  const point = canvas.querySelector(".point-core");

  return {
    x: point?.getAttribute("cx"),
    y: point?.getAttribute("cy")
  };
}

describe("App", () => {
  it("supports point creation, polygon completion, canceling drafts, and history controls", () => {
    render(<App />);

    const canvas = screen.getByLabelText("Editable vector canvas");
    mockCanvasRect(canvas);

    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    expect(getPointCount(canvas)).toBe(1);
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Polygon" }));
    expect(screen.queryByRole("button", { name: "Complete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();

    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });
    expect(screen.getByRole("button", { name: "Complete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(getDraftVertexCount(canvas)).toBe(0);

    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });
    fireEvent.pointerDown(canvas, { clientX: 260, clientY: 200 });
    fireEvent.pointerDown(canvas, { clientX: 260, clientY: 260 });

    expect(screen.getByRole("button", { name: "Complete" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Complete" }));

    expect(getPointCount(canvas)).toBe(1);
    expect(getPolygonCount(canvas)).toBe(1);
    expect(getDraftVertexCount(canvas)).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(getPointCount(canvas)).toBe(1);
    expect(getPolygonCount(canvas)).toBe(0);
    expect(screen.getByRole("button", { name: "Redo" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(getPointCount(canvas)).toBe(1);
    expect(getPolygonCount(canvas)).toBe(1);
  });

  it("moves and deletes objects through canvas pointer interactions", () => {
    render(<App />);

    const canvas = screen.getByLabelText("Editable vector canvas");
    mockCanvasRect(canvas);

    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.click(screen.getByRole("button", { name: "Move" }));
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 150, clientY: 140, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 150, clientY: 140, pointerId: 1 });

    expect(getPointPosition(canvas)).toEqual({ x: "150", y: "140" });

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(getPointPosition(canvas)).toEqual({ x: "100", y: "100" });

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(getPointPosition(canvas)).toEqual({ x: "150", y: "140" });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.pointerDown(canvas, { clientX: 150, clientY: 140, pointerId: 1 });
    expect(getPointCount(canvas)).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(getPointPosition(canvas)).toEqual({ x: "150", y: "140" });
  });

  it("cancels active drags without moving objects or recording history", () => {
    render(<App />);

    const canvas = screen.getByLabelText("Editable vector canvas");
    mockCanvasRect(canvas);

    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.click(screen.getByRole("button", { name: "Move" }));
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 180, clientY: 160, pointerId: 1 });
    fireEvent.pointerCancel(canvas, { clientX: 180, clientY: 160, pointerId: 1 });

    expect(getPointPosition(canvas)).toEqual({ x: "100", y: "100" });
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(getPointCount(canvas)).toBe(0);
  });

  it("previews a polygon draft edge from the first vertex to the cursor", () => {
    render(<App />);

    const canvas = screen.getByLabelText("Editable vector canvas");
    mockCanvasRect(canvas);

    fireEvent.click(screen.getByRole("button", { name: "Polygon" }));
    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });
    fireEvent.pointerMove(canvas, { clientX: 260, clientY: 240 });

    expect(getDraftPolylinePoints(canvas)).toBe("200,200 260,240");
  });

  it("presents the Material UI editor chrome with contextual drafting state", () => {
    render(<App />);

    expect(
      screen.getByText("Create points and polygons, move and delete objects, and step through your full edit history with undo and redo.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Drawing tools")).toBeInTheDocument();
    expect(screen.getByText("Click to place a point")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Polygon" }));
    expect(screen.getByText("Click to add vertices, then Complete")).toBeInTheDocument();

    const canvas = screen.getByLabelText("Editable vector canvas");
    mockCanvasRect(canvas);
    expect(canvas).toHaveAttribute("viewBox", "0 0 900 560");
    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });

    expect(screen.getByText("1 vertex")).toBeInTheDocument();
    expect(screen.getByText("Keep clicking to add vertices.")).toBeInTheDocument();
    expect(screen.getByText("1 vertex").closest(".MuiChip-root")).toBeInTheDocument();
  });
});
