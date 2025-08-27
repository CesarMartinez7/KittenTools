import type React from 'react';
import { useState } from 'react';

interface XmlNodeProps {
  node: Node;
  depth?: number;
}

const XmlNode: React.FC<XmlNodeProps> = ({ node, depth = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (node.nodeType === Node.TEXT_NODE) {
    const textContent = node.textContent?.trim();
    if (textContent) {
      return (
        <span className="text-gray-700 dark:text-green-300">{textContent}</span>
      );
    }
    return null;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const childNodes = Array.from(element.childNodes);

    // Verificamos si hay nodos de ELEMENTO o TEXTO con contenido
    const hasChildrenToRender = childNodes.some(
      (child) =>
        child.nodeType === Node.ELEMENT_NODE ||
        (child.nodeType === Node.TEXT_NODE && child.textContent?.trim() !== ''),
    );

    const renderAttributes = (element: Element) => {
      return Array.from(element.attributes).map((attr) => (
        <span key={attr.name} className="text-blue-500 dark:text-yellow-400">
          {' '}
          {attr.name}=
          <span className="text-orange-600 dark:text-orange-400">
            &quot;{attr.value}&quot;
          </span>
        </span>
      ));
    };

    return (
      <div style={{ marginLeft: depth * 16 }} className="text-xs">
        <span className="text-gray-400">{'<'}</span>
        <span
          className="text-purple-600 dark:text-purple-400 cursor-pointer lowercase"
          onClick={hasChildrenToRender ? toggleCollapse : undefined}
        >
          {element.nodeName}
        </span>
        {renderAttributes(element)}

        {/* Lógica para manejar si el nodo tiene contenido */}
        {hasChildrenToRender ? (
          <>
            <span className="text-gray-400">{'>'}</span>
            {!isCollapsed && (
              <>
                {childNodes.map((child, index) => (
                  <XmlNode key={index} node={child} depth={depth + 1} />
                ))}
                <div style={{ marginLeft: depth * 16 }} className="text-sm">
                  <span className="text-gray-400">{'</'}</span>
                  <span className="text-purple-600 dark:text-purple-400 lowercase">
                    {element.nodeName}
                  </span>
                  <span className="text-gray-400">{'>'}</span>
                </div>
              </>
            )}
            {isCollapsed && (
              <span className="text-gray-400">
                ... {'</'}
                {element.nodeName}
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

export default XmlNode;
