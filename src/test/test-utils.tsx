// src/test/test-utils.tsx (opcional - para setup compartido)
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { vi } from "vitest";

// Mock del fetch global para reutilizar
export const mockFetchSuccess = (data: any) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

export const mockFetchError = (error: Error) => {
  global.fetch = vi.fn().mockRejectedValue(error);
};

export const mockFetchHttpError = (status: number) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
  });
};

// Data factory para tests
export const createMockPodcast = (
  id: string,
  name: string,
  author: string
) => ({
  id: { attributes: { "im:id": id } },
  "im:name": { label: name },
  "im:artist": { label: author },
  "im:image": [{ label: `${id}-170.jpg`, attributes: { height: "170" } }],
});

export const createMockApiResponse = (podcasts: any[]) => ({
  feed: {
    entry: podcasts,
  },
});

// Custom render si necesitas providers en el futuro
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { ...options });

export * from "@testing-library/react";
export { customRender as render };
