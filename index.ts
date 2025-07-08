type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const usuario = {
  nombre: 'Cesar',
  edad: 25,
  correo: 'cesar@example.com',
  activo: true,
  tecnologias: ['JavaScript', 'React', 'Node.js'],
  direccion: {
    ciudad: 'Medellín',
    pais: 'Colombia',
  },
};

function generateInterfaceFromJson(
  name: string,
  json: Record<string, JsonValue>,
): string {
  const entries = Object.entries(json);

  const getType = (value: JsonValue): string => {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        return `${getType(value[0])}[]`;
      }
      return `any[]`;
    }

    if (value === null) return 'null';
    const type = typeof value;

    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
        return type;
      case 'object':
        return 'Record<string, any>';
      default:
        return 'any';
    }
  };

  const interfaceBody = entries
    .map(([key, value]) => `  ${key}: ${getType(value)};`)
    .join('\n');

  return `interface ${name} {\n${interfaceBody}\n}`;
}

generateInterfaceFromJson('dd', usuario);
