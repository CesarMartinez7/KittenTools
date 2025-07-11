import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

type Props = {
  texto1: string;
  texto2: string;
};



const getCharactersWord = (cadenaOne: string, cadenaTwo: string) => {

  console.log(`La cadena es cadenaText ${cadenaOne} ${cadenaTwo}`)

}

const getWord = (rightLine: string, leftLine: string) => {
  const wordsRight = rightLine.split(" ");
  const wordsLeft = leftLine.split(" ");
  const totalLength = Math.max(wordsLeft.length, wordsRight.length);

  const changesDetected = [];

  for (let index = 0; index < totalLength; index++) {
    const wordLeft = wordsLeft[index] || "";
    const wordRight = wordsRight[index] || "";

    changesDetected.push({
      valueLeft: wordLeft,
      valueRight: wordRight,
      changed: wordLeft !== wordRight,
      index,
    });
  }

  return changesDetected;
};

const getLines = (right: string, left: string) => {
  // lineas
  const linesRight = right.split("\n");
  const linesLeft = left.split("\n");

  console.log(`Longitud ${linesLeft}`);
  console.log(`Longitud ${linesRight}`);

  const totalLines: number = Math.max(linesLeft.length, linesRight.length);

  const changesDetected = [];

  for (let index = 0; index < totalLines; index++) {
    // Lineas actuales
    const leftLine = linesLeft[index] || "";
    const rightLine = linesRight[index] || "";

    if (leftLine !== rightLine) {
      changesDetected.push({
        index: index + 1,
        lineasBien: getWord(rightLine, leftLine),
        cambiada: linesLeft[index],
        original: linesRight[index],
      });
    }
  }
  return changesDetected;
};

export const ModalViewer = () => {
  const [originalText, setOriginalText] = useState<string>("");
  const [compareText, setComparateText] = useState<string>("");

  const handleChangeOriginalText = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setOriginalText(e.target.value);
  };

  const handleChangeComparateText = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setComparateText(e.target.value);
  };

  return (
    <main className="min-h-screen  text-white p-6 flex flex-col gap-8 items-center justify-center">
      <div>
        <h3 className="text-zinc-200 text-center text-lg">Comparar Texto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
          <div className="w-xl">
            <p># 1</p>
            <textarea
              onChange={handleChangeOriginalText}
              placeholder="Texto Original"
              className="p-4 bg-zinc-800 rounded-lg shadow-inner min-h-[200px] resize-none outline-none focus:ring-2 ring-zinc-600"
            />
          </div>
          <div>
            <p># 2</p>
            <textarea
              onChange={handleChangeComparateText}
              placeholder="Texto compa"
              className="p-4 bg-zinc-800 rounded-lg shadow-inner min-h-[200px] resize-none outline-none focus:ring-2 ring-zinc-600"
            />
          </div>
        </div>
        <TextDiffViewer texto1={originalText} texto2={compareText} />
      </div>
      <p className="text-zinc-400 text-xs">
        Las comparaciones estan hechas por parrafos despues de un salto de linea
        y palabras, no por caracteres.
      </p>
    </main>
  );
};

export const TextDiffViewer: React.FC<Props> = ({ texto1, texto2 }) => {
  const changesDetected = getLines(texto1, texto2);

  return (
    <div className="w-full  max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 font-mono bg-red text-sm">
      <div>
        <p className="gradient-text">Texto Principal</p>
        <pre className="bg-zinc-900 text-white p-4 rounded-xl overflow-auto max-h-[300px] h-[300px] shadow">
          {texto1}
        </pre>
      </div>
      <div>
        <h2 className="gradient-text font-semibold text-zinc-400 ">
          Diferencias
        </h2>
        <div className="bg-zinc-900 p-4 rounded-xl overflow-auto h-[300px] max-h-[300px] space-y-3 shadow">
          {changesDetected.length === 0 ? (
            <p className="text-green-500">No hay Diferencias</p>
          ) : (
            changesDetected.map((e) => (
              <div key={crypto.randomUUID()} className="whitespace-pre-wrap">
                <p className="text-zinc-400 mb-1">Línea {e.index}</p>
                <div className="flex flex-wrap gap-2">
                  {e.lineasBien.map((wordDiff: any, idx: number) => (
                    <span
                      key={idx}
                      className={` ${
                        wordDiff.changed ? "text-red-400 " : "text-green-300"
                      }`}
                    >
                      <span className="text-xs text-zinc-300 block">A:</span>
                      {wordDiff.valueLeft || (
                        <span className="italic opacity-50">[vacio]</span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {e.lineasBien.map((wordDiff: any, idx: number) => (
                    <span
                      key={idx}
                      className={` ${
                        wordDiff.changed ? "text-red-400" : "text-green-300"
                      }`}
                    >
                      <span className="text-xs text-zinc-300 block">B:</span>
                      {wordDiff.valueRight || (
                        <span className="italic opacity-50">[vacio]</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
