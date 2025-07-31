import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function PostmanLectorCollepcion() {
  const [fileInstancia, setFileInstancia] = useState<string | ArrayBuffer>();

  const inputRefFile = useRef(null);
  const leerArchivo = () => {
    if (inputRefFile.current) {
      const target = inputRefFile.current as HTMLInputElement;

      if (target.files && target.files.length > 0) {
        console.log('Hay archivos cargados');

        const file = target.files[0];

        const reader = new FileReader();

        reader.onload = () => {
          const result = reader.result;
          toast.success('SE CARGO');

          setFileInstancia(result as string);
        };

        reader.readAsText(file);
        validateJson(fileInstancia as string);
        getValue(fileInstancia);
      }
    }
  };

  const validateJson = (file: string) => {
    console.log(file);
  };

  const getValue = (file: string) => {
    const parsed = JSON.parse(file);

    console.log(typeof parsed);
  };

  return (
    <div className="bg-neutral-950">
      <input type="file" ref={inputRefFile} />

      <button className="bg-red-500 p-4" onClick={leerArchivo}>
        Enviar
      </button>

      <pre>{JSON.stringify(fileInstancia, null, 4)}</pre>
    </div>
  );
}
