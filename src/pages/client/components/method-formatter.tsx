export default function MethodFormater({ nameMethod }: { nameMethod: string }) {
  if (nameMethod === 'GET') {
    return (
      <span aria-label="method" className="text-green-500 bg-r">
        {nameMethod}
      </span>
    );
  }

  if (nameMethod === 'POST')
    return <span className="text-blue-500">{nameMethod}</span>;

  if (nameMethod === 'DELETE') {
    return <span className="text-red-500">{nameMethod}</span>;
  }

  if (nameMethod === 'PUT') {
    return <span className="text-yellow-500">{nameMethod}</span>;
  }

  return <div>Indefinido</div>;
}



export function MethodFormaterButton({ nameMethod }: { nameMethod: string }) {
  if (nameMethod === 'GET') {
    return (
      <span aria-label="method" className="text-green-200 rounded-lg bg-gradient-to-r from-green-400 to-green-600 p-1 mx-2">
        {nameMethod}
      </span>
    );
  }

  if (nameMethod === 'POST')
    return <span className="text-blue-500   rounded-lg bg-gradient-to-r from-sky-400 to-sky-600 ">{nameMethod}</span>;

  if (nameMethod === 'DELETE') {
    return <span className="text-red-200  rounded-lg bg-gradient-to-r from-red-400 to-red-600 ">{nameMethod}</span>;
  }

  if (nameMethod === 'PUT') {
    return <span className="text-yellow-500">{nameMethod}</span>;
  }

  return <div>Indefinido</div>;
}
