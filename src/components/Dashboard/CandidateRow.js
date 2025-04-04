import React, { useState } from 'react';
import { fetchResumeContent, saveResumeContent } from '../../services/resumeParser';
import { screenResume } from '../../services/openRouter';
import ModelSelector from './ModelSelector';
import ScreeningResults from './ScreeningResults';

// 1. Helper functions to find the "first name" and "last name" from dynamic columns
const getDisplayFirstName = (candidate) => {
  return (
    candidate.firstName ||
    candidate["First Name"] ||
    candidate["first name"] ||
    candidate["First name"] ||
    candidate.name ||
    candidate["Name"] ||
    "N/A"
  );
};

const getDisplayLastName = (candidate) => {
  return (
    candidate.lastName ||
    candidate["Last Name"] ||
    candidate["last name"] ||
    candidate["Last name"] ||
    ""
  );
};

const CandidateRow = ({ candidate, onUpdate, onViewDetails }) => {
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
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-600 text-yellow-200">Pending</span>;
      case 'content_loaded':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-green-100">Content Loaded</span>;
      case 'error':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-600 text-red-200">Error</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-600 text-gray-200">Unknown</span>;
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-700">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-medium text-white">
            {getDisplayFirstName(candidate)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-medium text-white">
            {getDisplayLastName(candidate)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {getStatusBadge()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-300">
            {candidate.screenings ? candidate.screenings.length : 0} screenings
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          <button
            onClick={() => onViewDetails(candidate)}
            className="text-blue-300 hover:text-blue-400"
          >
            View Details
          </button>
          
        </td>
      </tr>
      
      {isExpanded && (
        <tr>
          <td colSpan="5" className="px-6 py-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-white">Resume URL</h3>
                <a 
                  href={candidate.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {candidate.resumeUrl}
                </a>
              </div>
              
              {candidate.resumeContent && (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-white">Resume Content</h3>
                    <div className="border p-3 rounded-md bg-gray-800 h-40 overflow-y-auto text-sm text-gray-200">
                      {candidate.resumeContent}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-white">Prompt</h3>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Enter job description for more targeted screening (optional)"
                      className="w-full border p-3 rounded-md bg-gray-800 text-gray-200 h-24"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-white">Select AI Model</h3>
                      <ModelSelector onModelSelect={setSelectedModel} selectedModel={selectedModel} />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={handleScreenResume}
                        disabled={isScreening || !selectedModel}
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-500"
                      >
                        {isScreening ? 'Screening...' : 'Screen Resume'}
                      </button>
                    </div>
                  </div>
                  
                  {candidate.screenings && candidate.screenings.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-white">Screening Results</h3>
                      <ScreeningResults results={candidate.screenings} />
                    </div>
                  )}
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default CandidateRow;
