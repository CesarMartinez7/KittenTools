import colors from './colors';
import keywords from './keyword';

const escapeHTML = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const highlightCode = (
  code,
  language,
  findResults = [],
  searchValue = '',
  currentMatchIndex = -1,
) => {
  // Solución al error: Maneja el caso de que el código sea nulo o indefinido
  if (code === null || typeof code === 'undefined') {
    return '';
  }

  // Asegura que el código es una cadena
  const codeString = String(code);
  const highlightedCode = codeString;
  let highlightedHTML = '';

  // --- 🎨 Lógica de resaltado de sintaxis (Unificada) ---
  const applySyntaxHighlighting = (text, lang) => {
    let tempHighlighted = escapeHTML(text);

    if (lang === 'json') {
      tempHighlighted = tempHighlighted
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
    } else if (lang === 'xml') {
      tempHighlighted = tempHighlighted
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
      const langKeywords = keywords[lang] || keywords.javascript;

      tempHighlighted = tempHighlighted
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
        tempHighlighted = tempHighlighted.replace(
          regex,
          `<span style="color: ${colors.keyword}; font-weight: bold">$1</span>`,
        );
      });
    }

    tempHighlighted = tempHighlighted.replace(
      /{{(.*?)}}/g,
      `<span style="color: #7bb4ff;">{{$1}}</span>`,
    );

    return tempHighlighted;
  };

  // Aplica el resaltado solo si el lenguaje no es 'text'
  if (language !== 'text') {
    highlightedHTML = applySyntaxHighlighting(codeString, language);
  } else {
    highlightedHTML = escapeHTML(codeString);
  }

  // --- 🔍 Resaltado de búsqueda (Ahora funciona con el HTML) ---
  if (findResults.length > 0 && searchValue) {
    let resultHTML = '';
    let lastIndex = 0;

    findResults.forEach((startIndex, i) => {
      const isCurrent = i === currentMatchIndex;
      const matchClass = isCurrent
        ? 'highlight-match highlight-match-active'
        : 'highlight-match';

      const before = highlightedHTML.substring(lastIndex, startIndex);
      const match = highlightedHTML.substring(
        startIndex,
        startIndex + searchValue.length,
      );

      resultHTML += before;
      resultHTML += `<span class="${matchClass}">${match}</span>`;

      lastIndex = startIndex + searchValue.length;
    });

    const after = highlightedHTML.substring(lastIndex);
    resultHTML += after;

    highlightedHTML = resultHTML;
  }

  return highlightedHTML;
};

export default highlightCode;
