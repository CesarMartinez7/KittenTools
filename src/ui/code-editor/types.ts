export interface CodeEditorProps {
  minHeight: string;
  value?: string;
  language?: string;
  onChange?: (value: string | undefined | null) => void;
  height?: string;
  placeholder?: string;
  classNameContainer?: string;
  maxHeight: string;
}
