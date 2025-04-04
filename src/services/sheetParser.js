import Papa from 'papaparse';
import { saveCandidateData } from './firebase';

// Parse Google Sheet data
// The sheet should have columns for name and resume URL at minimum
export const parseGoogleSheet = async (sheetId) => {
  try {
    // Google Sheets API URL for public sheets
    // Note: The sheet must be published to the web or set to "Anyone with the link can view"
    const sheetUrl = `https://spreadsheets.google.com/feeds/list/${sheetId}/od6/public/values?alt=json`;
    const response = await fetch(sheetUrl);
    const data = await response.json();
    const entries = data.feed.entry;
    const candidates = [];

    for (const entry of entries) {
      // Build a candidate object with all columns available in the entry
      const candidateData = {};
      Object.keys(entry).forEach(key => {
        if (key.startsWith('gsx$')) {
          candidateData[key.replace('gsx$', '')] = entry[key].$t;
        }
      });
      // Add default fields for later processing
      candidateData.resumeContent = null;
      candidateData.status = "pending";
      candidateData.screenings = [];
      const candidateId = await saveCandidateData(candidateData);
      candidates.push({ id: candidateId, ...candidateData });
    }
    
    return candidates;
  } catch (error) {
    console.error("Error parsing Google Sheet:", error);
    throw error;
  }
};

// Parse CSV uploaded file with dynamic column handling
export const parseCSVUpload = async (csvFile) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const candidates = [];
          for (const row of results.data) {
            // Use entire row as candidate data
            const candidateData = { ...row, resumeContent: null, status: "pending", screenings: [] };
            const candidateId = await saveCandidateData(candidateData);
            if(candidateId === 0) continue;
            candidates.push({ id: candidateId, ...candidateData });
          }
          resolve(candidates);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
