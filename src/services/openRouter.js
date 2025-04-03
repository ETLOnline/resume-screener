// src/services/openRouter.js
import axios from 'axios';
import { saveScreeningResult } from './firebase';

// Open Router API endpoint
const OPEN_ROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Get available models from Open Router
export const getAvailableModels = async () => {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Resume Screening App'
      }
    });
    
    return response.data.data
      .filter(model => model.context_length >= 4000) // Filter models that can handle resume-length content
      .map(model => ({
        id: model.id,
        name: model.name,
        description: model.description
      }));
  } catch (error) {
    console.error("Error fetching available models:", error);
    throw error;
  }
};

// Generate screening prompt
const generateScreeningPrompt = (resumeContent, jobDescription) => {
  if (jobDescription) {
    return `You are an expert resume screener. Please review the following resume for the job position described below.
    
Job Description:
${jobDescription}

Resume:
${resumeContent}

Please evaluate this candidate based on the following criteria:
1. Relevant experience
2. Skills match
3. Education
4. Overall fit for the role

Provide a score from 1-10 for each category and an overall recommendation (Reject, Maybe, Proceed). Include brief justification for your assessment.`;
  } else {
    return `You are an expert resume screener. Please review the following resume.
    
Resume:
${resumeContent}

Please provide a comprehensive assessment of this candidate including:
1. Candidate summary (background, experience level, specialty areas)
2. Key skills identified
3. Notable strengths
4. Potential areas of concern
5. Overall assessment of the candidate's profile

Keep your response well-structured and concise.`;
  }
};

// Screen resume with Open Router
export const screenResume = async (candidateId, resumeContent, modelId, jobDescription = null) => {
  try {
    const prompt = generateScreeningPrompt(resumeContent, jobDescription);
    
    const response = await axios.post(OPEN_ROUTER_API_URL, {
      model: modelId,
      messages: [
        { role: "system", content: "You are an expert resume screener helping a recruiter evaluate candidates." },
        { role: "user", content: prompt }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Resume Screening App'
      }
    });
    
    const result = {
      modelId,
      modelName: response.data.model,
      timestamp: new Date(),
      assessment: response.data.choices[0].message.content,
      promptTokens: response.data.usage.prompt_tokens,
      completionTokens: response.data.usage.completion_tokens,
      totalTokens: response.data.usage.total_tokens
    };
    
    // Save screening result to Firebase
    await saveScreeningResult(candidateId, result);
    
    return result;
  } catch (error) {
    console.error("Error screening resume:", error);
    throw error;
  }
};

// Screen resume with multiple models
export const screenResumeWithMultipleModels = async (candidateId, resumeContent, modelIds, jobDescription = null) => {
  try {
    const results = [];
    
    for (const modelId of modelIds) {
      try {
        const result = await screenResume(candidateId, resumeContent, modelId, jobDescription);
        results.push({
          modelId,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          modelId,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error screening resume with multiple models:", error);
    throw error;
  }
};