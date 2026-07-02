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
      right: 1000,
      bottom: 640,
      width: 1000,
      height: 640,
      toJSON: () => ({})
    }) as DOMRect;
}

describe("App", () => {
  it("supports point creation, polygon completion, canceling drafts, and history controls", () => {
    render(<App />);

    const canvas = screen.getByLabelText("Editable vector canvas");
    mockCanvasRect(canvas);

    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    expect(screen.getByText("1 object")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Polygon" }));
    expect(screen.getByRole("button", { name: "Complete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel Draft" })).toBeDisabled();

    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });
    expect(screen.getByRole("button", { name: "Cancel Draft" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel Draft" }));
    expect(screen.getByText("0 draft")).toBeInTheDocument();

    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });
    fireEvent.pointerDown(canvas, { clientX: 260, clientY: 200 });
    fireEvent.pointerDown(canvas, { clientX: 260, clientY: 260 });

    expect(screen.getByRole("button", { name: "Complete" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Complete" }));

    expect(screen.getByText("2 objects")).toBeInTheDocument();
    expect(screen.getByText("0 draft")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByText("1 object")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Redo" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(screen.getByText("2 objects")).toBeInTheDocument();
  });

  it("presents the Material UI editor chrome with contextual drafting state", () => {
    render(<App />);

    expect(screen.getByLabelText("Drawing tools")).toBeInTheDocument();
    expect(screen.getByText("Click to place a point")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Polygon" }));
    expect(screen.getByText("Click to add vertices, then Complete")).toBeInTheDocument();

    const canvas = screen.getByLabelText("Editable vector canvas");
    mockCanvasRect(canvas);
    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });

    expect(screen.getByText("1 vertex")).toBeInTheDocument();
    expect(screen.getByText("Keep clicking to add vertices.")).toBeInTheDocument();
  });
});
