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
    <BaseModal onClose={handleToogleModal} isOpen={openModalNewRequest} key={"ujum1"}>
      <div className="bg-zinc-900 w-full max-w-lg rounded-xl p-6 text-zinc-100 shadow-lg">
        <h2 className="text-xl font-semibold  w-lg text-center my-6">
          Crear Nueva Peticion
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="name" className="block text-sm mb-1">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Nombre de la petición"
                {...register('name', {
                  required: 'El campo es requerido',
                  minLength: {
                    value: 3,
                    message: 'El campo debe tener al menos 3 caracteres',
                  },
                })}
              />
              {errors.name && (
                <span className="text-red-400 text-xs mt-1">
                  {String(errors?.name?.message)}
                </span>
              )}
            </div>

            <div className="w-full md:w-40">
              <label htmlFor="method" className="block text-sm mb-1">
                Método
              </label>
              <select
                id="method"
                className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                {...register('method', { required: true })}
              >
                {Methodos.map((e, idx) => (
                  <option key={idx} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="url" className="block text-sm mb-1">
              URL
            </label>
            <input
              id="url"
              type="text"
              className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="https://cesarmartinez7.com"
              {...register('url', { required: true, minLength: 1 })}
            />
            {errors.url && (
              <span className="text-red-400 text-xs mt-1">
                La URL es obligatoria.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-black font-medium hover:opacity-90 transition-all"
          >
            Crear petición
          </button>
        </form>
      </div>
    </BaseModal>
  );
}
