import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseTextReplaceProps {
  getValue: () => string;
  setValue: (val: string) => void;
  getFrom: () => string;
  getTo: () => string;
}

export function useTextReplace({
  getValue,
  setValue,
  getFrom,
  getTo,
}: UseTextReplaceProps) {
  const replaceFirst = useCallback(() => {
    const from = getFrom();
    const to = getTo();
    const value = getValue();

    if (!from) return toast.error('Ingresa un valor a buscar');
    if (!value.includes(from))
      return toast.error('El valor a buscar no se encuentra en el texto');

    const result = value.replace(from, to);
    setValue(result);
    toast.success('Reemplazo realizado');
  }, [getFrom, getTo, getValue, setValue]);

  const replaceAll = useCallback(() => {
    const from = getFrom();
    const to = getTo();
    const value = getValue();

    if (!from) return toast.error('Ingresa un valor a buscar');
    if (!value.includes(from))
      return toast.error('El valor a buscar no se encuentra en el texto');

    const result = value.replaceAll(from, to);
    setValue(result);
    toast.success('Reemplazo realizado');
  }, [getFrom, getTo, getValue, setValue]);

  return {
    replaceFirst,
    replaceAll,
  };
}
