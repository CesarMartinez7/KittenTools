import type React from 'react';
import { useEffect, useState } from 'react';

// Interfaces
interface ICharacterDiff {
  valueLeft: string;
  valueRight: string;
  changed: boolean;
  index: number;
}

interface IWordDiff {
  valueLeft: string;
  valueRight: string;
  changed: boolean;
  index: number;
  letterDiferentes: ICharacterDiff[];
}

interface ILineDiff {
  index: number;
  cambiada: string;
  original: string;
  lineasBien: IWordDiff[];
}

interface Props {
  texto1: string;
  texto2: string;
}

// Función para comparar letras
const getCharactersWord = (
  cadenaOne: string,
  cadenaTwo: string,
): ICharacterDiff[] => {
  const wordsRight = cadenaOne.split('');
  const wordsLeft = cadenaTwo.split('');
  const changesDetected: ICharacterDiff[] = [];
  const totalLength = Math.max(wordsLeft.length, wordsRight.length);

  for (let index = 0; index < totalLength; index++) {
    const letterLeft = wordsLeft[index] || '';
    const letterRight = wordsRight[index] || '';
    changesDetected.push({
      valueLeft: letterLeft,
      valueRight: letterRight,
      changed: letterLeft !== letterRight,
      index,
    });
  }

  return changesDetected;
};

// Función para comparar palabras
const getWord = (rightLine: string, leftLine: string): IWordDiff[] => {
  const wordsRight = rightLine.split(' ');
  const wordsLeft = leftLine.split(' ');
  const totalLength = Math.max(wordsLeft.length, wordsRight.length);
  const changesDetected: IWordDiff[] = [];

  for (let index = 0; index < totalLength; index++) {
    const wordLeft = wordsLeft[index] || '';
    const wordRight = wordsRight[index] || '';

    changesDetected.push({
      valueLeft: wordLeft,
      valueRight: wordRight,
      letterDiferentes: getCharactersWord(wordRight, wordLeft),
      changed: wordLeft !== wordRight,
      index,
    });
  }

  return changesDetected;
};

// Función para comparar líneas
const getLines = (right: string, left: string): ILineDiff[] => {
  const linesRight = right.split('\n');
  const linesLeft = left.split('\n');
  const totalLines: number = Math.max(linesLeft.length, linesRight.length);
  const changesDetected: ILineDiff[] = [];

  for (let index = 0; index < totalLines; index++) {
    const leftLine = linesLeft[index] || '';
    const rightLine = linesRight[index] || '';

    if (leftLine !== rightLine) {
      changesDetected.push({
        index: index + 1,
        lineasBien: getWord(rightLine, leftLine),
        cambiada: leftLine,
        original: rightLine,
      });
    }
  }
  return changesDetected;
};

// COMPONENTE PRINCIPAL
export const ModalViewer = () => {
  const [originalText, setOriginalText] = useState<string>('');
  const [compareText, setComparateText] = useState<string>('');

  useEffect(() => {
    // Cargar textos desde localStorage al iniciar
    if (
      localStorage.getItem('originalText') &&
      localStorage.getItem('compareText')
    ) {
      setOriginalText(localStorage.getItem('originalText') || '');
      setComparateText(localStorage.getItem('compareText') || '');
    }

    return () => {
      if (originalText && compareText) {
        localStorage.setItem('originalText', originalText);
        localStorage.setItem('compareText', compareText);
      }
    };
  }, []);

  return (
    <main className="text-white p-6 flex flex-col gap-8 items-center justify-center bg-zinc-900/80 shadow-xl rounded-2xl">
      <div className="flex flex-col items-center gap-4 w-full">
        <h3 className="text-zinc-200 text-center text-lg gradient-text  font-bold">
          Comparador de Texto 🚀
        </h3>
        <div className="grid gap-5 md:grid-cols-2 w-full lg:w-6xl max-w-6xl">
          <div>
            <p className="my-2"># 1 Texto</p>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Texto Original"
              className="p-4 bg-zinc-800 rounded-lg shadow-inner min-h-[200px] resize-none outline-none focus:ring-2 ring-zinc-600 w-full"
            />
          </div>
          <div>
            <p className="my-2"># 2 Texto</p>
            <textarea
              value={compareText}
              onChange={(e) => setComparateText(e.target.value)}
              placeholder="Texto a Comparar"
              className="p-4 bg-zinc-800 rounded-lg shadow-inner min-h-[200px] resize-none outline-none focus:ring-2 ring-zinc-600 w-full"
            />
          </div>
        </div>
        <TextDiffViewer texto1={originalText} texto2={compareText} />
      </div>
    </main>
  );
};

// COMPONENTE DE COMPARACIÓN
export const TextDiffViewer: React.FC<Props> = ({ texto1, texto2 }) => {
  const changesDetected: ILineDiff[] = getLines(texto1, texto2);

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 relative gap-6  text-sm">
      <div>
        <p className="text-zinc-400 mb-2">Texto Original</p>
        <pre className="bg-zinc-950 text-white p-4 rounded-xl overflow-auto max-h-[300px] shadow h-[300px] whitespace-pre-wrap">
          {texto1}
        </pre>
      </div>

      <div>
        <h2 className="text-zinc-400 font-semibold mb-2">Diferencias</h2>
        <div className="bg-zinc-950 p-4 rounded-xl overflow-auto h-[300px] relative max-h-[300px] space-y-4 shadow ">
          {changesDetected.length === 0 ? (
            <p className="text-green-500 absolute  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
              No hay Diferencias
            </p>
          ) : (
            changesDetected.map((linea) => (
              <div key={linea.index}>
                <p className="text-zinc-500 mb-1 text-[10px]">
                  Línea {linea.index}
                </p>
                <div className="flex flex-wrap gap-2">
                  {linea.lineasBien.map((wordDiff, wordIdx) => (
                    <div key={wordIdx} className="flex gap-1">
                      {wordDiff.letterDiferentes.map((charDiff, charIdx) => (
                        <span
                          key={charIdx}
                          className={`${
                            charDiff.changed
                              ? 'text-red-400 font-bold'
                              : 'text-green-400'
                          } text-xs `}
                        >
                          {charDiff.valueLeft || '·'}
                        </span>
                      ))}
                      <span className="text-zinc-500"> </span>
                    </div>
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
