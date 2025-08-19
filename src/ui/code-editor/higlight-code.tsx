import colors from './colors';
import keywords from './keyword';
import { Value } from '../../pages/client/components/enviroment/types';

const highlightCode = (
  code: string,
  language: string,
  findResults: number[] = [],
  searchValue: string = '',
  currentMatchIndex: number = -1,
  entornoVariables: Value[] = []
) => {
  const safeCode = String(code || '');

  let highlightedCode = '';

  const escapeHTML = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  if (language === 'text') {
    highlightedCode = escapeHTML(safeCode);
  } else if (language === 'json') {
    highlightedCode = safeCode
      .replace(/"([^"\\]|\\.)*"/g, (match) => {
        if (match.endsWith('":') || match.endsWith('": ')) {
          return `<span style="color: ${colors.comment}">${escapeHTML(match)}</span>`;
        }
        return `<span style="color: ${colors.tag}">${escapeHTML(match)}</span>`;
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
    highlightedCode = escapeHTML(safeCode)
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

    highlightedCode = safeCode
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

  // Resaltado de variables de entorno
  highlightedCode = highlightedCode.replace(
    /{{(.*?)}}/g,
    (match, grupo) => {
      const variable = entornoVariables.find(
        (item) => item.key.trim() === grupo.trim()
      );
      const isDefinedAndEnabled = variable && variable.enabled === true;
      const color = isDefinedAndEnabled ? '#7bb4ff' : '#D2042D';
      return `<span style="color: ${color};">${escapeHTML(match)}</span>`;
    }
  );

  // Resaltado de búsqueda final, aplicado sobre el HTML ya generado
  if (findResults.length > 0 && searchValue) {
    let tempHighlighted = '';
    let lastIndex = 0;
    const escapedSearchValue = escapeHTML(searchValue);

    findResults.forEach((startIndex, i) => {
      const endIndex = startIndex + searchValue.length;
      const isCurrent = i === currentMatchIndex;
      const matchClass = isCurrent
        ? 'highlight-match highlight-match-active'
        : 'highlight-match';

      tempHighlighted += highlightedCode.substring(lastIndex, startIndex);
      tempHighlighted += `<span class="${matchClass}">${highlightedCode.substring(startIndex, endIndex)}</span>`;
      lastIndex = endIndex;
    });

    tempHighlighted += highlightedCode.substring(lastIndex);
    highlightedCode = tempHighlighted;
  }

  return highlightedCode;
};

// Resalta un fragmento según el lenguaje
function highlightPart(fragment: string, language: string) {
  // Por simplicidad, se devuelve sin re-resaltar para evitar bucles.
  return fragment;
}

export default highlightCode;
