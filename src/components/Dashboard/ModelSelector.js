// src/components/Dashboard/ModelSelector.js
import React, { useState, useEffect } from 'react';
import { getAvailableModels } from '../../services/openRouter';

const ModelSelector = ({ onModelSelect, selectedModel }) => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const availableModels = await getAvailableModels();
      setModels(availableModels);
      
      // Select the first model by default if none is selected
      if (!selectedModel && availableModels.length > 0) {
        onModelSelect(availableModels[0].id);
      }
    } catch (error) {
      setError('Error loading models: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading available models...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (models.length === 0) {
    return <div className="text-sm text-gray-500">No models available</div>;
  }

  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelSelect(e.target.value)}
      className="w-full p-2 border rounded-md"
    >
      <option value="">Select a model</option>
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name} ({model.provider})
        </option>
      ))}
    </select>
  );
};

export default ModelSelector;