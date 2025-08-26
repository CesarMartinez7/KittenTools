import { motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useState } from 'react';
import { CodeEditorLazy } from '../../../../ui/lazy-components';
import { VariantsAnimation } from '../../mapper-ops';
import type { EventRequest } from '../../types/types';

interface ScriptComponentProps {
  value: EventRequest[];
  setValue: React.Dispatch<React.SetStateAction<EventRequest>>;
}

const ScriptComponent: React.FC<ScriptComponentProps> = ({
  value,
  setValue,
}) => {
  const [result, setResult] = useState<string>('');

  const [script, setScript] = useState<[]>([]);

  useEffect(() => {
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      Array.isArray(value[0]?.script?.exec)
    ) {
      setScript(value[0].script.exec);
    } else {
      setScript([]); // o null, según tu lógica
    }
  }, [value]);

  const handleExecuteScript = () => {
    try {
      // eslint-disable-next-line no-new-func
      const script = new Function(value);
      const executionResult = script();
      setResult(String(executionResult));
    } catch (error) {
      setResult(`Error: ${error}`);
      console.error('Script error:', error);
    }
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  return (
    <motion.div
      key="auth-section"
      variants={VariantsAnimation}
      className="text-zinc-500"
    >
      <CodeEditorLazy
        height="100px"
        language="javascript"
        value={script.join('')}
        onChange={handleChange}
      />
      {/* <button className="btn-black" onClick={handleExecuteScript}>
        Execute
      </button> */}
      <pre>{result}</pre>
    </motion.div>
  );
};

export default ScriptComponent;
