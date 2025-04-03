// src/services/sheetParser.js
import axios from 'axios';
import { saveCandidateData } from './firebase';

// Parse Google Sheet data
// The sheet should have columns for name and resume URL at minimum
export const parseGoogleSheet = async (sheetId) => {
  try {
    // Google Sheets API URL for public sheets
    // Note: The sheet must be published to the web or set to "Anyone with the link can view"
    const sheetUrl = `https://spreadsheets.google.com/feeds/list/${sheetId}/od6/public/values?alt=json`;
    
    const response = await axios.get(sheetUrl);
    const entries = response.data.feed.entry;
    
    const candidates = [];
    
    for (const entry of entries) {
      // Assuming your sheet has columns 'name' and 'resumeurl'
      const name = entry.gsx$name.$t;
      const resumeUrl = entry.gsx$resumeurl.$t;
      
      if (name && resumeUrl) {
        // Save to Firebase
        const candidateData = {
          name,
          resumeUrl,
          resumeContent: null, // Will be populated later
          status: "pending",
          screenings: []
        };
        
        const candidateId = await saveCandidateData(candidateData);
        candidates.push({ id: candidateId, ...candidateData });
      }
    }
    
    return candidates;
  } catch (error) {
    console.error("Error parsing Google Sheet:", error);
    throw error;
  }
};

// Alternative implementation using a CSV upload
export const parseCSVUpload = async (csvFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        const nameIndex = headers.findIndex(h => h.toLowerCase().includes('first name'));
        const nameIndex2 = headers.findIndex(h => h.toLowerCase().includes('last name'));
        const urlIndex = headers.findIndex(h => h.toLowerCase().includes('resume') && h.toLowerCase().includes('url'));
        
        console.log(lines.length);

        if (nameIndex === -1 || urlIndex === -1) {
          reject(new Error('CSV file must include columns for name and resume URL'));
          return;
        }
        
        const candidates = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const firstName = values[nameIndex].trim();
          const lastName = values[nameIndex2].trim();
          const resumeUrl = values[urlIndex].trim();
          
          if (firstName && resumeUrl) {
            const candidateData = {
              firstName,
              lastName,
              resumeUrl,
              resumeContent: null,
              status: "pending",
              screenings: []
            };
            
            const candidateId = await saveCandidateData(candidateData);
            candidates.push({ id: candidateId, ...candidateData });
          }
        }
        
        resolve(candidates);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (e) => {
      reject(new Error(`Error reading CSV file - ${e.Error}`));
    };
    
    reader.readAsText(csvFile);
  });
};