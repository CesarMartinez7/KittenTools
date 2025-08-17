import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@iconify/react/dist/iconify.js';
import toast from 'react-hot-toast';

// --- Placeholder functions and components for a self-contained example ---
// NOTE: These are mock implementations. You should use your actual files.
const LazyListItem = memo(({ children }) => <div>{children}</div>);
const highlightCode = (code, language, findResults, searchValue, currentMatchIndex) => {
  if (!searchValue) return code;
  const regex = new RegExp(searchValue, 'gi');
  let highlightedCode = code.replace(regex, (match) => `<span style="background-color: yellow;">${match}</span>`);
  if (findResults[currentMatchIndex] !== undefined) {
    const start = findResults[currentMatchIndex];
    const end = start + searchValue.length;
    highlightedCode = highlightedCode.substring(0, start) + `<span style="background-color: orange;">${highlightedCode.substring(start, end)}</span>` + highlightedCode.substring(end);
  }
  return highlightedCode;
};
const bolt = "tabler:bolt";
const useJsonHook = ({ code, setCode }) => ({
  JsonSchema: () => {
    try {
      const formattedCode = JSON.stringify(JSON.parse(code), null, 2);
      setCode(formattedCode);
      toast.success('JSON identado!');
    } catch (error) {
      toast.error('JSON inválido');
    }
  },
  minifyJson: () => {
    try {
      const minifiedCode = JSON.stringify(JSON.parse(code));
      setCode(minifiedCode);
      toast.success('JSON minificado!');
    } catch (error) {
      toast.error('JSON inválido');
    }
  },
});
const useXmlHook = ({ code, setCode }) => ({
  XmlScheme: () => toast.success('XML identado! (Simulado)'),
  minifyXml: () => toast.success('XML minificado! (Simulado)'),
});
// --------------------------------------------------------------------------

const CodeEditor = ({
  value = '',
  language = 'json',
  onChange,
  maxHeight = '100%',
  height = '700px',
  minHeight = '68vh',
  placeholder = '',
  classNameContainer = '',
}) => {
  // Referencias al DOM
  const inputRefTextOld = useRef(null);
  const inputRefTextNew = useRef(null);
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const searchInputRef = useRef(null); // Nueva referencia para el input de busqueda

  const [isOpenBar, setIsOpenBar] = useState(false);
  const [code, setCode] = useState(value);

  // Estados para la funcionalidad de búsqueda
  const [isOpenFindBar, setIsOpenFindBar] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [findResults, setFindResults] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);


  useEffect(() => {
    setCode(value);
  }, [value]);

  // --------------------------------------- Custom Hooks -------------------------------------
  const { JsonSchema, minifyJson } = useJsonHook({
    code: code,
    setCode: setCode,
  });

  const { XmlScheme, minifyXml } = useXmlHook({
    code: code,
    setCode: setCode,
  });

  const lineCount = useMemo(() => {
    return code.split('\n').length;
  }, [code]);

  // Efectos y Lógica
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Atajo para abrir/cerrar la barra de búsqueda (Ctrl + F)
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsOpenFindBar((prev) => !prev);
        if (!isOpenFindBar) {
          // Si se va a abrir, enfoca el input
          setTimeout(() => searchInputRef.current?.focus(), 100);
        }
      }

      // Atajo para abrir/cerrar la barra de reemplazo (Ctrl + B)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setIsOpenBar((prev) => !prev);
      }

      // Atajo para identar (Ctrl + S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        HandlersIdentarBody();
      }

      // Navegación con Enter y Shift + Enter
      if (isOpenFindBar && e.key === 'Enter') {
        e.preventDefault();
        if (findResults.length > 0) {
          if (e.shiftKey) {
            // Shift + Enter: anterior
            setCurrentMatchIndex(
              (prevIndex) =>
                (prevIndex - 1 + findResults.length) % findResults.length,
            );
          } else {
            // Enter: siguiente
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
  }, [isOpenFindBar, findResults.length, isOpenBar]);

  useEffect(() => {
    if (searchValue && code) {
      const results = [];
      let index = code.indexOf(searchValue);
      while (index !== -1) {
        results.push(index);
        index = code.indexOf(searchValue, index + 1);
      }
      setFindResults(results);
      setCurrentMatchIndex(results.length > 0 ? 0 : -1);
    } else {
      setFindResults([]);
      setCurrentMatchIndex(-1);
    }
  }, [searchValue, code]);

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

  const HandlersMinifyBody = () => {
    if (language === 'json') return minifyJson();
    if (language === 'xml') return minifyXml();
    return toast.error('El formato no es JSON ni XML, no se puede minificar.');
  };

  const HandlersIdentarBody = () => {
    if (language === 'json') return JsonSchema();
    if (language === 'xml') return XmlScheme();
  };

  // Manejo de eventos
  const handleChange = (e) => {
    const newValue = e.target.value;
    setCode(newValue);
    onChange?.(newValue);
  };

  const handleScroll = () => {
    if (
      !textareaRef.current ||
      !lineNumbersRef.current ||
      !highlightRef.current
    )
      return;

    const scrollTop = textareaRef.current.scrollTop;
    const scrollLeft = textareaRef.current.scrollLeft;

    requestAnimationFrame(() => {
      lineNumbersRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    });
  };

  const handleKeyDown = (e) => {
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

  const lineNumberElements = useMemo(
    () =>
      Array.from({ length: lineCount }, (_, i) => (
        <div key={i} className="leading-6 text-right min-w-[2rem] font-mono">
          {i + 1}
        </div>
      )),
    [lineCount],
  );

  const handleNextMatch = () => {
    setCurrentMatchIndex((prevIndex) => (prevIndex + 1) % findResults.length);
  };

  const handlePrevMatch = () => {
    setCurrentMatchIndex(
      (prevIndex) => (prevIndex - 1 + findResults.length) % findResults.length,
    );
  };

  return (
    <main className="flex flex-col h-full relative">
      <AnimatePresence mode="wait">
        {isOpenFindBar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-2 z-[778] p-2 bg-gray-100 dark:bg-zinc-950/90 rounded-md shadow-xl border border-gray-200 dark:border-zinc-800 flex flex-col gap-2 backdrop-blur-3xl"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpenBar((prev) => !prev)}
                className="p-1 rounded-md transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 text-gray-800 dark:text-zinc-300"
              >
                <Icon
                  icon={`tabler:chevron-${isOpenBar ? 'down' : 'up'}`}
                  width={16}
                />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                className="input-base-editor text-xs w-40 px-2 py-1 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-blue-500"
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
                className="p-1 rounded-md transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 text-gray-800 dark:text-zinc-300"
              >
                <Icon icon="tabler:chevron-up" width={16} />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={findResults.length === 0}
                className="p-1 rounded-md transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:opacity-50 text-gray-800 dark:text-zinc-300"
              >
                <Icon icon="tabler:chevron-down" width={16} />
              </button>
              <button
                onClick={() => setIsOpenFindBar(false)}
                className="p-1 rounded-md transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-300"
              >
                <Icon icon="tabler:x" width={16} />
              </button>
            </div>

            {isOpenBar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-2"
              >
                <input
                  ref={inputRefTextOld}
                  type="text"
                  autoFocus
                  className="input-base-editor text-xs w-full px-2 py-1 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-blue-500"
                  placeholder="Valor a buscar"
                />
                <input
                  ref={inputRefTextNew}
                  type="text"
                  className="input-base-editor text-xs w-full px-2 py-1 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-blue-500"
                  placeholder="Valor a Reemplazar"
                />
                <div className="flex gap-2">
                  <button
                    className="flex-1 p-2 rounded-md text-xs truncate text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                    onClick={handleCLickReplaceTextFirst}
                  >
                    Reemplazar
                  </button>
                  <button
                    className="flex-1 p-2 rounded-md text-xs truncate text-white bg-green-500 hover:bg-green-600 transition-colors duration-200"
                    onClick={handleCLickReplaceText}
                  >
                    Reemplazar Todo
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative flex flex-grow text-xs ring-none backdrop-blur-3xl border border-gray-200 dark:border-zinc-800 rounded-md ${classNameContainer}`}
      >
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="px-3 py-2 text-sm overflow-y-auto bg-gray-200/50 border-r border-r-zinc-200 dark:bg-zinc-950/70 dark:border-zinc-800 text-sky-600 dark:text-teal-200"
          style={{ height, minHeight, maxHeight }}
        >
          {lineNumberElements}
        </div>

        {/* Editor Container */}
        <div className="flex-1 relative">
          <LazyListItem>
            <div
              ref={highlightRef}
              className="absolute inset-0 p-2 text-sm font-mono leading-6 pointer-events-none overflow-y-auto whitespace-pre-wrap break-words text-gray-800 dark:text-[#d4d4d4]"
              dangerouslySetInnerHTML={{
                __html: highlightCode(
                  code,
                  language,
                  findResults,
                  searchValue,
                  currentMatchIndex,
                ),
              }}
            />
          </LazyListItem>

          <LazyListItem>
            <textarea
              autoFocus
              ref={textareaRef}
              value={code}
              onChange={handleChange}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 transition-colors p-2 text-sm font-mono leading-6 resize-none outline-none bg-transparent overflow-y-auto"
              style={{
                color: 'transparent',
                caretColor: 'var(--caret-color, gray)',
              }}
              spellCheck={false}
              placeholder={placeholder}
            />
          </LazyListItem>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[8px] text-gray-500 dark:text-zinc-400 bg-gray-200/70 dark:bg-zinc-950/50 border-t border-gray-300 dark:border-zinc-800 px-2 py-1.5 shadow-sm mt-auto">
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-zinc-700"
            onClick={HandlersIdentarBody}
          >
            <Icon icon="tabler:braces" width={14} />
            <span className="hidden sm:inline">Prettify</span>
          </button>

          <button
            className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-zinc-700"
            onClick={HandlersMinifyBody}
          >
            <Icon icon={bolt} width={14} />
            <span className="hidden sm:inline">Minify</span>
          </button>

          <button
            className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-zinc-700"
            onClick={() => setIsOpenBar(!isOpenBar)}
          >
            <Icon icon="tabler:replace" width={14} />
            <span className="hidden sm:inline">Reemplazar</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-zinc-700"
            onClick={() => setIsOpenFindBar(!isOpenFindBar)}
            aria-label="Buscar"
          >
            <Icon icon="tabler:search" width={14} />
            <span className="hidden sm:inline">Buscar</span>
          </button>
          <span className="text-green-500 dark:text-green-400">
            {(() => {
              try {
                JSON.parse(value);
                return <Icon icon="tabler:check" width={15} height={15} />;
              } catch {
                return (
                  <Icon icon="tabler:x" width={13} height={13} color="red" />
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
  );
};

export default memo(CodeEditor);
