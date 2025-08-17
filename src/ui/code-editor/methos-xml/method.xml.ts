import toast from 'react-hot-toast';

interface JsonHookProps {
  setCode: React.Dispatch<React.SetStateAction<string>>;
  code: string;
}

interface ReturnXmlHook {
  minifyXml: () => void;
  xmlSchema: () => void;
}

export function useXmlHook({ setCode, code }: JsonHookProps): ReturnXmlHook {
  /**
   * Función para minificar XML.
   * Elimina espacios, saltos de línea, etc., validando que sea XML válido.
   */
  const minifyXml = () => {
    if (!code || typeof code !== 'string') {
      toast.error('No hay código XML válido para minificar.');
      return;
    }

    const newCodeMinify = code.trim().replace(/>\s+</g, '><');

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(newCodeMinify, 'application/xml');

      const parseError = doc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error('XML inválido');
      }

      setCode(newCodeMinify);
      toast.success('XML minificado correctamente');
    } catch (e) {
      toast.error(`Ocurrió un error al minificar: ${(e as Error).message}`);
    }
  };

  // const xmlSchema = () => {
  //   try {
  //     const parser = new DOMParser();
  //     const doc = parser.parseFromString(code, 'application/xml');

  //     const parseError = doc.getElementsByTagName('parsererror');
  //     if (parseError.length > 0) {
  //       throw new Error('XML inválido');
  //     }

  //     const serializer = new XMLSerializer();
  //     const rawXml = serializer.serializeToString(doc);
  //     const formattedXml = formatXml(rawXml);

  //     setCode(formattedXml);
  //     toast.success('XML formateado correctamente');
  //   } catch (e) {
  //     toast.error(`Error al formatear el XML: ${(e as Error).message}`);
  //   }
  // };

  /**
   * Utilidad para formatear XML con indentación.
   */
  const xmlSchema = (xml: string): string => {
    const PADDING = '  '; // dos espacios
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    let pad = 0;

    xml = xml.replace(reg, '$1\r\n$2$3');
    const lines = xml.split('\r\n');

    for (const line of lines) {
      if (line.match(/^<\/\w/)) pad -= 1;
      formatted += PADDING.repeat(pad) + line + '\r\n';
      if (line.match(/^<\w[^>]*[^/]>.*$/)) pad += 1;
    }

    toast.success('kjdsfjsdkl');
    return formatted.trim();
  };

  return { minifyXml, xmlSchema };
}
