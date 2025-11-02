import { describe, it, expect, beforeEach, vi, type Mocked } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { IssuancePage } from "./IssuancePage";

vi.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;

describe("IssuancePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the issuance form correctly", () => {
    render(<IssuancePage />);

    expect(screen.getByText("Issue Credential")).toBeInTheDocument();
    expect(screen.getByLabelText(/credential type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/issuer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /issue/i })).toBeInTheDocument();
  });

  it("shows validation errors when required fields are empty", async () => {
    render(<IssuancePage />);

    const submitButton = screen.getByRole("button", {
      name: /issue/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/subject id is required/i)).toBeInTheDocument();
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it("submits the form with valid data", async () => {
    const mockResponse = {
      message: "Credential issued successfully",
      credentialId: "test-id-123",
      workerId: "worker-1",
    };

    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      data: mockResponse,
    });

    render(<IssuancePage />);

    fireEvent.change(screen.getByLabelText(/subject id/i), {
      target: { value: "test-user-1" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    });

    const submitButton = screen.getByRole("button", {
      name: /issue/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/issuance/issue"),
        expect.objectContaining({
          type: "Identity Credential",
          issuer: "Kube Credential System",
          subjectId: "test-user-1",
          claims: expect.objectContaining({
            name: "John Doe",
          }),
        }),
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });
  });

  it("handles API errors gracefully", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    render(<IssuancePage />);

    fireEvent.change(screen.getByLabelText(/subject id/i), {
      target: { value: "test-user-1" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    });

    fireEvent.click(screen.getByRole("button", { name: /issue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/an unknown error occurred/i)
      ).toBeInTheDocument();
    });
  });

  it("handles duplicate credential response", async () => {
    const duplicateResponse = {
      message: "Credential already issued",
      credentialId: "existing-id",
      issuedAt: "2023-01-01T00:00:00Z",
      workerId: "worker-1",
    };

    mockedAxios.post.mockResolvedValueOnce({
      status: 409,
      data: duplicateResponse,
    });

    render(<IssuancePage />);

    fireEvent.change(screen.getByLabelText(/subject id/i), {
      target: { value: "test-user-1" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    });

    fireEvent.click(screen.getByRole("button", { name: /issue/i }));

    await waitFor(() => {
      expect(screen.getByText(/duplicate credential/i)).toBeInTheDocument();
      expect(
        screen.getByText(/this credential has already been issued/i)
      ).toBeInTheDocument();
    });
  });

  it("clears errors when user starts typing", async () => {
    render(<IssuancePage />);

    const submitButton = screen.getByRole("button", {
      name: /issue/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/subject id is required/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/subject id/i), {
      target: { value: "test" },
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/subject id is required/i)
      ).not.toBeInTheDocument();
    });
  });
});
