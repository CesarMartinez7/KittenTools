import type { EventHandler } from "react";
import "./tooltip.css";

export default function ToolTipButton({
  ariaText,
  tooltipText,
  className,
  onClick,
}: {
  ariaText: string;
  onClick?: EventHandler;
  tooltipText: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`tooltip ${className} flex items-center gap-2 px-2 py-1 text-xs rounded-md transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900   `}
    >
      {ariaText}
      <span className="tooltiptext dark:bg-zinc-950 dark:text-gray-200 bg-gray-200 text-gray-600 p-1">
        {tooltipText}
      </span>
    </button>
  );
}
