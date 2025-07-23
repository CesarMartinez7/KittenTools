import { useCallback } from 'react';

const useInterfaceGenerator = () => {
  const generateInterfaceFromJson = useCallback((name: string, json: any) => {
    const entries = Object.entries(json);

    const getType = (value: any): string => {
      if (Array.isArray(value)) {
        return value.length > 0 ? `${getType(value[0])}[]` : 'any[]';
      }
      if (value === null) return 'null';

      switch (typeof value) {
        case 'string':
        case 'number':
        case 'boolean':
          return typeof value;
        case 'object':
          return 'Record<string, any>';
        default:
          return 'any';
      }
    };

    console.log("Creando")

    const interfaceBody = entries
      .map(([key, value]) => `  ${key}: ${getType(value)};`)
      .join('\n');

    return `interface ${name} {\n${interfaceBody}\n}`;
  }, []);

  return { generateInterfaceFromJson };
};

export default useInterfaceGenerator;
