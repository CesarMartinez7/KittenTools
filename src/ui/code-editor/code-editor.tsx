import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import highlightCode from './higlight-code';
import './Code.css';
import ICONS_EDITOR from './icons';
import { useEnviromentStore } from '../../pages/client/components/enviroment/store.enviroment';
import { useJsonHook } from './methods-json/method';
import { useXmlHook } from './methos-xml/method.xml';
import type { CodeEditorProps } from './types';


// Función para obtener coordenadas del cursor
function getCaretCoordinates(textarea: HTMLTextAreaElement, position: number) {
  const div = document.createElement("div");

  const style = window.getComputedStyle(textarea);
  Array.from(style).forEach((prop) => {
    div.style.setProperty(prop, style.getPropertyValue(prop));
  });

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";
  div.style.overflow = "hidden";
  div.style.height = "auto";
  div.style.width = textarea.offsetWidth + "px";

  const textBefore = textarea.value.substring(0, position);
  div.textContent = textBefore;

  const span = document.createElement("span");
  span.textContent = textarea.value.substring(position) || ".";
  div.appendChild(span);

  document.body.appendChild(div);
  const rect = span.getBoundingClientRect();
  document.body.removeChild(div);

  const taRect = textarea.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    relativeTop: rect.top - taRect.top,
    relativeLeft: rect.left - taRect.left,
  };
}

const CodeEditor = ({
  value = '',
  language = 'json',
  onChange,
  maxHeight = '100%',
  height = '700px',
  minHeight = '68vh',
  placeholder = '',
  classNameContainer = '',
}: CodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inputRefTextOld = useRef<HTMLInputElement>(null);
  const inputRefTextNew = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState(value);
  const [isOpenBar, setIsOpenBar] = useState<boolean>(false);
  const [isOpenFindBar, setIsOpenFindBar] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const entornoActual = useEnviromentStore((state) => state.entornoActual);
  const currentEntornoList = useMemo(
    () => (Array.isArray(entornoActual) ? entornoActual : []),
    [entornoActual],
  );

  const { JsonSchema, minifyJson } = useJsonHook({
    code: code,
    setCode: setCode,
  });

  const { XmlScheme, minifyXml } = useXmlHook({
    code: code,
    setCode: setCode,
  });

  const [caretCoords, setCaretCoords] = useState<{ top: number; left: number } | null>(null);

  // Optimización: useDebounce para el resaltado y la búsqueda
  const [debouncedCode] = useDebounce(code, 200);
  const [debouncedSearchValue] = useDebounce(searchValue, 200);

  // Optimización: Memoizar el cálculo de los resultados de búsqueda
  const findResults = useMemo(() => {
    if (!debouncedSearchValue || !debouncedCode) {
      return [];
    }
    const results: number[] = [];
    let index = debouncedCode.indexOf(debouncedSearchValue);
    while (index !== -1) {
      results.push(index);
      index = debouncedCode.indexOf(debouncedSearchValue, index + 1);
    }
    return results;
  }, [debouncedSearchValue, debouncedCode]);

  // Optimización: Memoizar el HTML resaltado
  const highlightedCodeHtml = useMemo(() => {
    return highlightCode(
      debouncedCode,
      language,
      findResults,
      debouncedSearchValue,
      currentMatchIndex,
      currentEntornoList,
    );
  }, [debouncedCode, language, findResults, debouncedSearchValue, currentMatchIndex, currentEntornoList]);

  // Optimización: Memoizar el cálculo de los números de línea
  const lineCount = useMemo(() => {
    if (code.length > 0) {
      return code.split('\n').length;
    }
    return 1;
  }, [code]);

  const lineNumberElements = useMemo(
    () =>
      Array.from({ length: lineCount }, (_, i) => (
        <div key={i} className="leading-6 text-right min-w-[2rem] font-mono">
          {i + 1}
        </div>
      )),
    [lineCount],
  );

  // Sincronización de scroll usando requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (!textareaRef.current || !lineNumbersRef.current || !highlightRef.current) return;

    const scrollTop = textareaRef.current.scrollTop;
    const scrollLeft = textareaRef.current.scrollLeft;

    requestAnimationFrame(() => {
      lineNumbersRef.current!.scrollTop = scrollTop;
      highlightRef.current!.scrollTop = scrollTop;
      highlightRef.current!.scrollLeft = scrollLeft;
    });
  }, []);

  const handleCaretPosition = useCallback(() => {
    if (textareaRef.current) {
      const pos = textareaRef.current.selectionStart || 0;
      const coords = getCaretCoordinates(textareaRef.current, pos);
      setCaretCoords(coords);
    }
  }, []);

  // UseEffect para manejar la sincronización del estado y props.
  useEffect(() => {
    setCode(value);
  }, [value]);

  useEffect(() => {
    if (
      currentMatchIndex !== -1 &&
      textareaRef.current &&
      highlightRef.current
    ) {
      const matchPos = findResults[currentMatchIndex];
      const lines = code.substring(0, matchPos).split('\n');
      const lineIndex = lines.length - 1;

      const lineHeight = parseInt(
        getComputedStyle(textareaRef.current).lineHeight,
        10,
      );
      if (!isNaN(lineHeight)) {
        const scrollPosition =
          lineIndex * lineHeight -
          textareaRef.current.clientHeight / 2 +
          lineHeight / 2;
        textareaRef.current.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      }
    }
  }, [currentMatchIndex, findResults, code]);


  const HandlersMinifyBody = useCallback(() => {
    if (language === 'json') return minifyJson();
    if (language === 'xml') return minifyXml();
    return toast.error('El formato no es JSON ni XML, no se puede minificar.');
  }, [language, minifyJson, minifyXml]);

  const HandlersIdentarBody = useCallback(() => {
    if (language === 'json') return JsonSchema();
    if (language === 'xml') return XmlScheme();
  }, [language, JsonSchema, XmlScheme]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCode(newValue);
    onChange?.(newValue);
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastBracesIndex = textBeforeCursor.lastIndexOf('{{');
    if (
      lastBracesIndex !== -1 &&
      textBeforeCursor.lastIndexOf('}}') < lastBracesIndex
    ) {
      const searchText = textBeforeCursor.substring(lastBracesIndex + 2);
      const suggestions = currentEntornoList
        .map((env) => env.key)
        .filter((key) => key.toLowerCase().startsWith(searchText.toLowerCase()));
      setAutocompleteSuggestions(suggestions);
      setActiveSuggestionIndex(0);
    } else {
      setAutocompleteSuggestions([]);
    }
  };

  const handleCLickReplaceTextFirst = () => {
    const from = inputRefTextOld.current?.value || '';
    const to = inputRefTextNew.current?.value || '';

    if (!from) return toast.error('Ingresa un valor a buscar');

    if (!code?.includes(from)) {
      return toast.error('El valor a buscar no se encuentra en el texto');
    }

    const result = code?.replace(from, to);
    setCode(result);
    toast.success('Reemplazo realizado');
  };

  const handleCLickReplaceText = () => {
    const from = inputRefTextOld.current?.value || '';
    const to = inputRefTextNew.current?.value || '';

    if (!code?.includes(from)) {
      return toast.error('El valor a buscar no se encuentra en el texto');
    }

    if (!from) return toast.error('Ingresa un valor a buscar');
    const result = code?.replaceAll(from, to);
    setCode(result);
    toast.success('Reemplazo realizado');
  };

  const handleNextMatch = () => {
    setCurrentMatchIndex((prevIndex) => (prevIndex + 1) % findResults.length);
  };

  const handlePrevMatch = () => {
    setCurrentMatchIndex(
      (prevIndex) => (prevIndex - 1 + findResults.length) % findResults.length,
    );
  };
  
  // Handle KEY DOWN ARROW CODE EDITORS
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autocompleteSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(
          (prevIndex) => (prevIndex + 1) % autocompleteSuggestions.length,
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(
          (prevIndex) =>
            (prevIndex - 1 + autocompleteSuggestions.length) %
            autocompleteSuggestions.length,
        );
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const suggestion = autocompleteSuggestions[activeSuggestionIndex];
        const newCode =
          code.substring(0, code.lastIndexOf('{{')) + `{{${suggestion}}}`;
        setCode(newCode);
        onChange?.(newCode);
        setAutocompleteSuggestions([]);
        return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);
      onChange?.(newValue);

      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
          start + 2;
      }
    }
  };


  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsOpenFindBar((prev) => !prev);
        if (!isOpenFindBar) {
          setTimeout(() => searchInputRef.current?.focus(), 100);
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setIsOpenBar((prev) => !prev);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        console.log("buetify")
        HandlersIdentarBody();
      }

      if (isOpenFindBar && e.key === 'Enter') {
        e.preventDefault();
        if (findResults.length > 0) {
          if (e.shiftKey) {
            setCurrentMatchIndex(
              (prevIndex) =>
                (prevIndex - 1 + findResults.length) % findResults.length,
            );
          } else {
            setCurrentMatchIndex(
              (prevIndex) => (prevIndex + 1) % findResults.length,
            );
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpenFindBar, findResults.length, HandlersIdentarBody]);

  return (
    <>
      <main className="overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isOpenFindBar && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-2 top-2 z-[778] p-2 bg-gray-100 border dark:border-zinc-800 border-gray-200 dark:bg-zinc-950/90 rounded-md shadow-lg flex items-center gap-2 flex-col"
            >
              <div className=" flex justify-center items-center gap-2">
                <button
                  onClick={() => setIsOpenBar((prev) => !prev)}
                  className="p-1 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 text-gray-800 dark:text-zinc-300 disabled:text-red-500"
                >
                  <Icon
                    icon={`tabler:chevron-${isOpenBar ? 'down' : 'left'}`}
                    width={16}
                  />
                </button>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="input-base-editor text-xs w-40 px-2 py-1"
                  placeholder="Buscar..."
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  {findResults.length > 0 ? `${currentMatchIndex + 1}` : 0} de{' '}
                  {findResults.length}
                </span>
                <button
                  onClick={handlePrevMatch}
                  disabled={findResults.length === 0}
                  className="p-1 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 text-gray-800 dark:text-zinc-300 disabled:text-red-500"
                >
                  <Icon icon="tabler:chevron-up" width={16} />
                </button>
                <button
                  onClick={handleNextMatch}
                  disabled={findResults.length === 0}
                  className="p-1 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 text-gray-800 dark:text-zinc-300 disabled:text-red-500"
                >
                  <Icon icon="tabler:chevron-down" width={16} />
                </button>
                <button
                  onClick={() => setIsOpenFindBar(false)}
                  className="p-1 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-300"
                >
                  <Icon icon="tabler:x" width={16} />
                </button>
              </div>
              <AnimatePresence>
                {isOpenBar && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex">
                      <input
                        ref={inputRefTextOld}
                        type="text"
                        autoFocus
                        className="input-base-editor text-xs w-40 px-2 py-1"
                        placeholder="Valor a buscar"
                      />
                      <input
                        ref={inputRefTextNew}
                        type="text"
                        className="input-base-editor text-xs w-40 px-2 py-1"
                        placeholder="Valor a Reemplazar"
                      />
                    </div>

                    <div className="flex h-6 gap-2">
                      <button
                        className="bg-gradient-to-r flex-1 from-green-400 to-green-500 p-1  text-xs truncate text-white"
                        onClick={handleCLickReplaceTextFirst}
                      >
                        Reemplazar primero
                      </button>
                      <button
                        className="bg-gradient-to-r flex-1 from-sky-400 to-sky-700 p-1 rounded-md text-xs truncate text-white"
                        onClick={handleCLickReplaceText}
                      >
                        Reemplazar todo
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`relative flex text-xs overflow-hidden bg-gray-100/50 dark:bg-zinc-900/50 ring-none backdrop-blur-3xl border dark:border-zinc-800 border-gray-200 ${classNameContainer}`}
        >
          {/* Line Numbers */}
          <div
            ref={lineNumbersRef}
            className="px-3 py-2 text-sm overflow-hidden bg-gray-200/50 border-r-zinc-200 dark:bg-zinc-950/70 dark:border-zinc-800 text-sky-600 dark:text-teal-200"
            style={{ height, minHeight, maxHeight }}
          >
            {lineNumberElements}
          </div>

          {/* Editor Container */}
          <div className="flex-1 relative">
            <div
              ref={highlightRef}
              className="absolute inset-0 p-2 text-sm font-mono leading-6 pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{
                __html: highlightedCodeHtml,
              }}
            />

            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => {
                handleChange(e);
                handleCaretPosition();
              }}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 transition-colors p-2 text-sm font-mono leading-6 resize-none outline-none placeholder-lime-600  dark:placeholder-lime-200"
              style={{
                color: 'transparent',
                caretColor: 'var(--caret-color, gray)',
              }}
              spellCheck={false}
              placeholder={placeholder}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex justify-between items-center text-[8px] text-gray-500 dark:text-zinc-400 bg-gray-200/70 dark:bg-zinc-950/50 border-t border-gray-300 dark:border-zinc-800 px-2 py-1.5 shadow-sm">
          <div className="flex items-center gap-1">
            <button className="button-code-tools" onClick={HandlersIdentarBody}>
              <Icon icon="tabler:braces" width={14} />
              <span className="hidden sm:inline font-black">Beuttify</span>
            </button>

            <button className="button-code-tools" onClick={HandlersMinifyBody}>
              <Icon icon={ICONS_EDITOR.bolt} width={14} />
              <span className="hidden sm:inline">Minify</span>
            </button>

            <button
              className="button-code-tools"
              onClick={() => setIsOpenBar(!isOpenBar)}
            >
              <Icon icon={ICONS_EDITOR.replace} width={14} />
              <span className="hidden sm:inline">Reemplazar</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="button-code-tools"
              onClick={() => setIsOpenFindBar(!isOpenFindBar)}
              aria-label="Buscar"
            >
              <Icon icon={ICONS_EDITOR.search} width={14} />
            </button>
            <span className="text-green-500 dark:text-green-400">
              {(() => {
                try {
                  JSON.parse(value);
                  return <Icon icon="tabler:check" width={15} height={15} />;
                } catch {
                  return (
                    <Icon icon={ICONS_EDITOR.x} width={13} height={13} color="red" />
                  );
                }
              })()}
            </span>

            <span className="hidden sm:inline">
              {language.toUpperCase()} | {code.length} caracteres | {lineCount}{' '}
              líneas
            </span>
          </div>
        </div>
      </main>
    </>
  );
};

export default memo(CodeEditor);