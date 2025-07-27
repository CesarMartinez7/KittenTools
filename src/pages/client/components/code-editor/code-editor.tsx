import type React from "react";
import { memo, useEffect, useRef, useState } from "react";
import LazyListItem from "../../../../ui/LazyListPerform";
import colors from "./colors";
import keywords from "./keyword";
import { Icon } from "@iconify/react/dist/iconify.js";

const highlightCode = (code: string, language: string) => {
  let highlightedCode = code;

  if (language === "json") {
    // JSON highlighting
    highlightedCode = code
      .replace(/"([^"\\]|\\.)*"/g, (match) => {
        if (match.endsWith('":') || match.endsWith('": ')) {
          return `<span style="color: ${colors.attribute}">${match}</span>`;
        }
        return `<span style="color: ${colors.string}">${match}</span>`;
      })
      .replace(
        /\b(true|false|null)\b/g,
        `<span style="color: ${colors.keyword}">$1</span>`,
      )
      .replace(
        /\b(-?\d+\.?\d*)\b/g,
        `<span style="color: ${colors.number}">$1</span>`,
      );
  } else if (language === "xml") {
    // XML highlighting
    highlightedCode = code
      .replace(
        /<!--[\s\S]*?-->/g,
        `<span style="color: ${colors.comment}">$&</span>`,
      )
      .replace(
        /<\/?([a-zA-Z][a-zA-Z0-9]*)/g,
        `<span style="color: ${colors.tag}">&lt;$1</span>`,
      )
      .replace(
        /([a-zA-Z-]+)=/g,
        `<span style="color: ${colors.attribute}">$1</span>=`,
      )
      .replace(/"([^"]*)"/g, `<span style="color: ${colors.value}">"$1"</span>`)
      .replace(/>/g, `<span style="color: ${colors.tag}">&gt;</span>`);
  } else {
    // JavaScript/TypeScript highlighting
    const langKeywords = keywords[language] || keywords.javascript;

    highlightedCode = code
      // Comentarios
      .replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        `<span style="color: ${colors.comment}">$1</span>`,
      )
      // Strings
      .replace(
        /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
        `<span style="color: ${colors.string}">$1$2$3</span>`,
      )
      // Números
      .replace(
        /\b(\d+\.?\d*)\b/g,
        `<span style="color: ${colors.number}">$1</span>`,
      )
      // Funciones
      .replace(
        /\b(\w+)(?=\s*\()/g,
        `<span style="color: ${colors.function}">$1</span>`,
      );

    // Keywords
    langKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b(${keyword})\\b`, "g");
      highlightedCode = highlightedCode.replace(
        regex,
        `<span style="color: ${colors.keyword}; font-weight: bold">$1</span>`,
      );
    });
  }

  return highlightedCode;
};

interface CodeEditorProps {
  value?: string;
  language?: "javascript" | "typescript" | "json" | "xml";
  onChange?: (value: string | undefined | null) => void;
  height?: string;
  placeholder?: string;
  classNameContainer?: string;
  searchValue?: string;
}

const CodeEditor = ({
  value = "",
  language = "javascript",
  onChange,
  height = "200px",
  placeholder = "// Escribe tu código aquí...",
  classNameContainer = "100%",
  searchValue = "",
}: CodeEditorProps) => {
  const [code, setCode] = useState(value);
  const [lineCount, setLineCount] = useState(1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lines = code.split("\n").length;
    setLineCount(lines);
  }, [code]);

  useEffect(() => {
    setCode(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCode(newValue);
    onChange?.(newValue);
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current && highlightRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
      lineNumbersRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + "  " + code.substring(end);
      setCode(newValue);
      onChange?.(newValue);

      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
          start + 2;
      }
    }
  };

  return (
    <div
      className={`relative flex border border-zinc-800 text-xs rounded-md overflow-hidden bg-zinc-900/60 ring-none backdrop-blur-3xl ${classNameContainer} `}
    >
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        className="px-3 py-2 text-sm  overflow-hidden bg-zinc-950/20 border-r border-zinc-800 backdrop-blur-3xl text-zinc-400 "
        style={{ height }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i + 1}
            className="leading-6 text-right min-w-[2rem] font-mono"
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative ">
        {/* Syntax Highlighted Background */}
        <LazyListItem>
          <div
            ref={highlightRef}
            className="absolute inset-0 p-2 text-sm font-mono leading-6 pointer-events-none overflow-auto whitespace-pre-wrap break-words  text-[#d4d4d4]"
            dangerouslySetInnerHTML={{
              __html: highlightCode(code, language),
            }}
          />
        </LazyListItem>

        {/* Transparent Textarea */}
        <LazyListItem>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 p-2 ring-none ring-0 focus:ring-none text-sm font-mono leading-6 resize-none outline-none bg-r  whitespace-pre-wrap break-words"
            style={{
              height,
              color: "transparent",
              caretColor: "#d4d4d4",
            }}
            spellCheck={false}
            placeholder={placeholder}
          />
        </LazyListItem>
        <div className="absolute right-1 shadow bottom-2 flex gap-2 text-[8px] text-zinc-400 bg-zinc-950 px-2 py-1 rounded-[4px] ">
          <p className="text-green-400 block">
            {(() => {
              try {
                JSON.parse(value);
                return (
                  <Icon
                    icon="tabler:check"
                    width="10"
                    height="10"
                    color="green"
                  />
                );
              } catch {
                return (
                  <Icon icon="tabler:x" width="10" height="10" color="red" />
                );
              }
            })()}
          </p>
          {language.toUpperCase() + " | "}
          {JSON.parse(JSON.stringify(code)).length} caracteres,{" "}
          {code.split("\n").length} lineas
        </div>
      </div>
    </div>
  );
};

export default memo(CodeEditor);
