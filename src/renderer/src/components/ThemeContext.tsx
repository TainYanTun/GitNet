import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage or default to system
    const saved = localStorage.getItem("gitcanopy-theme");
    return (saved as Theme) || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (t: Theme) => {
      const isDark = t === "dark" || (t === "system" && systemDark.matches);

      console.log("Applying theme:", t, "isDark:", isDark);

      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme(theme);

    // Persist preference
    localStorage.setItem("gitcanopy-theme", theme);

    // Listen for system changes if in system mode
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        if (e.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    systemDark.addEventListener("change", handleSystemChange);
    return () => systemDark.removeEventListener("change", handleSystemChange);
  }, [theme]);

  const toggleTheme = () => {
    console.log("Toggling theme...");
    setTheme((prev) => {
      const next =
        prev === "light" ? "dark" : prev === "dark" ? "system" : "light";
      console.log("Theme changed from", prev, "to", next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
