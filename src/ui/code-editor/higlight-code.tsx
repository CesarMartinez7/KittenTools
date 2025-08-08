import colors from './colors';
import keywords from './keyword';

const highlightCode = (code: string, language: string) => {
  let highlightedCode = code;

  const escapeHTML = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  if (language === 'json') {
    // JSON highlighting
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
        /<!--[\s\S]*?-->/g,
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

  highlightedCode = highlightedCode.replace(
    /{{(.*?)}}/g,
    `<span style="color: #7bb4ff;">{{$1}}</span>`,
  );

  return highlightedCode;
};

export default highlightCode;
