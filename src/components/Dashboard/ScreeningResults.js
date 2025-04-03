import React, { useState } from 'react';

const ScreeningResults = ({ results }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!results || results.length === 0) {
    return <div className="text-sm text-gray-400">No screening results yet</div>;
  }

  // Sort results by timestamp, newest first
  const sortedResults = [...results].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div className="border border-gray-600 rounded-md overflow-hidden">
      <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex overflow-x-auto">
        {sortedResults.map((result, index) => (
          <button
            key={index}
            className={`px-3 py-1 mr-2 text-sm rounded-md ${
              activeTab === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
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
      
      <div className="p-4 bg-gray-800">
        <div className="mb-2 flex justify-between items-center">
          <h4 className="font-medium text-white">
            Screening with {sortedResults[activeTab].modelName || sortedResults[activeTab].modelId}
          </h4>
          <span className="text-xs text-gray-400">
            {new Date(sortedResults[activeTab].timestamp).toLocaleString()}
          </span>
        </div>
        
        <div className="text-xs text-gray-400 mb-2">
          Tokens: {sortedResults[activeTab].promptTokens} prompt, {sortedResults[activeTab].completionTokens} completion
        </div>
        
        <div className="border-t border-gray-600 pt-2 whitespace-pre-wrap text-gray-200">
          {sortedResults[activeTab].assessment}
        </div>
      </div>
    </div>
  );
};

export default ScreeningResults;
