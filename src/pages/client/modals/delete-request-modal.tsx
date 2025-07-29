import { BaseModalLazy } from '../../../components/LAZY_COMPONENT';
import type BaseModalProps from '../../../ui/base-modal/types';

interface ModalDeleteProps extends BaseModalProps {
    handleDeleteRequest: (id: string) => void
    id: string
}

export default function ModalDeleteRequest({
  onClose,
  isOpen,
  handleDeleteRequest,
  id
}: ModalDeleteProps) {
  return (
    <BaseModalLazy onClose={onClose} isOpen={isOpen}>
      <div className="bg-zinc-900 p-4 text-white rounded ">
        <span className='text-lg block my-5'>Estas seguro que deseas eliminar esta peticion?</span>
        <div className="flex gap-2">
          <button className="bg-green-700 text-green-300  p-1 rounded   flex-1 flex-shrink " onClick={() => handleDeleteRequest(id)} >Si</button>
          <button className="bg-green-700 text-green-300  p-1 rounded   flex-1">No</button>
        </div>
      </div>
    </BaseModalLazy>
  );
}
