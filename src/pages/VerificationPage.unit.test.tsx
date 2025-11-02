import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { VerificationPage } from "./VerificationPage";

vi.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;

describe("VerificationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the verification form correctly", () => {
    render(<VerificationPage />);

    expect(screen.getByText("Verify Credential")).toBeInTheDocument();
    expect(screen.getByLabelText(/subject id/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verify/i })).toBeInTheDocument();
  });

  it("shows validation error when subject ID is empty", async () => {
    render(<VerificationPage />);

    const submitButton = screen.getByRole("button", {
      name: /verify/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/subject id is required/i)).toBeInTheDocument();
    });
  });

  it("submits the form with valid subject ID", async () => {
    const mockResponse = {
      verified: true,
      credentialId: "test-abc-123",
      issuedAt: "2023-01-01T00:00:00Z",
      workerId: "worker-1",
      verifiedBy: "worker-2",
    };

    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      data: mockResponse,
    });

    render(<VerificationPage />);

    fireEvent.change(screen.getByLabelText(/subject id/i), {
      target: { value: "test-id-123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/verification/verify"),
        expect.objectContaining({
          subjectId: "test-id-123",
        }),
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });
  });

  it("displays success result for verified credential", async () => {
    const mockResponse = {
      verified: true,
      credentialId: "test-abc-123",
      subjectId: "test-id-123",
      issuedAt: "2023-01-01T00:00:00Z",
      workerId: "worker-1",
      verifiedBy: "worker-2",
      message: "Credential verified by worker-2",
    };

    mockedAxios.post.mockResolvedValueOnce({
      status: 200,
      data: mockResponse,
    });

    render(<VerificationPage />);

    fireEvent.change(screen.getByLabelText(/subject id/i), {
      target: { value: "test-id-123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByText(/credential verified/i)).toBeInTheDocument();
      expect(screen.getByText(/worker-2/i)).toBeInTheDocument();
    });
  });

  it("displays not found result for unknown credential", async () => {
    const mockResponse = {
      verified: false,
      message: "Credential not found",
    };

    mockedAxios.post.mockResolvedValueOnce({
      status: 404,
      data: mockResponse,
    });

    render(<VerificationPage />);

    fireEvent.change(screen.getByLabelText(/subject id/i), {
      target: { value: "unknown-id" },
    });

    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByText(/credential not found/i)).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    render(<VerificationPage />);

    fireEvent.change(screen.getByLabelText(/subject id/i), {
      target: { value: "test-id-123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/an unknown error occurred/i)
      ).toBeInTheDocument();
    });
  });

  it("clears input on successful verification", async () => {
    const mockResponse = {
      verified: true,
      credentialId: "test-abc-123",
      subjectId: "test-id-123",
      issuedAt: "2023-01-01T00:00:00Z",
      workerId: "worker-1",
    };

    mockedAxios.post.mockResolvedValueOnce({
      status: 200,
      data: mockResponse,
    });

    render(<VerificationPage />);

    const input = screen.getByLabelText(/subject id/i);
    fireEvent.change(input, {
      target: { value: "test-id-123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });
});
