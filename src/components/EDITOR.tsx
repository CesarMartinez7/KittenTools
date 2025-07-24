import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function EditorJson() {
  const editorRef = useRef<HTMLDivElement>(null);

  const [lineCount, setLineCount] = useState(0);
  const [allValues, setAllValues] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [focusInput, setFocusInput] = useState<number>(0);
  const [changesDev, setChangesDev] = useState(false);
  const [currentIndexInput, setCurrentIndexInput] = useState<number>(0);

  // MEtodos para manejar y poner tener un mejor uso salto de ipnut
  const [selectionEnd, setSelectionEnd] = useState<number>();
  const [valueEnd, setValueEnd] = useState<number>();

  useEffect(() => {
    try {
      let parsed = JSON.parse(allValues);
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
    }
    // Recalcular los datos cada que cambia todo la data
    getAllData();
  }, [allValues, changesDev]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      setLineCount(editorRef.current.children.length);
    }
  }, []);

  const getAllData = useCallback(() => {
    const inputs =
      document.querySelectorAll<HTMLInputElement>(".input-base-editor");
    const values = Array.from(inputs).map((input) => input.value || " ");
    setAllValues(values.join(""));
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    setChangesDev((prev) => !prev);

    if (e.key === "Enter" && selectionEnd === valueEnd) {
      toast.error("TOAS FATHER");
      e.preventDefault();

      const editor = editorRef.current;
      if (!editor) return;

      const input = document.createElement("input");
      input.setAttribute("index", editor.children.length);

      input.className =
        "input-base-edito text-red-500 bg-zinc-800  text-white outline-none";
      input.type = "text";

      input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = input.previousElementSibling as HTMLInputElement;
          if (prev) prev.focus();
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = input.nextElementSibling as HTMLInputElement;
          if (next) next.focus();
        }

        if (e.key === "Backspace" && input.value.length === 0) {
          e.preventDefault();
          toast.success("Ir a tras");

          setValueEnd(input.value.length)
          setSelectionEnd(input.selectionEnd || 0)

          const prev = input.previousElementSibling as HTMLInputElement;
          if (prev) prev.focus();
        }

        if (e.key === "Backspace" && input.value.length === 0) {
          toast.error(
            "Elimiar este nodo si e.key === Backspace && input.value.length === 0 ",
          );
          input.remove();
        }

        if (e.key === "Enter" && input.selectionEnd === input.value.length) {
          toast.success("SIGUIENTE HERMANO ELEMNTEO");
        }
      });

      editor.appendChild(input);
      input.focus();
      setLineCount(editor.children.length + 1);
    }
  };

  return (
    <main className="flex flex-col justify-center items-center h-screen w-full bg-zinc-900">
      <Toaster />
      <div className="bg-black/20 rounded-lg shadow-lg p-4 space-y-2">
        <div
          ref={editorRef}
          className="bg-zinc-900 text-red-500 min-h-[500px] max-h-[500px] overflow-auto p-2 flex flex-col w-[80vh] focus:outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        />
        {/* {allValues && (
          <p className="text-sm text-white break-all">
            <strong>Valores:</strong> {allValues}
          </p>
        )} */}

        <div className="flex justify-between">
          <p className="text-white text-xs">Ln: {lineCount}</p>
          <p>{isValid ? "✅" : "❌"}</p>
        </div>
        <p>{focusInput}</p>
      </div>
    </main>
  );
}
