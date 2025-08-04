export interface CodeEditorProps {
  minHeight: string;
  value?: string;
  language?: 'javascript' | 'typescript' | 'json' | 'xml';
  onChange?: (value: string | undefined | null) => void;
  height?: string;
  placeholder?: string;
  classNameContainer?: string;
  maxHeight: string;
}
