// src/components/Dashboard/CandidateDetailModal.js
import React, { useState } from 'react';
import { FaLinkedin, FaEnvelope, FaWhatsapp, FaFileDownload, FaDatabase } from 'react-icons/fa';
import { fetchResumeContent, saveResumeContent } from '../../services/resumeParser';
import { CandidateStatus } from '../../common/Constants';
import ModelSelector from './ModelSelector';
import ScreeningResults from './ScreeningResults';
import { screenResume } from '../../services/openRouter';

// Utility functions to find external links from candidate data
const getResumeUrl = (candidate) => {
  const possibleKeys = ["resume", "cv", "portfolio", "profile", "resumeurl"];
  for (const key in candidate) {
    if (possibleKeys.some(term => key.toLowerCase().includes(term))) {
      const value = candidate[key];
      if (value && typeof value === "string" && value.trim() !== "") {
        return value.trim();
      }
    }
  }
  return null;
};

const getLinkedInUrl = (candidate) => {
  for (const key in candidate) {
    if (key.toLowerCase().includes("linkedin")) {
      const value = candidate[key];
      if (value && typeof value === "string" && value.trim() !== "") {
        return value.trim();
      }
    }
  }
  return null;
};

const getWhatsAppLink = (candidate) => {
  const possibleKeys = ["phone", "number", "whatsapp", "contact"];
  for (const key in candidate) {
    if (possibleKeys.some(term => key.toLowerCase().includes(term))) {
      const value = candidate[key];
      if (value && typeof value === "string" && value.trim() !== "") {
        const number = value.replace(/\D/g, "");
        if (number) {
          return `https://wa.me/${number}`;
        }
      }
    }
  }
  return null;
};

const getEmail = (candidate) => {
  for (const key in candidate) {
    if (key.toLowerCase().includes("email")) {
      const value = candidate[key];
      if (value && typeof value === "string" && value.trim() !== "") {
        return value.trim();
      }
    }
  }
  return null;
};

// Format Firestore Timestamp or any object
const formatValue = (key, value) => {
  // Check for Firestore Timestamp
  if (
    value &&
    typeof value === "object" &&
    value.seconds !== undefined &&
    value.nanoseconds !== undefined
  ) {
    const date = new Date(value.seconds * 1000);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // If the key is "date" in name and value is a string, parse as date
  if (typeof value === "string" && key.toLowerCase().includes("date")) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // If it's some other object, JSON-stringify
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value || "N/A";
};

const CandidateDetailModal = ({ candidate, onClose, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [isTableCollapsed, setIsTableCollapsed] = useState(true);
  const [isScreeningCollapsed, setIsScreeningCollapsed] = useState(true);
  const [jobPrompt, setJobPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const toggleTableCollapse = () => {
    setIsTableCollapsed(!isTableCollapsed);
  };
  const toggleScreeningCollapse = () => {
    setIsScreeningCollapsed(!isScreeningCollapsed);
  };
  
  const linkedInUrl = getLinkedInUrl(candidate);
  const resumeUrl = getResumeUrl(candidate);
  const whatsAppLink = getWhatsAppLink(candidate);
  const emailAddress = getEmail(candidate);

  const extractResumeContent = async (candidate) => {
    setIsLoading(true);
    try {
      const resumeContent = await fetchResumeContent(candidate["Resume upload"]);
      await saveResumeContent(candidate.id, resumeContent);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error processing resume:", error);
      alert(`Error processing resume: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenResume = async () => {
    if(!jobPrompt) {
      alert('Please specify a prompt');
      return;
    }
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
        jobPrompt || null
      );
      onUpdate();
    } catch (error) {
      console.error("Error screening resume:", error);
      alert(`Error screening resume: ${error.message}`);
    } finally {
      setIsScreening(false);
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>

      <div className="bg-gray-800 rounded-lg shadow-lg z-10 w-full max-w-4xl max-h-[90vh] p-6 relative overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl text-white font-bold"
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold mb-4 text-white">Candidate Details</h3>

        <div className="overflow-x-auto">
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {/* LinkedIn Button */}
              {linkedInUrl && (
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#0077B5] text-white rounded hover:bg-[#005C82]"
                >
                  <FaLinkedin />
                  LinkedIn
                </a>
              )}

              {/* Email Button */}
              {emailAddress && (
                <a
                  href={`mailto:${emailAddress}`}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <FaEnvelope />
                  Email
                </a>
              )}

              {/* WhatsApp Button */}
              {whatsAppLink && (
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <FaWhatsapp />
                  WhatsApp
                </a>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2"> {/* New row with mt-2 for spacing */}
              {/* Resume Download Button */}
              {resumeUrl && candidate.status === CandidateStatus.PENDING && (
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  onClick={() => extractResumeContent(candidate)}
                >
                  <FaDatabase />
                  Save Resume Content to DB
                </button>
              )}
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  <FaFileDownload />
                  Download Resume
                </a>
              )}
            </div>
          </div>

          <div>
            <button
              className="mt-3 text-white"
              onClick={toggleTableCollapse}
            >
              {isTableCollapsed ? 'Show Details' : 'Hide Details'}
            </button>
            {!isTableCollapsed && (
              <table className="min-w-full mt-3 divide-y divide-gray-700">
                <tbody className="divide-y divide-gray-700">
                  {Object.entries(candidate).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-4 py-2 font-semibold text-gray-300 capitalize border border-gray-700">
                        {key}
                      </td>
                      <td className="px-4 py-2 text-gray-100 border border-gray-700">
                        {formatValue(key, value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4">
            <button
              className="text-white"
              onClick={toggleScreeningCollapse}
            >
              {isScreeningCollapsed ? 'Show Screening View' : 'Hide Screening View'}
            </button>
            {!isScreeningCollapsed && (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2 text-white">Prompt</h3>
                  <textarea
                    value={jobPrompt}
                    onChange={(e) => setJobPrompt(e.target.value)}
                    placeholder="Enter job prompt for targeted screening"
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
                <div>
                  <h3 className="font-semibold mb-2 text-white">Screening Results</h3>
                  <ScreeningResults results={candidate.screenings} />
                </div>
              </>              
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
