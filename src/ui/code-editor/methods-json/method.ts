import toast from 'react-hot-toast';

interface JsonHookProps {
  setCode: React.Dispatch<React.SetStateAction<string>>;
  code: string;
}

interface ReturnJsonHook {
  minifyJson: () => void;
  JsonSchema: () => void;
}

export function useJsonHook({ setCode, code }: JsonHookProps): ReturnJsonHook {
  // Funcion para minificar JSON
  const minifyJson = () => {
    try {
      const parseado = JSON.parse(code);
      setCode(JSON.stringify(parseado));
      toast.success('JSON minificado');
    } catch {
      toast.error('JSON inválido para minificar');
    }
  };

  // Identacion json
  const JsonSchema = () => {
    setCode(JSON.stringify(JSON.parse(code), null, 4));
  };

  return { minifyJson, JsonSchema };
}
