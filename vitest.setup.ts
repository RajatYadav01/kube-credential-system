import "@testing-library/jest-dom/vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { beforeEach, afterEach, expect, vi } from "vitest";

expect.extend(matchers);

// Reset all mock function calls and instances before each test to ensure test isolation.
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
