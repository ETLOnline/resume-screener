import React, { useState } from 'react';
import UploadSheet from './UploadSheet';
import CandidateList from './CandidateList';

const Dashboard = () => {
  const [newCandidates, setNewCandidates] = useState(null);

  const handleUploadComplete = (candidates) => {
    setNewCandidates(candidates);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
        Resume Screening Dashboard
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <UploadSheet onUploadComplete={handleUploadComplete} />
        </div>
        
        <div className="lg:col-span-2">
          <CandidateList newCandidates={newCandidates} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
