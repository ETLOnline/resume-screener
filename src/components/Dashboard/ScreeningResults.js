// src/components/Dashboard/ScreeningResults.js
import React, { useState } from 'react';

const ScreeningResults = ({ results }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!results || results.length === 0) {
    return <div className="text-sm text-gray-500">No screening results yet</div>;
  }

  // Sort results by timestamp, newest first
  const sortedResults = [...results].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b flex overflow-x-auto">
        {sortedResults.map((result, index) => (
          <button
            key={index}
            className={`px-3 py-1 mr-2 text-sm rounded-md ${
              activeTab === index
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {result.modelName || result.modelId}
            <span className="ml-2 text-xs">
              {new Date(result.timestamp).toLocaleDateString()}
            </span>
          </button>
        ))}
      </div>
      
      <div className="p-4 bg-white">
        <div className="mb-2 flex justify-between items-center">
          <h4 className="font-medium">
            Screening with {sortedResults[activeTab].modelName || sortedResults[activeTab].modelId}
          </h4>
          <span className="text-xs text-gray-500">
            {new Date(sortedResults[activeTab].timestamp).toLocaleString()}
          </span>
        </div>
        
        <div className="text-xs text-gray-500 mb-2">
          Tokens: {sortedResults[activeTab].promptTokens} prompt, {sortedResults[activeTab].completionTokens} completion
        </div>
        
        <div className="border-t pt-2 whitespace-pre-wrap">
          {sortedResults[activeTab].assessment}
        </div>
      </div>
    </div>
  );
};

export default ScreeningResults;