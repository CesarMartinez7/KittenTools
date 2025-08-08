import { useState } from 'react';
import type { JsonValue } from '../../../types/models';

const FormatDataTypeLabel = ({ data }: { data: JsonValue }) => {
  const [collapsedLabel, setCollapsedLabel] = useState(true);

  const LabelBadge = ({ type }: { type: string }) => (
    <b className="text-[9px] p-1 rounded-md text-zinc-200 bg-gradient-to-t from-zinc-900 to-zinc-700">
      {type}
    </b>
  );

  const Text = ({
    children,
    color = 'text-white',
    title,
    onClick,
    isLink = false,
    href,
  }: {
    children: React.ReactNode;
    color?: string;
    title?: string;
    onClick?: () => void;
    isLink?: boolean;
    href?: string;
  }) => {
    const base = `${color} transition-colors duration-300 `;

    if (isLink && href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base}`}
          title={title}
        >
          {children}
        </a>
      );
    }

    return (
      <span className={base} title={title} onClick={onClick}>
        {children}
      </span>
    );
  };

  // null
  if (Object.is(data, null) && data !== undefined)
    return (
      <Text color="text-orange-400">
        null <LabelBadge type="null" />
      </Text>
    );

  // boolean
  if (typeof data === 'boolean') {
    return (
      <Text color="text-sky-400">
        {String(data)} <LabelBadge type="boolean" />
      </Text>
    );
  }

  // number
  if (typeof data === 'number') {
    return (
      <Text color="text-yellow-400">
        {data} <LabelBadge type="number" />
      </Text>
    );
  }

  // string que es URL
  if (typeof data === 'string' && data.startsWith('http')) {
    return (
      <Text color="text-lime-400" isLink href={data} title="Link externo">
        &quot;{data}&quot; <LabelBadge type="string" />
      </Text>
    );
  }

  // string larga (colapsada)
  if (typeof data === 'string' && collapsedLabel && data.length >= 50) {
    return (
      <Text
        color="text-pink-400"
        title="Haz clic para expandir"
        onClick={() => setCollapsedLabel(false)}
      >
        &quot;{data.slice(0, 50)}...&quot; <LabelBadge type="string" />
      </Text>
    );
  }

  // string corta
  if (typeof data === 'string' && collapsedLabel) {
    return (
      <Text
        color="text-[#3bdbbc]"
        title="Haz clic para expandir"
        onClick={() => setCollapsedLabel(false)}
      >
        &quot;{data}&quot; <LabelBadge type="string" />
      </Text>
    );
  }

  // fallback o expandido
  return (
    <Text color="text-emerald-300" onClick={() => setCollapsedLabel(true)}>
      &quot;{String(data)}&quot; <LabelBadge type={typeof data} />
    </Text>
  );
};

export default FormatDataTypeLabel;
