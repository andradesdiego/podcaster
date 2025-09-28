import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useNavigationIndicator() {
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsNavigating(true);

    // Simular un pequeño delay para mostrar el indicador
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return isNavigating;
}
