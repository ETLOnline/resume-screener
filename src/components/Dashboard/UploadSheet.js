// src/components/Dashboard/UploadSheet.js
import React, { useState } from 'react';
import { parseGoogleSheet, parseCSVUpload } from '../../services/sheetParser';

const UploadSheet = ({ onUploadComplete }) => {
  const [uploadMethod, setUploadMethod] = useState('googleSheet');
  const [googleSheetId, setGoogleSheetId] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let candidates = [];
      
      if (uploadMethod === 'googleSheet') {
        if (!googleSheetId) {
          throw new Error('Please enter a Google Sheet ID');
        }
        candidates = await parseGoogleSheet(googleSheetId);
      } else {
        if (!csvFile) {
          throw new Error('Please select a CSV file');
        }
        candidates = await parseCSVUpload(csvFile);
      }
      
      onUploadComplete(candidates);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      setCsvFile(null);
      setError('Please select a valid CSV file');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Candidate Data</h2>
      
      <div className="mb-4">
        <div className="flex space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="googleSheet"
              checked={uploadMethod === 'googleSheet'}
              onChange={() => setUploadMethod('googleSheet')}
              className="mr-2"
            />
            Google Sheet
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              value="csvUpload"
              checked={uploadMethod === 'csvUpload'}
              onChange={() => setUploadMethod('csvUpload')}
              className="mr-2"
            />
            CSV Upload
          </label>
        </div>
        
        {uploadMethod === 'googleSheet' ? (
          <div>
            <label className="block mb-2 text-sm font-medium">
              Google Sheet ID
              <span className="text-xs text-gray-500 ml-2">
                (from the URL: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit)
              </span>
            </label>
            <input
              type="text"
              value={googleSheetId}
              onChange={(e) => setGoogleSheetId(e.target.value)}
              placeholder="Enter Google Sheet ID"
              className="w-full p-2 border rounded-md"
            />
          </div>
        ) : (
          <div>
            <label className="block mb-2 text-sm font-medium">CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              CSV should include columns for name and resume URL
            </p>
          </div>
        )}
      </div>
      
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      <button
        onClick={handleUpload}
        disabled={isLoading}
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? 'Uploading...' : 'Upload Candidates'}
      </button>
    </div>
  );
};

export default UploadSheet;