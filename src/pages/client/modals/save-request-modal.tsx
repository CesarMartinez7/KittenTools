import { BaseModalLazy } from '../../../components/LAZY_COMPONENT';
import type BaseModalProps from '../../../ui/base-modal/types';
export default function ModalCurrentSavePeticion({
  onClose,
  isOpen,
}: BaseModalProps) {
  return (
    <BaseModalLazy key={"ujjm2"} onClose={onClose} isOpen={isOpen}>
      <div className="bg-zinc-900 p-4 rounded-xl flex flex-col gap-y-4">
        <span className="text-center font-black text-lg text-balance">
          Nombre para la petición guardada
        </span>
        <label htmlFor="name-peticion">
          <input type="text" required className="input-gray w-full" />
        </label>
        <button className="w-full p-2">Guardar</button>
      </div>
    </BaseModalLazy>
  );
}
