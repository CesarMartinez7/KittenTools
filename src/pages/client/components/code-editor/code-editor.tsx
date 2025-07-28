import { Icon } from "@iconify/react/dist/iconify.js";
import type React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import LazyListItem from "../../../../ui/LazyListPerform";
import colors from "./colors";
import keywords from "./keyword";
import x from "@iconify-icons/tabler/x";
import { AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { type CodeEditorProps } from "./types";

const highlightCode = (code: string, language: string) => {
  let highlightedCode = code;

  const escapeHTML = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

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
    const escaped = escapeHTML(code);
    highlightedCode = escaped
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

const CodeEditor = ({
  value = "",
  language = "javascript",
  onChange,
  height = "200px",
  placeholder = "// Escribe tu código aquí...",
  classNameContainer = "100%",
}: CodeEditorProps) => {
  const inputRefTextOld = useRef<HTMLInputElement>(null);
  const inputRefTextNew = useRef<HTMLInputElement>(null);
  const refSection = useRef<HTMLDivElement>(null);
  const [isOpenBar, setIsOpenBar] = useState<boolean>(false);

  const [code, setCode] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lineCount = useMemo(() => {
    return code.split("\n").length;
  }, [code]);

  useEffect(() => {
    refSection.current?.focus();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // No importa si esta en minuscula la b o en mayuscula siempre se abrira
      if ((e.ctrlKey && e.key === "b") || (e.ctrlKey && e.key === "B")) {
        e.preventDefault();
        setIsOpenBar((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []); // E

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

  const handleJsonSchema = () => {
    setCode(JSON.stringify(JSON.parse(code), null, 2));
  };

  const handleCLickReplaceTextFirst = () => {
    const from = inputRefTextOld.current?.value || "";
    const to = inputRefTextNew.current?.value || "";

    if (!from) return toast.error("Ingresa un valor a buscar");

    if (!value?.includes(from)) {
      return toast.error("El valor a buscar no se encuentra en el texto");
    }

    const result = value?.replace(from, to);
    setCode(result);
    toast.success("Reemplazo realizado");
  };

  const handleCLickReplaceText = () => {
    const from = inputRefTextOld.current?.value || "";
    const to = inputRefTextNew.current?.value || "";

    if (!value?.includes(from)) {
      return toast.error("El valor a buscar no se encuentra en el texto");
    }

    if (!from) return toast.error("Ingresa un valor a buscar");
    const result = value?.replaceAll(from, to);
    setCode(result);
    toast.success("Reemplazo realizado");
  };

  return (
    <main className="border rounded-xl overflow-hidden border-zinc-800">
      <AnimatePresence mode="wait">
        {isOpenBar && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(4px)" }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
              },
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.95,
              filter: "blur(4px)",
              transition: { duration: 0.2 },
            }}
            layout
            className="backdrop-blur-3xl bg-zinc-900/35 border border-zinc-900 p-3 flex flex-col w-52 shadow-xl shadow-zinc-800 gap-1 rounded  right-4 top-5 absolute z-[778]"
          >
            <input
              ref={inputRefTextOld}
              type="text"
              autoFocus
              className="input-base"
              tabIndex={0}
              title="Valor a buscar"
              placeholder="Valor a buscar"
            />
            <input
              ref={inputRefTextNew}
              type="text"
              className="input-base"
              placeholder="Valor a Remplazar"
            />
            <div className="flex h-6 gap-2 text-wrap whitespace-normal">
              <button
                className="bg-gradient-to-r flex-1 from-green-500 to-green-500 p-1 rounded-md text-xs truncate"
                onClick={handleCLickReplaceTextFirst}
                title="Reemplazar solo la primera coincidencia"
              >
                Reemplazar primero
              </button>
              <button
                className="bg-gradient-to-r flex-1 from-blue-400 to-blue-900 p-1 rounded-md text-xs truncate"
                onClick={handleCLickReplaceText}
                title="Reemplazar todas las coincidencias"
              >
                Reemplazar todo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative flex  text-xs rounded-md overflow-hidden bg-zinc-900/60 ring-none backdrop-blur-3xl ${classNameContainer} `}
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
              className="absolute inset-0 p-2 ring-none ring-0 focus:ring-none text-sm font-mono leading-6 resize-none outline-none bg-r whitespace-pre-wrap break-words"
              style={{
                height,
                color: "transparent",
                caretColor: "#d4d4d4",
              }}
              spellCheck={false}
              placeholder={placeholder}
            />
          </LazyListItem>
          {/* <div className="absolute right-1 shadow bottom-2 flex gap-2 text-[8px] text-zinc-400 bg-zinc-950 px-2 py-1 rounded-[4px] ">
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
                  return <Icon icon={x} width="10" height="10" color="red" />;
                }
              })()}
            </p>
            {language.toUpperCase() + " | "}
            {JSON.parse(JSON.stringify(code)).length} caracteres,{" "}
            {code.split("\n").length} lineas
          </div> */}
        </div>
      </div>

      {/* Footer toobar tools */}

      <div className="relative flex justify-end items-center-safe shadow  gap-2 text-[8px] text-zinc-400 bg-zinc-950/70 border-t border-0 border-zinc-800  px-2 py-2  ">
        <button
          className="bg-zinc-900 p-1 rounded absolute left-3"
          onClick={handleJsonSchema}
        >
          Identar JSON
        </button>
        <span className="text-green-400 ">
          {(() => {
            try {
              JSON.parse(value);
              return (
                <Icon
                  icon="tabler:check"
                  width="17"
                  height="17"
                  color="green"
                />
              );
            } catch {
              return <Icon icon={x} width="17" height="17" color="red" />;
            }
          })()}
        </span>
        <span>
          {language.toUpperCase() + " | "}
          {JSON.parse(JSON.stringify(code)).length} caracteres,{" "}
          {code.split("\n").length} lineas
        </span>
      </div>
    </main>
  );
};

export default memo(CodeEditor);
