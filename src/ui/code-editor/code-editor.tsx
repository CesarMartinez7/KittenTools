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
import { VariantsAnimation } from '../../pages/client/mapper-ops';

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

    if(code.length > 0){
      return code.split('\n').length;
    }

    
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
  }, []); // Effect

  useEffect(() => {
    setCode(value);
  }, [value]);

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
    <main className="border rounded-xl overflow-hidden border-zinc-800 relative">
      <AnimatePresence mode="wait">
        {isOpenBar && (
          <motion.div
            variants={VariantsAnimation}
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
        className={`relative flex  text-xs overflow-hidden bg-zinc-900/80 ring-none backdrop-blur-3xl ${classNameContainer} `}
      >
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="px-3 py-2 text-sm overflow-hidden bg-zinc-950/20 border- rounded-tl-xl border-zinc-800 backdrop-blur-3xl text-[#00a4b9]"
          style={{ height, minHeight, maxHeight }}
        >
          {lineNumberElements}
        </div>

        {/* Editor Container */}
        <div className="flex-1 relative ">
          <LazyListItem>
            <div
              ref={highlightRef}
              className="absolute  inset-0 p-2 text-sm font-mono leading-6 pointer-events-none overflow-hidden whitespace-pre-wrap break-words  text-[#d4d4d4]"
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
              aria-placeholder={placeholder}
              onChange={handleChange}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              className="absolute inset-0  transition-colors p-2 ring-none ring-0 focus:ring-none text-sm font-mono leading-6 resize-none outline-none bg-r whitespace-pre-wrap break-words"
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
            onClick={HandlersIdentarBody}
          >
            <Icon icon="tabler:braces" width={14} />
            <span className="hidden sm:inline">Prettify</span>
          </button>

          <button
            className="bg-zinc-900 hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1 transition"
            onClick={HandlersMinifyBody}
          >
            <Icon icon={bolt} width={14} />
            <span className="hidden sm:inline">Minify</span>
          </button>

          <button
            title="Abrir barra de reemplazo"
            className="bg-zinc-900 hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1 transition"
            onClick={handleOpenRemplazoBar}
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
