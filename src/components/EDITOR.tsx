import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface EditorProps {
  setAllValues?: React.Dispatch<React.SetStateAction<string>>;
  allValues?: string;
}

export default function EditorJson({ setAllValues, allValues }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [selectionEnd, setSelectionEnd] = useState<number>();
  const [valueEnd, setValueEnd] = useState<number>();

  const getAllData = useCallback(() => {
    const inputs =
      document.querySelectorAll<HTMLInputElement>('.input-base-editor');
    const values = Array.from(inputs).map((input) => input.value || '');
    setAllValues?.(values.join(''));
    setLineCount(values.length);
  }, [setAllValues]);

  useEffect(() => {
    editorRef.current?.focus();

    try {
      const parsed = allValues ? JSON.parse(allValues) : null;
      setIsValid(true);
    } catch {
      setIsValid(false);
    }

    getAllData();
  }, [allValues, getAllData]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      setLineCount(editorRef.current.children.length);
    }
  }, []);

  const createInput = () => {
    const input = document.createElement('input');
    input.className =
      'input-base-editor text-red-500 bg-zinc-800 text-white outline-none px-2 py-1 mb-1 rounded';
    input.type = 'text';

    input.addEventListener('keydown', (e) => {
      const target = e.currentTarget as HTMLInputElement;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = target.previousElementSibling as HTMLInputElement;
        if (prev) prev.focus();
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = target.nextElementSibling as HTMLInputElement;
        if (next) next.focus();
      }

      if (e.key === 'Backspace' && target.value.length === 0) {
        e.preventDefault();
        toast.success('Línea eliminada');
        const prev = target.previousElementSibling as HTMLInputElement;
        if (prev) prev.focus();
        target.remove();
        getAllData();
      }

      if (e.key === 'Enter' && target.selectionEnd === target.value.length) {
        e.preventDefault();
        const editor = editorRef.current;
        if (!editor) return;

        const newInput = createInput();
        editor.insertBefore(newInput, target.nextSibling);
        newInput.focus();
        getAllData();
      }
    });

    return input;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && selectionEnd === valueEnd) {
      e.preventDefault();
      const editor = editorRef.current;
      if (!editor) return;

      const input = createInput();
      editor.appendChild(input);
      input.focus();
      getAllData();
    }
  };

  return (
    <div className="bg-black rounded-lg shadow-lg p-4 space-y-2 w-[80vh] max-w-full">
      <Toaster />
      <div
        ref={editorRef}
        className="bg-black/90 min-h-[500px] max-h-[500px] overflow-auto p-2 flex flex-col focus:outline-none border border-zinc-700 rounded"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <div className="flex justify-between">
        <p className="text-white text-xs">Líneas: {lineCount}</p>
        <p>{isValid ? '✅ JSON válido' : '❌ Inválido'}</p>
      </div>
    </div>
  );
}
