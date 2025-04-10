import React, { useState, useEffect } from 'react';
import { getAvailableModels } from '../../services/openRouter';

const ModelSelector = ({ onModelSelect, selectedModel }) => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  function sortModelsByVendorAndName(models) {
    return models.sort((a, b) => {
      const vendorA = a.name.split(':')[0].trim().toLowerCase();
      const vendorB = b.name.split(':')[0].trim().toLowerCase();
  
      if (vendorA < vendorB) {
        return -1;
      }
      if (vendorA > vendorB) {
        return 1;
      }
  
      // If vendors are the same, sort by model name
      const modelNameA = a.name.split(':')[1].trim().toLowerCase();
      const modelNameB = b.name.split(':')[1].trim().toLowerCase();
  
      if (modelNameA < modelNameB) {
        return -1;
      }
      if (modelNameA > modelNameB) {
        return 1;
      }
  
      return 0; // Vendors and model names are equal
    });
  }

  const loadModels = async () => {
    setIsLoading(true);
    try {
      //let availableModels = await getAvailableModels();
      //availableModels = sortModelsByVendorAndName(availableModels);
      //console.log(availableModels);
      const availableModels = [
//        {"id": "anthropic/claude-3.7-sonnet", "name": "Anthropic: Claude 3.7 Sonnet"},
        {"id": "google/gemini-2.0-flash-001", "name": "Google: Gemini 2.0 Flash"}
//        {"id": "openai/gpt-4o", "name": "OpenAI: GPT-4o"},
//        {"id": "x-ai/grok-2-1212", "name": "xAI: Grok 2 1212"}        
      ]
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
    return <div className="text-sm text-gray-400">Loading available models...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400">{error}</div>;
  }

  if (models.length === 0) {
    return <div className="text-sm text-gray-400">No models available</div>;
  }

  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelSelect(e.target.value)}
      className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-gray-200"
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
