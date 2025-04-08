import React, { useState, useEffect } from 'react';
import { loadPrompts } from '../../services/firebase';

const PromptSelector = ({ onPromptSelect, selectedPrompt }) => {
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPromptsFromDB();
  }, []);
 
  const loadPromptsFromDB = async () => {
    setIsLoading(true);
    try {
      let lstPrompts = await loadPrompts();
      setPrompts(lstPrompts);
      
    } catch (error) {
      setError('Error loading prompts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-400">Loading available models...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400">{error}</div>;
  }

  if (prompts.length === 0) {
    return <div className="text-sm text-gray-400">No prompts available</div>;
  }

  return (
    <select
      value={selectedPrompt}
      onChange={(e) => onPromptSelect(e.target.value)}
      className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-gray-200"
    >
      <option value="">Select a Prompt</option>
      {prompts.map((model) => (
        <option key={model.id} value={model.prompt}>
          {model.name} ({model.role})
        </option>
      ))}
    </select>
  );
};

export default PromptSelector;
