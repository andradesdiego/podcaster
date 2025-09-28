import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Layout } from "../Layout";

const mockUseNavigationIndicator = vi.fn();
vi.mock("../hooks/useNavigationIndicator", () => ({
  useNavigationIndicator: mockUseNavigationIndicator,
}));

const renderWithRouter = (children: React.ReactNode) => {
  return render(
    <MemoryRouter>
      <Layout>{children}</Layout>
    </MemoryRouter>
  );
};

describe("Layout", () => {
  beforeEach(() => {
    mockUseNavigationIndicator.mockReturnValue(false);
  });

  it("renders the title correctly", () => {
    renderWithRouter(<div>Test content</div>);

    expect(screen.getByText("Podcaster")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    const testContent = "This is test content";

    renderWithRouter(<div>{testContent}</div>);

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("shows navigation indicator when navigating", () => {
    mockUseNavigationIndicator.mockReturnValue(true);

    renderWithRouter(<div>Content</div>);

    const spinner = screen.getByTestId("navigation-spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("layout__spinner");
  });

  it("title links to home page", () => {
    renderWithRouter(<div>Content</div>);

    const titleLink = screen.getByRole("link", { name: "Podcaster" });
    expect(titleLink).toHaveAttribute("href", "/");
  });

  it("has proper CSS classes", () => {
    renderWithRouter(<div>Content</div>);

    const layout = screen.getByText("Podcaster").closest(".layout");
    expect(layout).toHaveClass("layout");

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("layout__header");

    const main = screen.getByRole("main");
    expect(main).toHaveClass("layout__main");
  });

  it("header content has correct structure", () => {
    renderWithRouter(<div>Content</div>);

    const headerContent = screen
      .getByText("Podcaster")
      .closest(".layout__header-content");
    expect(headerContent).toBeInTheDocument();
    expect(headerContent).toHaveClass("layout__header-content");
  });
});
