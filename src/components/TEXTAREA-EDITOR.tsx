import toast from "react-hot-toast";

interface ContainerArea {
  value: string | null | undefined;
  setValue: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  classText: string;
}

export default function ContainerTextArea({
  setValue,
  value,
  classText = "",
}: ContainerArea) {


  const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length === 0) {
      setValue(null);
      return;
    }
    const clean = e.target.value.replace(/\/\//g, "").replace(/n\//gi, "");
    setValue(clean);
    if (JSON.parse(clean)) {
      localStorage.setItem("jsonData", clean);
    } else {
      toast.error("JSON inválido, no se guardara en el localStorage");
    }
  };

  return (
    <section
      className={`rounded-xl shadow-2xl backdrop-blur-3xl p-6 space-y-4 flex flex-col gap-1  bg-zinc-900/80  ${classText} `}
    >
      <label className="text- my-2 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
        Editor JSON
      </label>
      <textarea
        value={value}
        onChange={handleChangeTextArea}
        className="h-full"
        placeholder="Pega o escribe tu JSON aquí"
      />
    </section>
  );
}
