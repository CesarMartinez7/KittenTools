export const getMethodColor = (method: string) => {
  switch (method?.toUpperCase()) {
    case 'GET':
      return 'text-teal-500';
    case 'POST':
      return 'text-sky-400';
    case 'PUT':
      return 'text-orange-400';
    case 'DELETE':
      return 'text-red-400';
    case 'PATCH':
      return 'text-purple-400';
    default:
      return 'text-gray-400';
  }
};
