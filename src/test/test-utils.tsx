/* eslint-disable react-refresh/only-export-components */
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

// Custom render si necesitas providers en el futuro
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => rtlRender(ui, { ...options });

// Re-export everything from testing-library/react except render
export * from "@testing-library/react";
export { customRender as render };

// Re-export factories
export * from "./factories";
