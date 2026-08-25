import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext({
  theme: "light",
});

export function ThemeProvider({ children }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem("noir-theme");
    } catch {
      // Storage unavailable
    }

    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = "#fbf9f5";
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
