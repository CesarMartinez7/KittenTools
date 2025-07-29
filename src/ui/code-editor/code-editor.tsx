import { Icon } from '@iconify/react/dist/iconify.js';
import bolt from '@iconify-icons/tabler/bolt';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LazyListItem from '../LazyListPerform';
import highlightCode from './higlight-code';
import type { CodeEditorProps } from './types';

const CodeEditor = ({
  value = 'dsfdsf',
  language = 'javascript',
  onChange,
  height = '200px',
  minHeight = '68vh',
  placeholder = '// Escribe tu código aquí...',
  classNameContainer = '100%',
}: CodeEditorProps) => {
  const inputRefTextOld = useRef<HTMLInputElement>(null);
  const inputRefTextNew = useRef<HTMLInputElement>(null);
  const refSection = useRef<HTMLDivElement>(null);
  const [isOpenBar, setIsOpenBar] = useState<boolean>(false);

  const [code, setCode] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Logica de intersection Observer con clases

  // const options = {
  //   root: document.querySelector(".list-name"),
  //   rootMargin: "0px",
  //   scrollMargin: "0px",
  //   threshold: 1.0,
  // };

  // const observer = new IntersectionObserver((entries, observer) => {
  //   entries.forEach((entry) => {
  //     if (entry.isIntersecting) {
  //       let elemt = entry.target;
  //     }
  //   });
  // }, options);

  // observer.observe(document.querySelectorAll(".list-name"))

  const lineCount = useMemo(() => {
    return code.split('\n').length;
  }, [code]);

  useEffect(() => {
    refSection.current?.focus();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // No importa si esta en minuscuela la b o en mayuscula siempre se abrira
      if ((e.ctrlKey && e.key === 'b') || (e.ctrlKey && e.key === 'B')) {
        e.preventDefault();
        setIsOpenBar((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []); // Effect

  // hacer una funcion o metodo para que se encargue de las cosas que se pueden hacer dependiendo del languaje

  const ValidateFunciones = (language: string, funcion: Function) => {
    console.log(language);
    console.log(funcion);
  };

  const handleClickminifyJson = () => {
    try {
      const parseado = JSON.parse(value);
      setCode(JSON.stringify(parseado));

      toast.success('JSON minificado');
    } catch {
      toast.error('JSON inválido para minificar');
    }
  };

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
      textareaRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollTop = scrollTop;

      // Left scroll
      highlightRef.current.scrollLeft = scrollLeft;
    }
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

  const handleJsonSchema = () => {
    setCode(JSON.stringify(JSON.parse(code), null, 4));
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
    <main className="border rounded-xl overflow-hidden border-zinc-800 relative ">
      <AnimatePresence mode="wait">
        {isOpenBar && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95, filter: 'blur(4px)' }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              transition: {
                type: 'spring',
                stiffness: 200,
                damping: 20,
              },
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.95,
              filter: 'blur(4px)',
              transition: { duration: 0.2 },
            }}
            layout
            className="backdrop-blur-3xl bg-zinc-900/35 border border-zinc-900 p-3 flex flex-col w-52 shadow-xl shadow-zinc-800 rounded right-4 top-5 absolute z-[778] gap-3
            "
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
                className="bg-gradient-to-r flex-1 from-green-400 to-green-500 p-1 rounded-md text-xs truncate"
                onClick={handleCLickReplaceTextFirst}
                title="Reemplazar solo la primera coincidencia"
              >
                Reemplazar primero
              </button>
              <button
                className="bg-gradient-to-r flex-1 from-sky-400 to-sky-900 p-1 rounded-md text-xs truncate"
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
        className={`relativ flex  text-xs overflow-hidden bg-zinc-900/60 ring-none backdrop-blur-3xl ${classNameContainer} `}
      >
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="px-3 py-2 text-sm overflow-hidden bg-zinc-950/20 border- rounded-tl-xl border-zinc-800 backdrop-blur-3xl text-zinc-400 "
          style={{ height, minHeight }}
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
                color: 'transparent',
                caretColor: '#d4d4d4',
              }}
              spellCheck={false}
              placeholder={placeholder}
            />
          </LazyListItem>
        </div>
      </div>

      {/* Footer toobar abajo */}
      <div className="relative flex justify-between items-center text-[8px] text-zinc-400 bg-zinc-950/70 border-t border-zinc-800 px-2 py-1.5 shadow-sm">
        {/* Botones a la izquieaa */}
        <div className="flex items-center gap-1">
          <button
            className="bg-zinc-900 hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1 transition"
            onClick={handleJsonSchema}
          >
            <Icon icon="tabler:braces" width={14} />
            <span className="hidden sm:inline">Identar</span>
          </button>

          <button
            className="bg-zinc-900 hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1 transition"
            onClick={handleClickminifyJson}
          >
            <Icon icon={bolt} width={14} />
            <span className="hidden sm:inline">Minify</span>
          </button>

          <button
            title="Abrir barra de reemplazo"
            className="bg-zinc-900 hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1 transition"
            onClick={() => setIsOpenBar((prev) => !prev)}
          >
            <Icon icon="tabler:replace" width={14} />
            <span className="hidden sm:inline">Reemplazar</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-green-400">
            {(() => {
              try {
                JSON.parse(value);
                return <Icon icon="tabler:check" width={13} height={13} />;
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
