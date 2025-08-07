import { Suspense } from 'react';
import { CodeEditorLazy } from './lazy-components';

interface ContainerArea {
  value: string | null | undefined;
  setValue: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  classText: string;
  heightEditor: string;
  classNameContainerEditor: string;
}

export default function ContainerTextArea({
  setValue,
  value,
  classText = '',
  heightEditor = '200px',
  classNameContainerEditor = '',
}: ContainerArea) {
  const handleChangeTextArea = (e: string) => {
    setValue(e);
  };

  return (
    <section
      tabIndex={0}
      className={`rounded-xl shadow-2xl backdrop-blur-3xl p-4  flex flex-col bg-zinc-900/80 focus:outline-none ${classText}`}
    >
      <div className="flex items-center-safe justify-between px-1 ">
        <label className="my-2 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
          Editor JSON
        </label>
      </div>

      <div className="relative p-2 h-full z-[777] ">
        <Suspense
          fallback={
            <div className="h-full w-full animate-pulse ">
              Cargando editor...
            </div>
          }
        >
          <CodeEditorLazy
            height={heightEditor}
            classNameContainer={classNameContainerEditor}
            value={value}
            language="json"
            minHeight=""
            onChange={(e) => handleChangeTextArea(e)}
          />
        </Suspense>
      </div>
    </section>
  );
}
