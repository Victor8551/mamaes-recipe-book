import { useEffect, type ReactNode } from "react";

// Light-only theme. Kept as a no-op provider to avoid breaking imports.
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
  return <>{children}</>;
}
