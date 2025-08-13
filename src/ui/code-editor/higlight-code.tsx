import colors from './colors';
import keywords from './keyword';

const highlightCode = (
  code: string,
  language: string,
  findResults: number[] = [],
  searchValue: string = '',
  currentMatchIndex: number = -1
) => {
  let highlightedCode = code;

  const escapeHTML = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  if (language === 'json') {
    highlightedCode = code
      .replace(/"([^"\\]|\\.)*"/g, (match) => {
        if (match.endsWith('":') || match.endsWith('": ')) {
          return `<span style="color: ${colors.comment}">${match}</span>`;
        }
        return `<span style="color: ${colors.tag}">${match}</span>`;
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
    highlightedCode = escapeHTML(code)
      .replace(
        /&lt;!--[\s\S]*?--&gt;/g,
        `<span style="color: ${colors.comment}">$&</span>`,
      )
      .replace(
        /(&lt;\/?)([a-zA-Z][\w:-]*)/g,
        `$1<span style="color: ${colors.tag}">$2</span>`,
      )
      .replace(
        /([a-zA-Z_:][\w:-]*)=(&quot;[^&]*?&quot;)/g,
        `<span style="color: ${colors.attribute}">$1</span>=<span style="color: ${colors.value}">$2</span>`,
      )
      .replace(/&gt;/g, `<span style="color: ${colors.tag}">&gt;</span>`);
  } else {
    const langKeywords = keywords[language] || keywords.javascript;

    highlightedCode = code
      .replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        `<span style="color: ${colors.comment}">$1</span>`,
      )
      .replace(
        /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
        `<span style="color: ${colors.string}">$1$2$3</span>`,
      )
      .replace(
        /\b(\d+\.?\d*)\b/g,
        `<span style="color: ${colors.number}">$1</span>`,
      )
      .replace(
        /\b(\w+)(?=\s*\()/g,
        `<span style="color: ${colors.function}">$1</span>`,
      );

    langKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlightedCode = highlightedCode.replace(
        regex,
        `<span style="color: ${colors.keyword}; font-weight: bold">$1</span>`,
      );
    });
  }

  highlightedCode = highlightedCode.replace(
    /{{(.*?)}}/g,
    `<span style="color: #7bb4ff;">{{$1}}</span>`,
  );

  // --- 🔍 Resaltado de búsqueda ---
  if (findResults.length > 0 && searchValue) {
    let resultHTML = '';
    let lastIndex = 0;

    findResults.forEach((startIndex, i) => {
      const endIndex = startIndex + searchValue.length;
      const isCurrent = i === currentMatchIndex;
      const matchClass = isCurrent
        ? 'highlight-match highlight-match-active'
        : 'highlight-match';

      // Convertimos el texto original escapado para no romper HTML
      const before = escapeHTML(code.substring(lastIndex, startIndex));
      const match = escapeHTML(code.substring(startIndex, endIndex));

      // Reaplicamos el resaltado de sintaxis sobre la parte antes del match
      resultHTML += highlightPart(before, language);
      // Insertamos el match con su clase
      resultHTML += `<span class="${matchClass}">${match}</span>`;

      lastIndex = endIndex;
    });

    // Resto del texto
    const after = escapeHTML(code.substring(lastIndex));
    resultHTML += highlightPart(after, language);

    highlightedCode = resultHTML;
  }

  return highlightedCode;
};

// Resalta un fragmento según el lenguaje
function highlightPart(fragment: string, language: string) {
  // Aquí podrías reutilizar parte de la lógica de arriba para aplicar solo a fragmentos.
  // Por simplicidad lo devuelvo sin re-resaltar para que no se duplique el trabajo.
  return fragment;
}

export default highlightCode;
