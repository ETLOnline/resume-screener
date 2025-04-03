// src/components/Dashboard/Dashboard.js
import React, { useState } from 'react';
import UploadSheet from './UploadSheet';
import CandidateList from './CandidateList';

const Dashboard = () => {
  const [newCandidates, setNewCandidates] = useState(null);

  const handleUploadComplete = (candidates) => {
    setNewCandidates(candidates);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Resume Screening Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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