import { Link } from "react-router-dom";
import { useNavigationIndicator } from "../hooks/useNavigationIndicator";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isNavigating = useNavigationIndicator();

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__header-content">
          <Link to="/" className="layout__title-link">
            <h1 className="layout__title">Podcaster</h1>
          </Link>

          {isNavigating && (
            <div className="layout__navigation-indicator">
              <div
                className="layout__spinner"
                data-testid="navigation-spinner"
              ></div>
            </div>
          )}
        </div>
      </header>

      <main className="layout__main">{children}</main>
    </div>
  );
}
