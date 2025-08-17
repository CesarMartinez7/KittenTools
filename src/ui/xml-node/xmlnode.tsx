import { Icon } from '@iconify/react/dist/iconify.js';
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

  const hasChildren =
    node.hasChildNodes() &&
    Array.from(node.childNodes).some((child) => child.nodeType === 1);

  const renderAttributes = (element: Element) => {
    return Array.from(element.attributes).map((attr) => (
      <span key={attr.name} className="text-yellow-400">
        {' '}
        {attr.name}=<span className="text-orange-400">"{attr.value}"</span>
      </span>
    ));
  };

  const renderContent = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
      return <span className="text-gray-300 ml-2">{node.textContent}</span>;
    }
    return null;
  };

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    return (
      <div style={{ marginLeft: depth * 16 }} className="text-sm">
        <span className="text-gray-400">{'<'}</span>
        <span
          className="text-purple-400 cursor-pointer"
          onClick={hasChildren ? toggleCollapse : undefined}
        >
          {element.nodeName}
        </span>
        {renderAttributes(element)}
        {hasChildren ? (
          <>
            <span className="text-gray-400">{'>'}</span>
            {!isCollapsed && (
              <>
                {Array.from(element.childNodes).map((child, index) => (
                  <XmlNode key={index} node={child} depth={depth + 1} />
                ))}
                <div style={{ marginLeft: depth * 16 }} className="text-sm">
                  <span className="text-gray-400">{'</'}</span>
                  <span className="text-purple-400">{element.nodeName}</span>
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
  } else {
    return renderContent(node);
  }
};

export default XmlNode;
