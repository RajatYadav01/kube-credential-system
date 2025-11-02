import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders navigation and main layout", () => {
    render(<App />);

    expect(screen.getByText(/Kube Credential System/)).toBeInTheDocument();
  });

  it("navigates to issuance page by default", () => {
    render(<App />);

    expect(
      screen.getByText("Create and issue new digital credentials")
    ).toBeInTheDocument();
  });
});
