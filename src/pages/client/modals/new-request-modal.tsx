import { useForm } from 'react-hook-form';
import BaseModal from '../../../ui/base-modal/BaseModal';
import { Methodos } from '../mapper-ops';

interface AddRequestModal {
  handleToogleModal: () => void;
  openModalNewRequest: boolean;
  onSubmit: (data: any) => void;
}

export default function AddNewRequestModal({
  handleToogleModal,
  openModalNewRequest,
  onSubmit,
}: AddRequestModal) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <BaseModal onClose={handleToogleModal} isOpen={openModalNewRequest}>
      <div className="bg-zinc-900 w-lg flex-col flex gap-3 p-4 rounded-xl">
        <form
          className=" flex-col flex gap-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-row gap-4">
            <label htmlFor="name" className="flex-1/2">
              <span className="my-2 block text-xs">Nombre</span>
              <input
                required
                id="Nombre"
                type="text"
                className="input-gray w-full"
                {...register('name', { required: true, minLength: 3 })}
                placeholder="Nombre peticion"
              />
              <span className="text-red-400">
                {errors.name
                  ? 'Asegurese que el campo tenga una longitud minima en 3 caracteres '
                  : ''}
              </span>
            </label>

            <select
              required
              className="bg-zinc-900 text-white"
              {...register('method', { required: true })}
            >
              {Methodos.map((e, idx) => (
                <option id={e.name} key={idx.toFixed(22)} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <label htmlFor="url">
            <span>Url</span>
            <input
              type="text"
              id="url"
              required
              placeholder="https://cesarmartinez7.com"
              className="input-gray w-full"
              {...register('url', { required: true, minLength: 1 })}
            />
            <span className="text-red-400">
              {errors.url ? 'El campo url debe ser obligatorio ' : ' '}
            </span>
          </label>

          <button
            type="submit"
            className="bg-gradient-to-r from-orange-400 to-orange-500 rounded p-2 text-black "
          >
            Crear Peticion
          </button>
        </form>
      </div>
    </BaseModal>
  );
}
