import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../SearchInput";

describe("SearchInput", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with placeholder", () => {
    render(<SearchInput value="" onChange={mockOnChange} />);

    expect(
      screen.getByPlaceholderText("Filter podcasts...")
    ).toBeInTheDocument();
  });

  it("displays the current value", () => {
    render(<SearchInput value="test value" onChange={mockOnChange} />);

    expect(screen.getByDisplayValue("test value")).toBeInTheDocument();
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    render(<SearchInput value="" onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "hello");

    expect(mockOnChange).toHaveBeenCalledTimes(5);
  });

  it("shows clear button when there is a value", () => {
    render(<SearchInput value="some text" onChange={mockOnChange} />);

    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("does not show clear button when value is empty", () => {
    render(<SearchInput value="" onChange={mockOnChange} />);

    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
  });

  it("clears the input when clear button is clicked", () => {
    render(<SearchInput value="some text" onChange={mockOnChange} />);

    const clearButton = screen.getByLabelText("Clear search");
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith("");
  });

  it("can be disabled", () => {
    render(
      <SearchInput value="test" onChange={mockOnChange} disabled={true} />
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });
});
