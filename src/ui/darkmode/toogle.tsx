import { useEffect, useState } from "react";

function getInitialDark() {
  if (typeof window === "undefined") return false;
  return (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(getInitialDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    if (isDark) {
      localStorage.theme = "dark";
    } else {
      localStorage.theme = "light";
    }
  }, [isDark]);

  return (
    <button
      aria-label="Toggle dark mode"
      className={`w-12 h-6 flex items-center rounded-full px-1 transition-colors duration-300 ${
        isDark ? "bg-zinc-800" : "bg-zinc-200"
      }`}
      onClick={() => setIsDark((v) => !v)}
      type="button"
    >
      <span
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          isDark ? "translate-x-6" : ""
        }`}
      />
      <span className="ml-2 text-xs">{isDark ? "🌙" : "☀️"}</span>
    </button>
  );
}