import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Layout } from "../Layout";

describe("Layout", () => {
  it("renders the title correctly", () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    expect(screen.getByText("Podcaster")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument(); // header
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    const testContent = "This is test content";

    render(
      <Layout>
        <div>{testContent}</div>
      </Layout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("shows loading indicator when isLoading is true", () => {
    render(
      <Layout isLoading={true}>
        <div>Content</div>
      </Layout>
    );

    const loadingIndicator = screen.getByLabelText("Cargando...");
    expect(loadingIndicator).toBeInTheDocument();
    expect(loadingIndicator).toHaveTextContent("●");
  });

  it("does not show loading indicator when isLoading is false", () => {
    render(
      <Layout isLoading={false}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.queryByLabelText("Cargando...")).not.toBeInTheDocument();
  });

  it("does not show loading indicator by default", () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.queryByLabelText("Cargando...")).not.toBeInTheDocument();
  });

  it("has proper CSS classes", () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const layout = screen.getByText("Podcaster").closest(".layout");
    expect(layout).toHaveClass("layout");

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("layout-header");

    const main = screen.getByRole("main");
    expect(main).toHaveClass("layout-main");
  });
});
