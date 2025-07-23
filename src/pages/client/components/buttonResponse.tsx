export default function ButtonResponse({ code }: { code: number | undefined }) {
    if (code) {
      if (code >= 200 && code <= 300) {
        return (
          <div className="bg-green-600">
            <div className="flex items-center justify-center">
              <div>
                <span className="text-white">{code}</span>
              </div>
            </div>
          </div>
        );
      }
  
      if (code > 300) {
        return (
          <div className="btn btn-xs btn-soft btn-error">
            <div className="flex items-center justify-center">
              <div>
                <span className="text-white">{code}</span>
              </div>
            </div>
          </div>
        );
      }
    }
  
    return <div>Nada</div>;
  }
  