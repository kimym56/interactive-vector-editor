import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { editorTheme, toolbarControlHeight } from "./designSystem";

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

function expectToolbarControlsToUseSharedHeight() {
  const buttonRoot = editorTheme.components?.MuiButton?.styleOverrides?.root as Record<string, unknown>;
  const toggleButtonRoot = editorTheme.components?.MuiToggleButton?.styleOverrides?.root as Record<string, unknown>;

  expect(toolbarControlHeight).toBe(36);
  expect(buttonRoot.height).toBe(toolbarControlHeight);
  expect(buttonRoot.minHeight).toBe(toolbarControlHeight);
  expect(toggleButtonRoot.height).toBe(toolbarControlHeight);
  expect(toggleButtonRoot.minHeight).toBe(toolbarControlHeight);
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
    expect(screen.getByRole("button", { name: "Complete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel Draft" })).toBeDisabled();

    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });
    expect(screen.getByRole("button", { name: "Cancel Draft" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel Draft" }));
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

  it("presents the Material UI editor chrome with contextual drafting state", () => {
    render(<App />);

    expect(
      screen.getByText("Create points and polygons, move and delete objects, and step through your full edit history with undo and redo.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Drawing tools")).toBeInTheDocument();
    expect(screen.queryByLabelText("Document inspector")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Editor status")).not.toBeInTheDocument();
    expect(screen.getByText("Click to place a point")).toBeInTheDocument();
    expect(screen.getByTestId("toolbar-surface")).not.toHaveStyle({ border: "1px solid #e5e5e5" });
    expect(screen.getByTestId("toolbar-surface")).not.toHaveStyle({ backgroundColor: "#ffffff" });
    expect(screen.getByTestId("canvas-panel")).not.toHaveStyle({ border: "1px solid #e5e5e5" });
    expect(screen.getByTestId("canvas-panel")).not.toHaveStyle({ backgroundColor: "#ffffff" });
    expectToolbarControlsToUseSharedHeight();

    fireEvent.click(screen.getByRole("button", { name: "Polygon" }));
    expect(screen.getByText("Click to add vertices, then Complete")).toBeInTheDocument();

    const canvas = screen.getByLabelText("Editable vector canvas");
    mockCanvasRect(canvas);
    expect(canvas).toHaveAttribute("viewBox", "0 0 900 560");
    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });

    expect(screen.getByText("1 vertex")).toBeInTheDocument();
    expect(screen.getByText("Keep clicking to add vertices.")).toBeInTheDocument();
    expect(screen.getByText("1 vertex").closest(".MuiChip-root")).toBeInTheDocument();
    expectToolbarControlsToUseSharedHeight();
  });
});
