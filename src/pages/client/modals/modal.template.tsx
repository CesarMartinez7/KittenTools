interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// eslint-disable-next-line react/prop-types
const SidebarModal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      // 🚀 Posicionamiento absoluto para confinarlo al sidebar
      className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-96 rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default SidebarModal;
