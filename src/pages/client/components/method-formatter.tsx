export default function MethodFormater({ nameMethod }: { nameMethod: string }) {
  if (nameMethod === "GET") {
    return (
      <span aria-label="method" className="text-green-500 bg-r">
        {nameMethod}
      </span>
    );
  }

  if (nameMethod === "POST")
    return <span className="text-blue-500">{nameMethod}</span>;

  if (nameMethod === "DELETE") {
    return <span className="text-red-500">{nameMethod}</span>;
  }

  if (nameMethod === "PUT") {
    return <span className="text-yellow-500">{nameMethod}</span>;
  }

  return <div>Indefinido</div>;
}
