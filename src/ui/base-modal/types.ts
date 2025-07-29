export default interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}
