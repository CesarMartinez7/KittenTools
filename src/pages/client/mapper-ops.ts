export const Methodos = [
  { name: 'GET', className: 'btn btn-primary' },
  { name: 'POST', className: 'btn btn-secondary' },
  { name: 'PUT', className: 'btn btn-accent' },
  { name: 'DELETE', className: 'btn glass' },
  { name: 'PATCH', className: 'btn' },
];

export const Opciones = [
  {
    name: 'Cuerpo de Peticion',
  },
  {
    name: 'Parametros',
  },
  {
    name: 'Cabeceras',
  },
  {
    name: 'Autenticacion',
  },
  {
    name: 'Scripts',
  },
  {
    name: 'Entorno',
  },
];

export const TypesResponse = [
  { name: 'JSON', contentType: '', icon: 'json' },
  { name: 'XML', contentType: '', icon: 'file-type-xml' },
  { name: 'HTML', contentType: '', icon: 'brand-html5' },
  { name: 'RAW', contentType: '', icon: 'file-shredder' },
  { name: 'BASE64', contentType: '', icon: 'file-analytics' },
];

export const VariantsAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
};
