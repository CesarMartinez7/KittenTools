export default function ButtonResponse({ code }: { code: number | undefined }) {
  if (code) {
    return (
      <div
        className={`${code >= 200 && code < 300 ? "bg-green-600/10 border-b border-b-2 my-2 p-0.5 px-2 rounded text-xs text-green-500 " : "btn text-xs"} `}
      >
        <div className="flex items-center justify-center">
          <div>
            <span className="">{code}</span>
          </div>
        </div>
      </div>
    );
  }
}
