import { ReactNode } from "react";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
  isLoading?: boolean;
}

export function Layout({ children, isLoading = false }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout-header">
        <h1 className="layout-title">Podcaster</h1>
        {isLoading && (
          <div className="layout-loading-indicator" aria-label="Cargando...">
            ●
          </div>
        )}
      </header>

      <main className="layout-main">{children}</main>
    </div>
  );
}
