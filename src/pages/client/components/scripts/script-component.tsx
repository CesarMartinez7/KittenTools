import { motion } from 'framer-motion';
import type React from 'react';
import { useState } from 'react';
import { CodeEditorLazy } from '../../../../components/LAZY_COMPONENT';
import { VariantsAnimation } from '../../mapper-ops';

const ScriptComponent: React.FC = () => {
  const [value, setValue] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const handleExecuteScript = () => {
    try {
      // eslint-disable-next-line no-new-func
      const script = new Function(value);
      const executionResult = script();
      setResult(String(executionResult));
      console.log('Script executed:', value);
      console.log('Script result:', executionResult);
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
        language="javascript"
        value={value}
        onChange={handleChange}
      />
      <button className="btn-black" onClick={handleExecuteScript}>
        Execute
      </button>
      <pre>{result}</pre>
    </motion.div>
  );
};

export default ScriptComponent;
