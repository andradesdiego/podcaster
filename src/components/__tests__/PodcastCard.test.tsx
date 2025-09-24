import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PodcastCard } from "../PodcastCard";

describe("PodcastCard", () => {
  const mockProps = {
    imageUrl: "https://example.com/image.jpg",
    title: "Test Podcast",
    author: "Test Author",
  };

  it("renders podcast information correctly", () => {
    render(<PodcastCard {...mockProps} />);

    expect(screen.getByText("Test Podcast")).toBeInTheDocument();
    expect(screen.getByText("Author: Test Author")).toBeInTheDocument();

    const image = screen.getByAltText("Test Podcast podcast cover");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<PodcastCard {...mockProps} onClick={handleClick} />);

    const card = screen.getByRole("listitem");
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("has proper loading attribute for image", () => {
    render(<PodcastCard {...mockProps} />);

    const image = screen.getByAltText("Test Podcast podcast cover");
    expect(image).toHaveAttribute("loading", "lazy");
  });

  it("applies CSS classes correctly", () => {
    render(<PodcastCard {...mockProps} />);

    const card = screen.getByRole("listitem");
    expect(card).toHaveClass("podcast-card");
  });
});
