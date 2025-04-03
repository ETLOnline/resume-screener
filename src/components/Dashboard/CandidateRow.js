// src/components/Dashboard/CandidateRow.js
import React, { useState } from 'react';
import { fetchResumeContent, saveResumeContent } from '../../services/resumeParser';
import { screenResume } from '../../services/openRouter';
import ModelSelector from './ModelSelector';
import ScreeningResults from './ScreeningResults';

const CandidateRow = ({ candidate, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [isScreening, setIsScreening] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  const handleProcessResume = async () => {
    setIsLoading(true);
    try {
      const resumeContent = await fetchResumeContent(candidate.resumeUrl);
      await saveResumeContent(candidate.id, resumeContent);
      onUpdate();
    } catch (error) {
      console.error("Error processing resume:", error);
      alert(`Error processing resume: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenResume = async () => {
    if (!selectedModel) {
      alert('Please select an AI model');
      return;
    }
    
    setIsScreening(true);
    try {
      await screenResume(
        candidate.id, 
        candidate.resumeContent, 
        selectedModel, 
        jobDescription || null
      );
      onUpdate();
    } catch (error) {
      console.error("Error screening resume:", error);
      alert(`Error screening resume: ${error.message}`);
    } finally {
      setIsScreening(false);
    }
  };

  const getStatusBadge = () => {
    switch (candidate.status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'content_loaded':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Content Loaded</span>;
      case 'error':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Error</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="font-medium text-gray-900">{candidate.firstName}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="font-medium text-gray-900">{candidate.lastName}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {getStatusBadge()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-500">
            {candidate.screenings ? candidate.screenings.length : 0} screenings
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-indigo-600 hover:text-indigo-900 mr-3"
          >
            {isExpanded ? 'Hide' : 'View'}
          </button>
          
          {!candidate.resumeContent && (
            <button
              onClick={handleProcessResume}
              disabled={isLoading}
              className="text-green-600 hover:text-green-900"
            >
              {isLoading ? 'Processing...' : 'Process Resume'}
            </button>
          )}
        </td>
      </tr>
      
      {isExpanded && (
        <tr>
          <td colSpan="5" className="px-6 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Resume URL</h3>
                <a 
                  href={candidate.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {candidate.resumeUrl}
                </a>
              </div>
              
              {candidate.resumeContent && (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Resume Content</h3>
                    <div className="border p-3 rounded-md bg-white h-40 overflow-y-auto text-sm">
                      {candidate.resumeContent}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Prompt</h3>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Enter job description for more targeted screening (optional)"
                      className="w-full border p-3 rounded-md h-24"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold mb-2">Select AI Model</h3>
                      <ModelSelector onModelSelect={setSelectedModel} selectedModel={selectedModel} />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={handleScreenResume}
                        disabled={isScreening || !selectedModel}
                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                      >
                        {isScreening ? 'Screening...' : 'Screen Resume'}
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              {candidate.screenings && candidate.screenings.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Screening Results</h3>
                  <ScreeningResults results={candidate.screenings} />
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default CandidateRow;