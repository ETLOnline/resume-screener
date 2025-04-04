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
        'Authorization': `Bearer ${process.env.REACT_APP_OPEN_ROUTER_API_KEY}`,
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

return `
  Prompt:${jobDescription}
  
  Resume:${resumeContent}`;
};

// Screen resume with Open Router
export const screenResume = async (candidateId, resumeContent, modelId, jobPrompt = null) => {
  try {
    const prompt = generateScreeningPrompt(resumeContent, jobPrompt);
    
    const response = await axios.post(OPEN_ROUTER_API_URL, {
      model: modelId,
      messages: [
        { role: "system", content: "You are an expert resume screener helping a recruiter evaluate candidates." },
        { role: "user", content: prompt }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPEN_ROUTER_API_KEY}`,
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