"use client";

import { useTheme } from "./ThemeProvider";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full" style={{ backgroundColor: 'var(--surface)' }} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--text)',
      }}
      aria-label={theme === "light" ? "切換至深色模式" : "切換至淺色模式"}
      title={theme === "light" ? "切換至深色模式" : "切換至淺色模式"}
    >
      <span className="text-xl" role="img" aria-hidden="true">
        {theme === "light" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
