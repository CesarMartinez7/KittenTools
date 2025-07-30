import toast from 'react-hot-toast';

interface JsonHookProps {
  setCode: React.Dispatch<React.SetStateAction<string>>;
  code: string;
}

interface ReturnXmlHook {
  minifyXml: () => void;
  XmlSchema: () => void;
}

export function useXmlHook({ setCode, code }: JsonHookProps) {
  // Funcion para minifcar el json

  const minifyXml = () => {
    if (!code.includes('\n ')) return;
    const newCodeMinify = code.trim().replaceAll('\n', '').trim();

    try {
      const parser = new DOMParser();

      const doc = parser.parseFromString(newCodeMinify, 'application/xml');

      console.warn(doc);

      setCode(newCodeMinify.trim());
    } catch (e) {
      toast.error(`Ocurrio un error ${e}`);
    }
  };

  const XmlScheme = () => {
    toast.error('Aun no tenemos la logica disponible');
  };

  return { minifyXml, XmlScheme };
}
