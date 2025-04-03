// src/services/resumeParser.js
import axios from 'axios';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Fetch resume content from URL
export const fetchResumeContent = async (resumeUrl) => {
  try {
    // Use a CORS proxy if needed
    const response = await axios.get(resumeUrl, {
      responseType: 'blob'
    });
    
    // Handle different file types
    const fileType = response.headers['content-type'];
    let resumeText = '';
    
    if (fileType.includes('pdf') || fileType.includes('application/octet-stream')) {
      resumeText = await extractTextFromPDF(response.data);
    } else if (fileType.includes('word') || fileType.includes('docx')) {
      resumeText = await extractTextFromDOCX(response.data);
    } else if (fileType.includes('text')) {
      resumeText = await response.data.text();
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    return resumeText;
  } catch (error) {
    console.error("Error fetching resume:", error);
    throw error;
  }
};

// Extract text from PDF
const extractTextFromPDF = async (pdfBlob) => {
  // Using pdf.js for PDF parsing
  // This is a simplified example - in a real app, you'd need to include pdf.js library
  const pdfjs = await import('pdfjs-dist/build/pdf');
  const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
  
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
};

// Extract text from DOCX
const extractTextFromDOCX = async (docxBlob) => {
  // Using mammoth.js for DOCX parsing
  // This is a simplified example - in a real app, you'd need to include mammoth.js library
  const mammoth = await import('mammoth');
  
  const arrayBuffer = await docxBlob.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  return result.value;
};

// Save resume content to Firebase
export const saveResumeContent = async (candidateId, resumeContent) => {
  try {
    const candidateDoc = doc(db, "candidates", candidateId);
    
    await updateDoc(candidateDoc, {
      resumeContent,
      status: "content_loaded"
    });
    
    return true;
  } catch (error) {
    console.error("Error saving resume content:", error);
    throw error;
  }
};

// Process all resumes
export const processAllResumes = async (candidates) => {
  try {
    const results = [];
    
    for (const candidate of candidates) {
      try {
        const resumeContent = await fetchResumeContent(candidate.resumeUrl);
        await saveResumeContent(candidate.id, resumeContent);
        
        results.push({
          id: candidate.id,
          name: candidate.name,
          success: true
        });
      } catch (error) {
        results.push({
          id: candidate.id,
          name: candidate.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error processing resumes:", error);
    throw error;
  }
};