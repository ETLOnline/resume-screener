// src/components/Dashboard/CandidateList.js
import React, { useState, useEffect } from 'react';
import { getCandidates } from '../../services/firebase';
import CandidateRow from './CandidateRow';
import { processAllResumes } from '../../services/resumeParser';

const CandidateList = ({ newCandidates }) => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessingResumes, setIsProcessingResumes] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    if (newCandidates && newCandidates.length > 0) {
      setCandidates(prev => [...prev, ...newCandidates]);
    }
  }, [newCandidates]);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const candidatesData = await getCandidates();
      setCandidates(candidatesData);
    } catch (error) {
      setError('Error loading candidates: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessAllResumes = async () => {
    setIsProcessingResumes(true);
    try {
      const pendingCandidates = candidates.filter(c => 
        !c.resumeContent || c.status === 'pending'
      );
      
      if (pendingCandidates.length === 0) {
        alert('No pending resumes to process');
        return;
      }
      
      const results = await processAllResumes(pendingCandidates);
      
      // Update candidates with processed resume content
      setCandidates(prev => {
        return prev.map(candidate => {
          const result = results.find(r => r.id === candidate.id);
          if (result) {
            return {
              ...candidate,
              status: result.success ? 'content_loaded' : 'error',
              error: result.error
            };
          }
          return candidate;
        });
      });
      
      alert(`Processed ${results.filter(r => r.success).length} resumes successfully. ${results.filter(r => !r.success).length} failed.`);
    } catch (error) {
      setError('Error processing resumes: ' + error.message);
    } finally {
      setIsProcessingResumes(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading candidates...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold">Candidates ({candidates.length})</h2>
        <button
          onClick={handleProcessAllResumes}
          disabled={isProcessingResumes}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400"
        >
          {isProcessingResumes ? 'Processing...' : 'Process All Resumes'}
        </button>
      </div>
      
      {candidates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No candidates yet. Upload a Google Sheet or CSV file to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Screenings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map(candidate => (
                <CandidateRow 
                  key={candidate.id} 
                  candidate={candidate} 
                  onUpdate={loadCandidates}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CandidateList;