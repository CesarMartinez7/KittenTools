import { useEffect } from 'react';

interface Base64PProps {
  value: string;
}

export default function Base64Response({ value }: Base64PProps) {
  const [decoded, setDecoded] = useState<string>('');

  useEffect(() => {
    const encode = btoa(value);
    setDecoded(encode);
  }, [value]);

  return <div>{decoded}</div>;
}
