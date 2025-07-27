import type React from 'react';
import { useEffect, useRef, useState } from 'react';

const highlightCode = (code: string, language: string) => {
  const keywords: Record<string, string[]> = {
    javascript: [
      'function',
      'const',
      'let',
      'var',
      'if',
      'else',
      'for',
      'while',
      'return',
      'class',
      'extends',
      'import',
      'export',
      'default',
      'async',
      'await',
      'try',
      'catch',
      'throw',
      'new',
      'this',
      'super',
      'static',
    ],
    typescript: [
      'function',
      'const',
      'let',
      'var',
      'if',
      'else',
      'for',
      'while',
      'return',
      'class',
      'extends',
      'import',
      'export',
      'default',
      'async',
      'await',
      'try',
      'catch',
      'throw',
      'new',
      'this',
      'super',
      'static',
      'interface',
      'type',
      'enum',
      'namespace',
      'public',
      'private',
      'protected',
    ],
    json: [],
    xml: [],
  };

  const colors = {
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    number: '#fdc700',
    function: '#dcdcaa',
    tag: '#4ec9b0',
    attribute: '#b271ea',
    value: '#ce9178',
  };

  let highlightedCode = code;

  if (language === 'json') {
    // JSON highlighting
    highlightedCode = code
      .replace(/"([^"\\]|\\.)*"/g, (match) => {
        if (match.endsWith('":') || match.endsWith('": ')) {
          return `<span style="color: ${colors.attribute}">${match}</span>`;
        }
        return `<span style="color: ${colors.string}">${match}</span>`;
      })
      .replace(
        /\b(true|false|null)\b/g,
        `<span style="color: ${colors.keyword}">$1</span>`,
      )
      .replace(
        /\b(-?\d+\.?\d*)\b/g,
        `<span style="color: ${colors.number}">$1</span>`,
      );
  } else if (language === 'xml') {
    // XML highlighting
    highlightedCode = code
      .replace(
        /<!--[\s\S]*?-->/g,
        `<span style="color: ${colors.comment}">$&</span>`,
      )
      .replace(
        /<\/?([a-zA-Z][a-zA-Z0-9]*)/g,
        `<span style="color: ${colors.tag}">&lt;$1</span>`,
      )
      .replace(
        /([a-zA-Z-]+)=/g,
        `<span style="color: ${colors.attribute}">$1</span>=`,
      )
      .replace(/"([^"]*)"/g, `<span style="color: ${colors.value}">"$1"</span>`)
      .replace(/>/g, `<span style="color: ${colors.tag}">&gt;</span>`);
  } else {
    // JavaScript/TypeScript highlighting
    const langKeywords = keywords[language] || keywords.javascript;

    highlightedCode = code
      // Comentarios
      .replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        `<span style="color: ${colors.comment}">$1</span>`,
      )
      // Strings
      .replace(
        /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
        `<span style="color: ${colors.string}">$1$2$3</span>`,
      )
      // Números
      .replace(
        /\b(\d+\.?\d*)\b/g,
        `<span style="color: ${colors.number}">$1</span>`,
      )
      // Funciones
      .replace(
        /\b(\w+)(?=\s*\()/g,
        `<span style="color: ${colors.function}">$1</span>`,
      );

    // Keywords
    langKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlightedCode = highlightedCode.replace(
        regex,
        `<span style="color: ${colors.keyword}; font-weight: bold">$1</span>`,
      );
    });
  }

  return highlightedCode;
};

interface CodeEditorProps {
  value?: string;
  language?: 'javascript' | 'typescript' | 'json' | 'xml';
  onChange?: (value: string | undefined | null) => void;
  height?: string;
  placeholder?: string;
}

export const CodeEditor = ({
  value = '',
  language = 'javascript',
  onChange,
  height = '200px',
  placeholder = '// Escribe tu código aquí...',
}: CodeEditorProps) => {
  const [code, setCode] = useState(value);
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineCount(lines);
  }, [code]);

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
      highlightRef.current.scrollTop = scrollTop;
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

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="relative flex border border-zinc-800 text-xs rounded-md overflow-hidden bg-zinc-900/60 ring-none backdrop-blur-3xl">
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        className="px-3 py-2 text-sm  overflow-hidden  bg-zinc-900/60 backdrop-blur-3xl text-zinc-400 "
        style={{ height }}
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
      <div className="flex-1 relative">
        {/* Syntax Highlighted Background */}
        <div
          ref={highlightRef}
          className="absolute inset-0 p-2 text-sm font-mono leading-6 pointer-events-none overflow-auto whitespace-pre-wrap break-words text-[#d4d4d4]"
          dangerouslySetInnerHTML={{
            __html: highlightCode(code, language),
          }}
        />

        {/* Transparent Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 p-2 ring-none ring-0  focus:ring-none text-sm font-mono leading-6 resize-none outline-none bg-r caret-white whitespace-pre-wrap break-words"
          style={{
            height,
            color: 'transparent',
            caretColor: '#d4d4d4',
          }}
          spellCheck={false}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

// export default function Component() {
//   const [code, setCode] =
//     useState(`// Ejemplo de código JavaScript con syntax highlighting
// function fibonacci(n) {
//   if (n <= 1) return n;
//   return fibonacci(n - 1) + fibonacci(n - 2);
// }

// // Ejemplo de uso con colores
// console.log("Fibonacci de 10:", fibonacci(10));

// // Función para validar email
// function validateEmail(email) {
//   const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
//   return regex.test(email);
// }

// // Clase ejemplo con syntax highlighting
// class Calculator {
//   constructor() {
//     this.result = 0;
//   }
  
//   add(num) {
//     this.result += num;
//     return this;
//   }
  
//   multiply(num) {
//     this.result *= num;
//     return this;
//   }
  
//   getResult() {
//     return this.result;
//   }
// }

// // Uso de la clase
// const calc = new Calculator();
// const result = calc.add(5).multiply(3).getResult();
// console.log("Resultado:", result);

// // Ejemplo con async/await
// async function fetchData(url) {
//   try {
//     const response = await fetch(url);
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error:", error);
//     throw error;
//   }
// }

// // Array methods con colores
// const numbers = [1, 2, 3, 4, 5];
// const doubled = numbers.map(n => n * 2);
// const filtered = doubled.filter(n => n > 5);
// console.log("Filtered:", filtered);`);

//   const [language, setLanguage] = useState('javascript');
//   const [theme, setTheme] = useState('vs-dark');
//   const [wordCount, setWordCount] = useState(0);
//   const [lineCount, setLineCount] = useState(0);

//   useEffect(() => {
//     const words = code
//       .trim()
//       .split(/\s+/)
//       .filter((word) => word.length > 0).length;
//     const lines = code.split('\n').length;
//     setWordCount(words);
//     setLineCount(lines);
//   }, [code]);

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(code);
//     } catch (err) {
//       console.error('Error al copiar:', err);
//     }
//   };

//   const handleDownload = () => {
//     const extensions: Record<string, string> = {
//       javascript: 'js',
//       typescript: 'ts',
//       json: 'json',
//       xml: 'xml',
//     };

//     const extension = extensions[language] || 'txt';
//     const blob = new Blob([code], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `code.${extension}`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   const handleReset = () => {
//     setCode('');
//   };

//   const handleRun = () => {
//     if (language === 'javascript') {
//       try {
//         console.log('🚀 Ejecutando código JavaScript...');
//         eval(code);
//       } catch (error) {
//         console.error('❌ Error en el código:', error);
//       }
//     }
//   };

//   const loadSampleCode = (lang: string) => {
//     const samples: Record<string, string> = {
//       javascript: `// JavaScript con syntax highlighting
// function quickSort(arr) {
//   if (arr.length <= 1) return arr;
  
//   const pivot = arr[Math.floor(arr.length / 2)];
//   const left = arr.filter(x => x < pivot);
//   const middle = arr.filter(x => x === pivot);
//   const right = arr.filter(x => x > pivot);
  
//   return [...quickSort(left), ...middle, ...quickSort(right)];
// }

// const numbers = [64, 34, 25, 12, 22, 11, 90];
// console.log("Original:", numbers);
// console.log("Sorted:", quickSort(numbers));`,

//       typescript: `// TypeScript con syntax highlighting
// function quickSort(arr: number[]): number[] {
//   if (arr.length <= 1) return arr;
  
//   const pivot = arr[Math.floor(arr.length / 2)];
//   const left = arr.filter(x => x < pivot);
//   const middle = arr.filter(x => x === pivot);
//   const right = arr.filter(x => x > pivot);
  
//   return [...quickSort(left), ...middle, ...quickSort(right)];
// }

// const numbers: number[] = [64, 34, 25, 12, 22, 11, 90];
// console.log("Original:", numbers);
// console.log("Sorted:", quickSort(numbers));`,

//       python: `# Python con syntax highlighting
// def quick_sort(arr):
//     if len(arr) <= 1:
//         return arr
    
//     pivot = arr[len(arr) // 2]
//     left = [x for x in arr if x < pivot]
//     middle = [x for x in arr if x == pivot]
//     right = [x for x in arr if x > pivot]
    
//     return quick_sort(left) + middle + quick_sort(right)

// # Ejemplo de uso
// numbers = [64, 34, 25, 12, 22, 11, 90]
// print("Original:", numbers)
// print("Sorted:", quick_sort(numbers))

// # Clase ejemplo
// class Calculator:
//     def __init__(self):
//         self.result = 0
    
//     def add(self, num):
//         self.result += num
//         return self
    
//     def multiply(self, num):
//         self.result *= num
//         return self`,

//       java: `// Java con syntax highlighting
// public class QuickSort {
//     public static void main(String[] args) {
//         int[] numbers = {64, 34, 25, 12, 22, 11, 90};
//         System.out.println("Original: " + Arrays.toString(numbers));
//         System.out.println("Sorted: " + Arrays.toString(quickSort(numbers)));
//     }
    
//     public static int[] quickSort(int[] arr) {
//         if (arr.length <= 1) return arr;
        
//         int pivot = arr[arr.length / 2];
//         int[] left = Arrays.stream(arr).filter(x -> x < pivot).toArray();
//         int[] middle = Arrays.stream(arr).filter(x -> x == pivot).toArray();
//         int[] right = Arrays.stream(arr).filter(x -> x > pivot).toArray();
        
//         return concatenate(quickSort(left), middle, quickSort(right));
//     }
    
//     public static int[] concatenate(int[] a, int[] b, int[] c) {
//         int[] result = new int[a.length + b.length + c.length];
//         System.arraycopy(a, 0, result, 0, a.length);
//         System.arraycopy(b, 0, result, a.length, b.length);
//         System.arraycopy(c, 0, result, a.length + b.length, c.length);
//         return result;
//     }
// }`,

//       cpp: `// C++ con syntax highlighting
// #include <iostream>
// #include <vector>
// #include <algorithm>

// std::vector<int> quickSort(const std::vector<int>& arr) {
//     if (arr.size() <= 1) return arr;
    
//     int pivot = arr[arr.size() / 2];
//     std::vector<int> left, middle, right;
    
//     for (int x : arr) {
//         if (x < pivot) left.push_back(x);
//         else if (x == pivot) middle.push_back(x);
//         else right.push_back(x);
//     }
    
//     std::vector<int> sortedLeft = quickSort(left);
//     std::vector<int> sortedRight = quickSort(right);
    
//     sortedLeft.insert(sortedLeft.end(), middle.begin(), middle.end());
//     sortedLeft.insert(sortedLeft.end(), sortedRight.begin(), sortedRight.end());
//     return sortedLeft;
// }

// int main() {
//     std::vector<int> numbers = {64, 34, 25, 12, 22, 11, 90};
//     std::cout << "Original: ";
//     for (int num : numbers) std::cout << num << " ";
//     std::cout << std::endl;
    
//     std::vector<int> sortedNumbers = quickSort(numbers);
//     std::cout << "Sorted: ";
//     for (int num : sortedNumbers) std::cout << num << " ";
//     std::cout << std::endl;
    
//     return 0;
// }`,

//       html: `<!DOCTYPE html>
// <html lang="es">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Mi Página Web</title>
//     <style>
//         body { font-family: Arial, sans-serif; }
//         .container { max-width: 800px; margin: 0 auto; }
//         .header { background: #333; color: white; padding: 1rem; }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <header class="header">
//             <h1>Bienvenido a mi sitio</h1>
//         </header>
//         <main>
//             <p>Este es un ejemplo de HTML con colores.</p>
//         </main>
//     </div>
// </body>
// </html>`,

//       css: `/* CSS con syntax highlighting */
// .container {
//     max-width: 1200px;
//     margin: 0 auto;
//     padding: 20px;
//     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// }

// .card {
//     background: white;
//     border-radius: 8px;
//     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//     padding: 24px;
//     margin-bottom: 20px;
//     transition: transform 0.2s ease;
// }

// .card:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
// }

// @media (max-width: 768px) {
//     .container {
//         padding: 10px;
//     }
// }`,
//     };

//     setCode(samples[lang] || samples.javascript);
//   };

//   const languages = [
//     { value: 'javascript', label: 'JavaScript' },
//     { value: 'typescript', label: 'TypeScript' },
//     { value: 'python', label: 'Python' },
//     { value: 'java', label: 'Java' },
//     { value: 'cpp', label: 'C++' },
//     { value: 'html', label: 'HTML' },
//     { value: 'css', label: 'CSS' },
//     { value: 'json', label: 'JSON' },
//     { value: 'xml', label: 'XML' },
//   ];

//   const themes = [
//     { value: 'vs-dark', label: 'VS Code Dark' },
//     { value: 'vs-light', label: 'VS Code Light' },
//     { value: 'monokai', label: 'Monokai' },
//   ];

//   return (
//     <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle className="flex items-center gap-2">
//               <Settings className="w-5 h-5" />
//               Editor de Código con Syntax Highlighting
//               <Badge variant="secondary">{language.toUpperCase()}</Badge>
//             </CardTitle>
//             <div className="flex items-center gap-2">
//               <Select
//                 value={language}
//                 onValueChange={(value) => {
//                   setLanguage(value);
//                   loadSampleCode(value);
//                 }}
//               >
//                 <SelectTrigger className="w-40">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {languages.map((lang) => (
//                     <SelectItem key={lang.value} value={lang.value}>
//                       {lang.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <Select value={theme} onValueChange={setTheme}>
//                 <SelectTrigger className="w-40">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {themes.map((t) => (
//                     <SelectItem key={t.value} value={t.value}>
//                       {t.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           {/* Toolbar */}
//           <div className="flex items-center justify-between border-b pb-3">
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => navigator.clipboard.writeText(code)}
//               >
//                 <Copy className="w-4 h-4 mr-2" />
//                 Copiar
//               </Button>
//               <Button variant="outline" size="sm" onClick={handleDownload}>
//                 <Download className="w-4 h-4 mr-2" />
//                 Descargar
//               </Button>
//               <Button variant="outline" size="sm" onClick={handleReset}>
//                 <RotateCcw className="w-4 h-4 mr-2" />
//                 Limpiar
//               </Button>
//               {language === 'javascript' && (
//                 <Button variant="default" size="sm" onClick={handleRun}>
//                   <Play className="w-4 h-4 mr-2" />
//                   Ejecutar
//                 </Button>
//               )}
//             </div>

//             <div className="flex items-center gap-4 text-sm text-muted-foreground">
//               <span>Líneas: {lineCount}</span>
//               <span>Palabras: {wordCount}</span>
//               <span>Caracteres: {code.length}</span>
//             </div>
//           </div>

//           {/* Editor */}
//           <CodeEditor
//             value={code}
//             language={language}
//             onChange={setCode}
//             height="600px"
//           />

//           {/* Status Bar */}
//           <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded">
//             <div className="flex items-center gap-4">
//               <span>🎨 Syntax Highlighting: Activo</span>
//               <span>
//                 Lenguaje: {languages.find((l) => l.value === language)?.label}
//               </span>
//               <span>Tema: {themes.find((t) => t.value === theme)?.label}</span>
//             </div>
//             <div className="flex items-center gap-4">
//               <span>Ln {lineCount}, Col 1</span>
//               <span>UTF-8</span>
//               <span>Espacios: 2</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Color Legend */}
//       <Card>
//         <CardHeader>
//           <CardTitle>
//             Leyenda de Colores - Tema{' '}
//             {themes.find((t) => t.value === theme)?.label}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="flex items-center gap-2">
//               <div
//                 className="w-4 h-4 rounded"
//                 style={{
//                   backgroundColor: '#569cd6',
//                 }}
//               ></div>
//               <span className="text-sm">Keywords (function, class, if)</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div
//                 className="w-4 h-4 rounded"
//                 style={{
//                   backgroundColor: '#ce9178',
//                 }}
//               ></div>
//               <span className="text-sm">Strings ("texto")</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div
//                 className="w-4 h-4 rounded"
//                 style={{
//                   backgroundColor: '#6a9955',
//                 }}
//               ></div>
//               <span className="text-sm">Comentarios (// /*)</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div
//                 className="w-4 h-4 rounded"
//                 style={{
//                   backgroundColor: '#b5cea8',
//                 }}
//               ></div>
//               <span className="text-sm">Números (123, 45.6)</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div
//                 className="w-4 h-4 rounded"
//                 style={{
//                   backgroundColor: '#4ec9b0',
//                 }}
//               ></div>
//               <span className="text-sm">Tags (&lt;tag&gt;)</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div
//                 className="w-4 h-4 rounded"
//                 style={{
//                   backgroundColor: '#92c5f8',
//                 }}
//               ></div>
//               <span className="text-sm">Attributes (attr="value")</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div
//                 className="w-4 h-4 rounded"
//                 style={{
//                   backgroundColor: '#ce9178',
//                 }}
//               ></div>
//               <span className="text-sm">Values ("value")</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
