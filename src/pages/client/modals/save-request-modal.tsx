import { BaseModalLazy } from '../../../components/LAZY_COMPONENT';
import type BaseModalProps from '../../../ui/base-modal/types';
import { useState } from 'react';


interface ModalCurrentSaveRequest extends BaseModalProps {
  handleSavePeticion: (requestName: string) => void
}


export default function ModalCurrentSavePeticion({
  onClose,
  isOpen,
  handleSavePeticion,
}: ModalCurrentSaveRequest) {

  const [name, setName] = useState<string>("")

  return (
    <BaseModalLazy key={'ujjm2'} onClose={onClose} isOpen={isOpen}>
      <div className="bg-zinc-900 py-12 px-6 shadow-2xl rounded-xl flex flex-col gap-y-4">
        <span className="text-center font-black text-lg text-balance">
          Nombre para la petición guardada
        </span>
        <label htmlFor="name-peticion">
          <input type="text" required className="input-gray w-full" onChange={(e) => setName(e.target.value) } />
        </label>
        <button className="base-modal-btn bg-kanagawa-green " onClick={() => {handleSavePeticion(name)} } >Guardar</button>
      </div>
    </BaseModalLazy>
  );
}
