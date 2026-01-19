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
    return null;
  }

  return (
    <div className="fixed top-0 right-0 z-30 p-2">
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={theme === "light"}
          onChange={toggleTheme}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"></div>
        <span className="ml-2 text-2xl">
          {theme === "light" ? "☀️" : "🌙"}
        </span>
      </label>
    </div>
  );
}
