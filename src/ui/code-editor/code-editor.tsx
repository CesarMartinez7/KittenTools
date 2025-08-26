import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { 
  memo, 
  useEffect, 
  useMemo, 
  useRef, 
  useState, 
  useCallback, 
  startTransition,
  useDeferredValue
} from 'react';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import highlightCode from './higlight-code';
import './Code.css';
import ICONS_EDITOR from './icons';
import { useEnviromentStore } from '../../pages/client/components/enviroment/store.enviroment';
import { useJsonHook } from './methods-json/method';
import { useXmlHook } from './methos-xml/method.xml';
import type { CodeEditorProps } from './types';

// Cache para coordenadas del cursor
const coordinatesCache = new Map<string, { top: number; left: number }>();

// Función optimizada para obtener coordenadas del cursor
function getCaretCoordinates(textarea: HTMLTextAreaElement, position: number) {
  const cacheKey = `${textarea.offsetWidth}-${position}-${textarea.value.length}`;
  
  if (coordinatesCache.has(cacheKey)) {
    return coordinatesCache.get(cacheKey)!;
  }

  const div = document.createElement("div");
  const style = window.getComputedStyle(textarea);
  
  // Solo copiar las propiedades esenciales
  const essentialProps = [
    'fontSize', 'fontFamily', 'fontWeight', 'letterSpacing', 'lineHeight',
    'paddingTop', 'paddingLeft', 'paddingBottom', 'paddingRight',
    'borderTopWidth', 'borderLeftWidth', 'borderBottomWidth', 'borderRightWidth'
  ];
  
  essentialProps.forEach(prop => {
    div.style.setProperty(prop, style.getPropertyValue(prop));
  });

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";
  div.style.overflow = "hidden";
  div.style.height = "auto";
  div.style.width = textarea.offsetWidth + "px";
  div.style.top = "-9999px";

  const textBefore = textarea.value.substring(0, position);
  div.textContent = textBefore;

  const span = document.createElement("span");
  span.textContent = textarea.value.substring(position) || ".";
  div.appendChild(span);

  document.body.appendChild(div);
  const rect = span.getBoundingClientRect();
  document.body.removeChild(div);

  const taRect = textarea.getBoundingClientRect();
  const result = {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    relativeTop: rect.top - taRect.top,
    relativeLeft: rect.left - taRect.left,
  };

  // Cache con límite de tamaño
  if (coordinatesCache.size > 50) {
    const firstKey = coordinatesCache.keys().next().value;
    coordinatesCache.delete(firstKey);
  }
  coordinatesCache.set(cacheKey, result);

  return result;
}

// Componente memoizado para números de línea
const LineNumbers = memo(({ lineCount }: {
  lineCount: number;
}) => {
  const lineNumberElements = useMemo(
    () =>
      Array.from({ length: lineCount }, (_, i) => (
        <div key={i} className="leading-6 text-right min-w-[2rem] font-mono">
          {i + 1}
        </div>
      )),
    [lineCount],
  );

  return <>{lineNumberElements}</>;
});

LineNumbers.displayName = 'LineNumbers';

// Componente memoizado para autocompletado
const AutocompletePopup = memo(({ 
  suggestions, 
  activeSuggestionIndex, 
  caretCoords,
  onSelect 
}: {
  suggestions: string[];
  activeSuggestionIndex: number;
  caretCoords: { top: number; left: number } | null;
  onSelect: (suggestion: string) => void;
}) => {
  if (suggestions.length === 0 || !caretCoords) return null;

  return (
    <div
      className="absolute z-50 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-md shadow-lg max-h-40 overflow-y-auto"
      style={{
        top: caretCoords.relativeTop + 20,
        left: caretCoords.relativeLeft,
      }}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion}
          className={`block w-full px-3 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 ${
            index === activeSuggestionIndex 
              ? 'bg-blue-100 dark:bg-blue-900' 
              : ''
          }`}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
});

AutocompletePopup.displayName = 'AutocompletePopup';

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
  const scrollTimeoutRef = useRef<number>();

  const [code, setCode] = useState(value);
  const [isOpenBar, setIsOpenBar] = useState<boolean>(false);
  const [isOpenFindBar, setIsOpenFindBar] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [caretCoords, setCaretCoords] = useState<{ top: number; left: number } | null>(null);

  // Usar useDeferredValue para diferir actualizaciones no críticas
  const deferredCode = useDeferredValue(code);

  const entornoActual = useEnviromentStore((state) => state.entornoActual);
  const currentEntornoList = useMemo(
    () => (Array.isArray(entornoActual) ? entornoActual : []),
    [entornoActual],
  );

  const { JsonSchema, minifyJson } = useJsonHook({
    code: deferredCode,
    setCode: setCode,
  });

  const { XmlScheme, minifyXml } = useXmlHook({
    code: deferredCode,
    setCode: setCode,
  });

  // Optimización: useDebounce más agresivo para búsqueda
  const [debouncedCode] = useDebounce(deferredCode, 100);
  const [debouncedSearchValue] = useDebounce(searchValue, 150);

  // Optimización: Memoizar el cálculo de los resultados de búsqueda
  const findResults = useMemo(() => {
    if (!debouncedSearchValue || !debouncedCode || typeof debouncedCode !== 'string') {
      return [];
    }
    const results: number[] = [];
    const searchLower = debouncedSearchValue.toLowerCase();
    const codeLower = debouncedCode.toLowerCase();
    
    let index = codeLower.indexOf(searchLower);
    while (index !== -1 && results.length < 1000) { // Límite para evitar rendimiento
      results.push(index);
      index = codeLower.indexOf(searchLower, index + 1);
    }
    return results;
  }, [debouncedSearchValue, debouncedCode]);

  // Optimización: Memoizar el HTML resaltado usando deferredCode
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
    if (typeof deferredCode !== 'string') return 1;
    return Math.max(1, (deferredCode.match(/\n/g) || []).length + 1);
  }, [deferredCode]);

  // Sincronización de scroll optimizada con throttling
  const handleScroll = useCallback(() => {
    if (!textareaRef.current || !lineNumbersRef.current || !highlightRef.current) return;

    const scrollTop = textareaRef.current.scrollTop;
    const scrollLeft = textareaRef.current.scrollLeft;

    // Cancelar timeout anterior
    if (scrollTimeoutRef.current) {
      cancelAnimationFrame(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = requestAnimationFrame(() => {
      if (lineNumbersRef.current && highlightRef.current) {
        lineNumbersRef.current.scrollTop = scrollTop;
        highlightRef.current.scrollTop = scrollTop;
        highlightRef.current.scrollLeft = scrollLeft;
      }
    });
  }, []);

  const handleCaretPosition = useCallback(() => {
    if (textareaRef.current) {
      const pos = textareaRef.current.selectionStart || 0;
      try {
        const coords = getCaretCoordinates(textareaRef.current, pos);
        setCaretCoords(coords);
      } catch (error) {
        console.warn('Error calculating caret coordinates:', error);
      }
    }
  }, []);

  // UseEffect para manejar la sincronización del estado y props.
  useEffect(() => {
    if (typeof value === 'string' && value !== code) {
      startTransition(() => {
        setCode(value);
      });
    }
  }, [value, code]);

  // Scroll automático optimizado para resultados de búsqueda
  useEffect(() => {
    if (
      currentMatchIndex !== -1 &&
      textareaRef.current &&
      findResults.length > 0 &&
      typeof deferredCode === 'string'
    ) {
      const matchPos = findResults[currentMatchIndex];
      const lines = deferredCode.substring(0, matchPos).split('\n');
      const lineIndex = lines.length - 1;

      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        
        const computedStyle = getComputedStyle(textareaRef.current);
        const lineHeight = parseInt(computedStyle.lineHeight, 10) || 20;
        
        const scrollPosition = Math.max(0,
          lineIndex * lineHeight - textareaRef.current.clientHeight / 2 + lineHeight / 2
        );
        
        textareaRef.current.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      });
    }
  }, [currentMatchIndex, findResults, deferredCode]);

  const HandlersMinifyBody = useCallback(() => {
    startTransition(() => {
      if (language === 'json') return minifyJson();
      if (language === 'xml') return minifyXml();
      return toast.error('El formato no es JSON ni XML, no se puede minificar.');
    });
  }, [language, minifyJson, minifyXml]);

  const HandlersIdentarBody = useCallback(() => {
    startTransition(() => {
      if (language === 'json') return JsonSchema();
      if (language === 'xml') return XmlScheme();
    });
  }, [language, JsonSchema, XmlScheme]);

  // Optimización: Memoizar sugerencias de autocompletado
  const getSuggestions = useCallback((searchText: string) => {
    if (!searchText) return [];
    
    const searchLower = searchText.toLowerCase();
    return currentEntornoList
      .map((env) => env.key)
      .filter((key) => key.toLowerCase().startsWith(searchLower))
      .slice(0, 10); // Limitar resultados
  }, [currentEntornoList]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Actualización inmediata del estado local
    setCode(newValue);
    
    // Diferir la llamada a onChange
    startTransition(() => {
      onChange?.(newValue);
    });

    // Autocompletado optimizado
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastBracesIndex = textBeforeCursor.lastIndexOf('{{');
    
    if (
      lastBracesIndex !== -1 &&
      textBeforeCursor.lastIndexOf('}}') < lastBracesIndex
    ) {
      const searchText = textBeforeCursor.substring(lastBracesIndex + 2);
      const suggestions = getSuggestions(searchText);
      setAutocompleteSuggestions(suggestions);
      setActiveSuggestionIndex(0);
      handleCaretPosition();
    } else {
      setAutocompleteSuggestions([]);
    }
  }, [onChange, getSuggestions, handleCaretPosition]);

  const handleAutocompleteSelect = useCallback((suggestion: string) => {
    if (typeof code !== 'string') return;
    
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBefore = code.substring(0, cursorPos);
    const lastBracesIndex = textBefore.lastIndexOf('{{');
    
    if (lastBracesIndex !== -1) {
      const newCode = 
        code.substring(0, lastBracesIndex) + 
        `{{${suggestion}}}` + 
        code.substring(cursorPos);
      
      setCode(newCode);
      startTransition(() => {
        onChange?.(newCode);
      });
      setAutocompleteSuggestions([]);
    }
  }, [code, onChange]);

  const handleCLickReplaceTextFirst = useCallback(() => {
    const from = inputRefTextOld.current?.value || '';
    const to = inputRefTextNew.current?.value || '';

    if (!from) return toast.error('Ingresa un valor a buscar');
    if (typeof code !== 'string' || !code?.includes(from)) {
      return toast.error('El valor a buscar no se encuentra en el texto');
    }

    startTransition(() => {
      const result = code?.replace(from, to);
      setCode(result);
      onChange?.(result);
      toast.success('Reemplazo realizado');
    });
  }, [code, onChange]);

  const handleCLickReplaceText = useCallback(() => {
    const from = inputRefTextOld.current?.value || '';
    const to = inputRefTextNew.current?.value || '';

    if (!from) return toast.error('Ingresa un valor a buscar');
    if (typeof code !== 'string' || !code?.includes(from)) {
      return toast.error('El valor a buscar no se encuentra en el texto');
    }

    startTransition(() => {
      const result = code?.replaceAll(from, to);
      setCode(result);
      onChange?.(result);
      toast.success('Reemplazo realizado');
    });
  }, [code, onChange]);

  const handleNextMatch = useCallback(() => {
    setCurrentMatchIndex((prevIndex) => (prevIndex + 1) % findResults.length);
  }, [findResults.length]);

  const handlePrevMatch = useCallback(() => {
    setCurrentMatchIndex(
      (prevIndex) => (prevIndex - 1 + findResults.length) % findResults.length,
    );
  }, [findResults.length]);
  
  // Handle KEY DOWN ARROW CODE EDITORS optimizado
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        handleAutocompleteSelect(suggestion);
        return;
      }
      if (e.key === 'Escape') {
        setAutocompleteSuggestions([]);
        return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      if (typeof code !== 'string') return;
      
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      
      setCode(newValue);
      startTransition(() => {
        onChange?.(newValue);
      });

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
            start + 2;
        }
      });
    }
  }, [autocompleteSuggestions, activeSuggestionIndex, handleAutocompleteSelect, code, onChange]);

  // Validación JSON memoizada
  const jsonValidation = useMemo(() => {
    if (language !== 'json' || typeof deferredCode !== 'string') return null;
    
    try {
      JSON.parse(deferredCode);
      return <Icon icon="tabler:check" width={15} height={15} />;
    } catch {
      return <Icon icon={ICONS_EDITOR.x} width={13} height={13} color="red" />;
    }
  }, [deferredCode, language]);

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
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }
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
            <LineNumbers lineCount={lineCount} />
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
              onChange={handleChange}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              onClick={handleCaretPosition}
              onKeyUp={handleCaretPosition}
              className="absolute inset-0 transition-colors p-2 text-sm font-mono leading-6 resize-none outline-none placeholder-lime-600  dark:placeholder-lime-200"
              style={{
                color: 'transparent',
                caretColor: 'var(--caret-color, gray)',
              }}
              spellCheck={false}
              placeholder={placeholder}
            />

            {/* Autocompletado */}
            <AutocompletePopup
              suggestions={autocompleteSuggestions}
              activeSuggestionIndex={activeSuggestionIndex}
              caretCoords={caretCoords}
              onSelect={handleAutocompleteSelect}
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
              {jsonValidation}
            </span>

            <span className="hidden sm:inline">
              {language.toUpperCase()} | {typeof deferredCode === 'string' ? deferredCode.length : 0} caracteres | {lineCount}{' '}
              líneas
            </span>
          </div>
        </div>
      </main>
    </>
  );
};

export default memo(CodeEditor);