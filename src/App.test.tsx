import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

afterEach(cleanup);

function mockCanvasRect(element: Element) {
  element.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 900,
      height: 560
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
    expect(getButton("Undo").disabled).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Polygon" }));
    expect(screen.queryByRole("button", { name: "Complete" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();

    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });
    expect(getButton("Complete").disabled).toBe(true);
    expect(getButton("Cancel").disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(getDraftVertexCount(canvas)).toBe(0);

    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });
    fireEvent.pointerDown(canvas, { clientX: 260, clientY: 200 });
    fireEvent.pointerDown(canvas, { clientX: 260, clientY: 260 });

    expect(getButton("Complete").disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Complete" }));

    expect(getPointCount(canvas)).toBe(1);
    expect(getPolygonCount(canvas)).toBe(1);
    expect(getDraftVertexCount(canvas)).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(getPointCount(canvas)).toBe(1);
    expect(getPolygonCount(canvas)).toBe(0);
    expect(getButton("Redo").disabled).toBe(false);

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
    expect(getButton("Redo").disabled).toBe(true);

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

  it("presents the editor chrome with contextual drafting state", () => {
    render(<App />);

    screen.getByText("Create points and polygons, move and delete objects, and step through your full edit history with undo and redo.");
    screen.getByLabelText("Drawing tools");
    screen.getByText("Click to place a point");

    fireEvent.click(screen.getByRole("button", { name: "Polygon" }));
    screen.getByText("Click to add vertices, then Complete");

    const canvas = screen.getByLabelText("Editable vector canvas");
    mockCanvasRect(canvas);
    expect(canvas.getAttribute("viewBox")).toBe("0 0 900 560");
    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });

    screen.getByText("1 vertex");
    screen.getByText("Keep clicking to add vertices.");
  });
});

function getButton(name: string): HTMLButtonElement {
  return screen.getByRole("button", { name }) as HTMLButtonElement;
}
