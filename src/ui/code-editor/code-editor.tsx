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

interface CodeEditorProps {
  value?: string;
  language?: 'json' | 'xml';
  onChange?: (value: string) => void;
  maxHeight?: string;
  height?: string;
  minHeight?: string;
  placeholder?: string;
  classNameContainer?: string;
  /**
   * Prop para controlar si el editor es editable.
   * @default true
   */
  isEditable?: boolean;
}

const CodeEditor = ({
  value = '',
  language = 'json',
  onChange,
  maxHeight = '100%',
  height = '200px',
  minHeight = '68vh',
  placeholder = '// Escribe tu código aqui...',
  classNameContainer = '',
  isEditable = true,
}: CodeEditorProps) => {
  const inputRefTextOld = useRef<HTMLInputElement>(null);
  const inputRefTextNew = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [isOpenBar, setIsOpenBar] = useState<boolean>(false);
  const [code, setCode] = useState(value);

  const { JsonSchema, minifyJson } = useJsonHook({ code, setCode });
  const { XmlScheme, minifyXml } = useXmlHook({ code, setCode });

  const lineCount = useMemo(() => code.split('\n').length, [code]);

  useEffect(() => {
    if (!isEditable) return;

    textareaRef.current?.focus();
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsOpenBar((prev) => !prev);
      }

      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        HandlersIdentarBody();
        alert('guardar y minificar');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isEditable]);

  useEffect(() => {
    setCode(value);
  }, [value]);

  const HandlersMinifyBody = () => {
    if (language === 'json') return minifyJson();
    if (language === 'xml') return minifyXml();
    return toast.error('Solo se puede minificar JSON o XML');
  };

  const HandlersIdentarBody = () => {
    if (language === 'json') return JsonSchema();
    if (language === 'xml') return XmlScheme();
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
    if (!isEditable) return;
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

  const handleOpenRemplazoBar = () => setIsOpenBar((prev) => !prev);

  const handleCLickReplaceTextFirst = () => {
    const from = inputRefTextOld.current?.value || '';
    const to = inputRefTextNew.current?.value || '';

    if (!from) return toast.error('Ingresa un valor a buscar');
    if (!code.includes(from))
      return toast.error('El valor a buscar no se encuentra en el texto');

    const result = code.replace(from, to);
    setCode(result);
    onChange?.(result);
    toast.success('Reemplazo realizado');
  };

  const handleCLickReplaceText = () => {
    const from = inputRefTextOld.current?.value || '';
    const to = inputRefTextNew.current?.value || '';

    if (!from) return toast.error('Ingresa un valor a buscar');
    if (!code.includes(from))
      return toast.error('El valor a buscar no se encuentra en el texto');

    const result = code.replaceAll(from, to);
    setCode(result);
    onChange?.(result);
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

  return (
    <main className="border rounded-xl overflow-hidden border-zinc-800 relative">
      <AnimatePresence mode="wait">
        {isOpenBar && isEditable && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.95, filter: 'blur(4px)' }}
            layout
            className="backdrop-blur-3xl bg-zinc-900/35 border border-zinc-900 p-3 flex flex-col w-52 shadow-xl shadow-zinc-800 gap-1 rounded right-4 top-5 absolute z-[778]"
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
              placeholder="Valor a reemplazar"
            />
            <div className="flex h-6 gap-2">
              <button
                className="bg-gradient-to-r flex-1 from-green-400 to-green-500 p-1 rounded-md text-xs"
                onClick={handleCLickReplaceTextFirst}
              >
                Reemplazar primero
              </button>
              <button
                className="bg-gradient-to-r flex-1 from-sky-400 to-sky-900 p-1 rounded-md text-xs"
                onClick={handleCLickReplaceText}
              >
                Reemplazar todo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative flex text-xs overflow-hidden bg-zinc-900/80 backdrop-blur-3xl ${classNameContainer}`}
      >
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="px-3 py-2 text-sm overflow-hidden bg-zinc-950/20 border-r border-zinc-800 text-[#00a4b9]"
          style={{ height, minHeight, maxHeight }}
        >
          {lineNumberElements}
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          <LazyListItem>
            <div
              style={{ height, minHeight, maxHeight }}
              ref={highlightRef}
              className="absolute inset-0 p-2 text-sm font-mono leading-6 pointer-events-none whitespace-pre-wrap break-words text-[#d4d4d4]"
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
              placeholder={placeholder}
              onChange={handleChange}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              className={`absolute inset-0 p-2 text-sm font-mono leading-6 resize-none outline-none bg-transparent whitespace-pre-wrap break-words ${!isEditable ? 'cursor-not-allowed' : ''}`}
              style={{
                height,
                color: isEditable ? 'transparent' : '#d4d4d4',
                caretColor: isEditable ? '#d4d4d4' : 'transparent',
              }}
              spellCheck={false}
              disabled={!isEditable}
            />
          </LazyListItem>
        </div>
      </div>

      {/* Footer */}
      <div className="relative flex justify-between items-center text-[8px] text-zinc-400 bg-zinc-950/70 border-t border-zinc-800 px-2 py-1.5 shadow-sm">
        {isEditable && (
          <div className="flex items-center gap-1">
            <button
              className="bg-zinc-900 hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1"
              onClick={HandlersIdentarBody}
            >
              <Icon icon="tabler:braces" width={14} />
              <span className="hidden sm:inline">Prettify</span>
            </button>

            <button
              className="bg-zinc-900 hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1"
              onClick={HandlersMinifyBody}
            >
              <Icon icon={bolt} width={14} />
              <span className="hidden sm:inline">Minify</span>
            </button>

            <button
              className="bg-zinc-900 hover:bg-zinc-700 px-2.5 py-1 rounded flex items-center gap-1"
              onClick={handleOpenRemplazoBar}
            >
              <Icon icon="tabler:replace" width={14} />
              <span className="hidden sm:inline">Reemplazar</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-green-400">
            {(() => {
              try {
                JSON.parse(code);
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
