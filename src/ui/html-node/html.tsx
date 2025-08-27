import type React from 'react';
import { useState } from 'react';

interface HtmlNodeProps {
  node: Node;
  depth?: number;
  searchTerm?: string;
  lineCounter?: () => void;
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

const highlightTerm = (text: string, term: string | undefined) => {
  if (!term || !text || typeof text !== 'string') return text;
  const parts = text.split(new RegExp(`(${term})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <span
        key={i}
        className="bg-yellow-300 dark:bg-yellow-500 text-black rounded px-1"
      >
        {part}
      </span>
    ) : (
      part
    ),
  );
};

const HtmlNode: React.FC<HtmlNodeProps> = ({
  node,
  depth = 0,
  searchTerm = '',
  lineCounter,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // We call lineCounter to increment the line number for this node.
  if (lineCounter) lineCounter();

  if (node.nodeType === Node.TEXT_NODE) {
    const textContent = node.textContent?.trim();
    if (textContent) {
      return (
        <span className="text-gray-700 dark:text-[#3bdbbc] ">
          {highlightTerm(textContent, searchTerm)}
        </span>
      );
    }
    return null;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const childNodes = Array.from(element.childNodes);
    const hasChildrenToRender = childNodes.some(
      (child) =>
        child.nodeType === Node.ELEMENT_NODE ||
        (child.nodeType === Node.TEXT_NODE && child.textContent?.trim() !== ''),
    );

    const renderAttributes = (element: Element) => {
      return Array.from(element.attributes).map((attr) => (
        <span key={attr.name} className="text-blue-500 dark:text-yellow-400">
          {' '}
          {highlightTerm(attr.name, searchTerm)}=
          <span className="text-orange-600 dark:text-orange-400">
            "{highlightTerm(attr.value, searchTerm)}"
          </span>
        </span>
      ));
    };

    const isMatch =
      element.nodeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Array.from(element.attributes).some(
        (attr) =>
          attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attr.value.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const displayStyle = searchTerm && !isMatch ? 'none' : 'block';

    return (
      <div
        style={{ marginLeft: depth * 5, display: displayStyle }}
        className="text-xs"
      >
        <span className="text-gray-400">{'<'}</span>
        <span
          className="text-purple-600 dark:text-purple-400 cursor-pointer lowercase"
          onClick={
            hasChildrenToRender ? () => setIsCollapsed(!isCollapsed) : undefined
          }
        >
          {highlightTerm(element.nodeName, searchTerm)}
        </span>
        {renderAttributes(element)}

        {hasChildrenToRender ? (
          <>
            <span className="text-gray-400">{'>'}</span>
            {!isCollapsed && (
              <>
                {childNodes.map((child, index) => (
                  <HtmlNode
                    key={index}
                    node={child}
                    depth={depth + 1}
                    searchTerm={searchTerm}
                    lineCounter={lineCounter}
                  />
                ))}
                <div style={{ marginLeft: depth * 16 }} className="text-sm">
                  <span className="text-gray-400">{'</'}</span>
                  <span className="text-purple-600 dark:text-purple-400 lowercase">
                    {highlightTerm(element.nodeName, searchTerm)}
                  </span>
                  <span className="text-gray-400">{'>'}</span>
                </div>
              </>
            )}
            {isCollapsed && (
              <span className="text-gray-400">
                ... {'</'}
                {highlightTerm(element.nodeName, searchTerm)}
                {'>'}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-400">{' />'}</span>
        )}
      </div>
    );
  }

  return null;
};

export default HtmlNode;
