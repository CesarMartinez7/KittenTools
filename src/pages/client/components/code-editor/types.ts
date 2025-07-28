export interface CodeEditorProps {
  value?: string;
  language?: "javascript" | "typescript" | "json" | "xml";
  onChange?: (value: string | undefined | null) => void;
  height?: string;
  placeholder?: string;
  classNameContainer?: string;
}
