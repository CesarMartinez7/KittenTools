import { Icon } from '@iconify/react/dist/iconify.js';
import bolt from '@iconify-icons/tabler/bolt';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LazyListItem from '../LazyListPerform';
import highlightCode from './higlight-code';

import { useJsonHook } from './methods-json/method';
import { useXmlHook } from './methos-xml/method.xml';
import type { CodeEditorProps } from './types';

const CodeEditor = ({
  value = '',
  language = 'json',
  onChange,
  maxHeight = '100%',
  height = '200px',
  minHeight = '68vh',
  placeholder = '// Escribe tu código aqui...',
  classNameContainer = '',
}: CodeEditorProps) => {
  // Referencias al DOOM
  const inputRefTextOld = useRef<HTMLInputElement>(null);
  const inputRefTextNew = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [isOpenBar, setIsOpenBar] = useState<boolean>(false);
  const [code, setCode] = useState(value);

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

  // Efecttos
  useEffect(() => {
    textareaRef.current?.focus();
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // No importa si esta en minuscuela la b o en mayuscula siempre se abrira
      if ((e.ctrlKey && e.key === 'b') || (e.ctrlKey && e.key === 'B')) {
        e.preventDefault();
        setIsOpenBar((prev) => !prev);
      }

      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        HandlersIdentarBody();
        alert('guardar y minificar');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const HandlersMinifyBody = () => {
    if (language === 'json') {
      return minifyJson();
    }

    if (language === 'xml') {
      return minifyXml();
    }

    return toast.error(
      'Es diferente a json por lo ucal no se se puede minifycar',
    );
  };

  const HandlersIdentarBody = () => {
    if (language === 'json') return JsonSchema();

    if (language === 'xml') {
      return XmlScheme();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      lineNumbersRef.current!.scrollTop = scrollTop;
      highlightRef.current!.scrollTop = scrollTop;
      highlightRef.current!.scrollLeft = scrollLeft;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const handleOpenRemplazoBar = () => {
    setIsOpenBar((prev) => !prev);
  };

  const handleCLickReplaceTextFirst = () => {
    const from = inputRefTextOld.current?.value || '';
    const to = inputRefTextNew.current?.value || '';

    if (!from) return toast.error('Ingresa un valor a buscar');

    if (!value?.includes(from)) {
      return toast.error('El valor a buscar no se encuentra en el texto');
    }

    const result = value?.replace(from, to);
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

  const handleCLickReplaceText = () => {
    const from = inputRefTextOld.current?.value || '';
    const to = inputRefTextNew.current?.value || '';

    if (!value?.includes(from)) {
      return toast.error('El valor a buscar no se encuentra en el texto');
    }

    if (!from) return toast.error('Ingresa un valor a buscar');
    const result = value?.replaceAll(from, to);
    setCode(result);
    toast.success('Reemplazo realizado');
  };

  return (
    <main className="borde rounded-xl overflow-hidden relative">
      <AnimatePresence mode="wait">
        {isOpenBar && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              transition: { type: 'spring', stiffness: 200, damping: 20 },
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.95,
              filter: 'blur(4px)',
              transition: { duration: 0.2 },
            }}
            layout
            className="backdrop-blur-3xl bg-white/40 dark:bg-zinc-900/35 border border-gray-200 dark:border-zinc-900 p-3 flex flex-col w-52 shadow-xl dark:shadow-zinc-800 shadow-gray-300 gap-1 rounded right-4 top-5 absolute z-[778]"
          >
            <input
              ref={inputRefTextOld}
              type="text"
              autoFocus
              className="input-base"
              placeholder="Valor a buscar"
            />
            <input
              ref={inputRefTextNew}
              type="text"
              className="input-base"
              placeholder="Valor a Reemplazar"
            />
            <div className="flex h-6 gap-2">
              <button
                className="bg-gradient-to-r flex-1 from-green-400 to-green-500 p-1 rounded-md text-xs truncate text-white"
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

      <div
        className={`relative flex text-xs overflow-hidden bg-gray-100/50 dark:bg-zinc-900/50 ring-none backdrop-blur-3xl ${classNameContainer}`}
      >
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="px-3 py-2 text-sm overflow-hidd bg-gray-200/50  border-r-zinc-200  dark:bg-zinc-950/90   dark:border-zinc-800  text-sky-600 dark:text-[#00a4b9]"
          style={{ height, minHeight, maxHeight }}
        >
          {lineNumberElements}
        </div>

        {/* Editor Container */}
        <div className="flex-1 relative">
          <LazyListItem>
            <div
              ref={highlightRef}
              className="absolute inset-0 p-2 text-sm font-mono leading-6 pointer-events-none overflow-hidden whitespace-pre-wrap break-words text-gray-800 dark:text-[#d4d4d4]"
              dangerouslySetInnerHTML={{
                __html: highlightCode(code, language),
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
              className="absolute inset-0 transition-colors p-2 text-sm font-mono leading-6 resize-none outline-none bg-transparent placeholder-lime-600 dark:placeholder-lime-200"
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
      <div className="relative flex justify-between items-center text-[8px] text-gray-500 dark:text-zinc-400 bg-gray-200/70 dark:bg-zinc-950/50 border-t border-gray-300 dark:border-zinc-800 px-2 py-1.5 shadow-sm">
        <div className="flex items-center gap-1">
          <button
            className="bg-gray-300 hover:bg-gray-400 dark:bg-zinc-900 dark:hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1 transition"
            onClick={HandlersIdentarBody}
          >
            <Icon icon="tabler:braces" width={14} />
            <span className="hidden sm:inline">Prettify</span>
          </button>

          <button
            className="bg-gray-300 hover:bg-gray-400 dark:bg-zinc-900 dark:hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1 transition"
            onClick={HandlersMinifyBody}
          >
            <Icon icon={bolt} width={14} />
            <span className="hidden sm:inline">Minify</span>
          </button>

          <button
            className="bg-gray-300 hover:bg-gray-400 dark:bg-zinc-900 dark:hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1 transition"
            onClick={handleOpenRemplazoBar}
          >
            <Icon icon="tabler:replace" width={14} />
            <span className="hidden sm:inline">Reemplazar</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
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
