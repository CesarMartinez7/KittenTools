var usuario = {
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
function generateInterfaceFromJson(name, json) {
  var entries = Object.entries(json);
  var getType = (value) => {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        return ''.concat(getType(value[0]), '[]');
      }
      return 'any[]';
    }
    if (value === null) return 'null';
    var type = typeof value;
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
  var interfaceBody = entries
    .map((_a) => {
      var key = _a[0],
        value = _a[1];
      return '  '.concat(key, ': ').concat(getType(value), ';');
    })
    .join('\n');
  return 'interface '.concat(name, ' {\n').concat(interfaceBody, '\n}');
}
console.log(JSON.parse(generateInterfaceFromJson('dd', usuario)));
