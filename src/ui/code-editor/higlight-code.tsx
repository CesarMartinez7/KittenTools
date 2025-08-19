import colors from './colors';
import keywords from './keyword';

const highlightCode = (
  code,
  language,
  findResults = [],
  searchValue = '',
  currentMatchIndex = -1,
  currentListEntornos,
) => {
  let highlightedCode = String(code);

  console.log(currentListEntornos);

  const escapeHTML = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  if (language === 'text') {
    return escapeHTML(highlightedCode);
  }

  highlightedCode = escapeHTML(highlightedCode);

  if (language === 'json') {
    highlightedCode = highlightedCode
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
    highlightedCode = highlightedCode
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

    highlightedCode = highlightedCode
      .replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        // Aquí se usa un color gris en hexadecimal para los comentarios
        `<span style="color: #888888;">$1</span>`,
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

      const before = highlightedCode.substring(lastIndex, startIndex);
      const match = String(code).substring(startIndex, endIndex);

      resultHTML += before;
      resultHTML += `<span class="${matchClass}">${match}</span>`;

      lastIndex = endIndex;
    });

    const after = highlightedCode.substring(lastIndex);
    resultHTML += after;

    highlightedCode = resultHTML;
  }

  return highlightedCode;
};

function highlightPart(fragment, language) {
  return fragment;
}

export default highlightCode;
