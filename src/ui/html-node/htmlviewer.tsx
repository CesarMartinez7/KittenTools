import { Icon } from '@iconify/react';
import searchIcon from '@iconify-icons/tabler/search';
import React, { useMemo, useState } from 'react';
import HtmlNode from '../html';

interface HtmlViewerProps {
  data: string;
}

const parseHtmlString = (htmlString: string): Node | null => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.documentElement;
  } catch (error) {
    console.error('Failed to parse HTML string:', error);
    return null;
  }
};

const HtmlViewer: React.FC<HtmlViewerProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lines, setLines] = useState<number[]>([]);
  const lineCountRef = React.useRef(0);

  const parsedNode = useMemo(() => {
    return parseHtmlString(data);
  }, [data]);

  // A function to be passed down to HtmlNode to increment the line count.
  const incrementLine = () => {
    lineCountRef.current += 1;
    // You'd typically update state here if you wanted a reactive line counter,
    // but a ref is more performant for this purpose.
  };

  // Re-calculate lines when data changes
  React.useEffect(() => {
    lineCountRef.current = 0;
    const dummyNode = document.createElement('div');
    const rootNode = parseHtmlString(data);

    const traverseForLines = (node: Node) => {
      if (!node) return;
      lineCountRef.current++;
      if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(traverseForLines);
        lineCountRef.current++; // For the closing tag
      }
    };
    if (rootNode) {
      traverseForLines(rootNode);
    }
    setLines(Array.from({ length: lineCountRef.current }, (_, i) => i + 1));
  }, [data]);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="relative mb-2">
        <input
          type="text"
          placeholder="Buscar HTML..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
        />
        <Icon
          icon={searchIcon}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        />
      </div>

      {/* HTML Viewer with line numbers */}
      <div className="flex-grow flex overflow-hidden">
        {/* Line Numbers Column */}
        <div className="text-gray-400 dark:text-gray-600 text-right pr-2 select-none border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
          {lines.map((line) => (
            <div key={line} className="h-4 leading-4">
              {line}
            </div>
          ))}
        </div>

        {/* HTML Content */}
        <div className="flex-grow overflow-y-auto ml-4">
          {parsedNode ? (
            <HtmlNode node={parsedNode} searchTerm={searchTerm} />
          ) : (
            <div>Error parsing HTML.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HtmlViewer;
