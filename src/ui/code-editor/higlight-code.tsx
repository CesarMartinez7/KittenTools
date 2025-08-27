import colors from './colors';
import keywords from './keyword';

const escapeHTML = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const highlightCode = (
  code: any,
  language: string,
  findResults: number[] = [],
  searchValue = '',
  currentMatchIndex = -1,
) => {
  if (code === null || code === undefined) return '';

  // 🔥 Escapamos SOLO el código crudo
  const rawCode = String(code);
  let highlightedHTML = escapeHTML(rawCode);

  // --- 🎨 Resaltado por lenguaje ---
  if (language === 'json') {
    highlightedHTML = highlightedHTML
      // keys
      .replace(
        /&quot;([^&]*)&quot;(?=\s*:)/g,
        `<span style="color:${colors.comment}">&quot;$1&quot;</span>`,
      )
      // valores string
      .replace(
        /&quot;([^&]*)&quot;/g,
        `<span style="color:${colors.tag}">&quot;$1&quot;</span>`,
      )
      // boolean / null
      .replace(
        /\b(true|false|null)\b/g,
        `<span style="color:${colors.keyword}">$1</span>`,
      )
      // números
      .replace(
        /\b(-?\d+\.?\d*)\b/g,
        `<span style="color:${colors.number}">$1</span>`,
      );
  } else if (language === 'xml') {
    highlightedHTML = highlightedHTML
      .replace(
        /&lt;!--[\s\S]*?--&gt;/g,
        `<span style="color:${colors.comment}">$&</span>`,
      )
      .replace(
        /(&lt;\/?)([a-zA-Z][\w:-]*)/g,
        `$1<span style="color:${colors.tag}">$2</span>`,
      )
      .replace(
        /([a-zA-Z_:][\w:-]*)=(&quot;[^&]*?&quot;)/g,
        `<span style="color:${colors.attribute}">$1</span>=<span style="color:${colors.value}">$2</span>`,
      )
      .replace(/&gt;/g, `<span style="color:${colors.tag}">&gt;</span>`);
  } else {
    const langKeywords = keywords[language] || keywords.javascript;

    highlightedHTML = highlightedHTML
      // 💬 Comentarios (// y /* */)
      .replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        `<span style="color:${colors.comment}">$1</span>`,
      )
      // 🔍 Expresiones regulares /pattern/flags
      .replace(
        /\/([^/\n\r*]([^/\n\r\\]|\\.)*)\/([gimuy]*)/g,
        `<span style="color:${colors.string}; font-style:italic">/$1/$2</span>`,
      )
      // 🌍 Variables de entorno {{variable}}
      .replace(
        /\{\{([^}]+)\}\}/g,
        `<span style="color:${colors.attribute}; background-color:rgba(255,193,7,0.2); padding:1px 3px; border-radius:3px">\{\{$1\}\}</span>`,
      )
      // 📝 Strings ('', "", ``)
      .replace(
        /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
        `<span style="color:${colors.string}">$1$2$3</span>`,
      )
      // 🔢 Números
      .replace(
        /\b(\d+\.?\d*)\b/g,
        `<span style="color:${colors.number}">$1</span>`,
      )
      // 🔧 Funciones
      .replace(
        /\b(\w+)(?=\s*\()/g,
        `<span style="color:${colors.function}">$1</span>`,
      );

    // 🔑 Keywords del lenguaje
    langKeywords.forEach((keyword: string) => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlightedHTML = highlightedHTML.replace(
        regex,
        `<span style="color:${colors.keyword}; font-weight:bold">$1</span>`,
      );
    });
  }

  // 🔍 Búsqueda
  if (findResults.length > 0 && searchValue) {
    const regex = new RegExp(searchValue, 'gi');
    highlightedHTML = highlightedHTML.replace(regex, (match, offset) => {
      const isCurrent = findResults[currentMatchIndex] === offset;
      const matchClass = isCurrent
        ? 'highlight-match highlight-match-active'
        : 'highlight-match';
      return `<span class="${matchClass}">${match}</span>`;
    });
  }

  return highlightedHTML;
};

export default highlightCode;
