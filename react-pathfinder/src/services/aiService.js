// Frontend aiService.js - Calls YOUR backend API (secure!)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Generate course recommendations for next semester
 */
export const generateRecommendations = async (profileData, courseCatalog) => {
  const response = await fetch(`${API_BASE_URL}/api/generate-recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profileData,
      courseCatalog
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate recommendations');
  }

  const data = await response.json();
  return data.recommendations;
};

/**
 * Generate semester-by-semester roadmap
 */
export const generateRoadmap = async (profileData, courseCatalog, previousRecommendations = null) => {
  const response = await fetch(`${API_BASE_URL}/api/generate-roadmap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profileData,
      courseCatalog,
      previousRecommendations
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate roadmap');
  }

  const data = await response.json();
  return data.roadmap;
};

/**
 * Handle follow-up chat questions about recommendations
 */
export const chatWithAdvisor = async (profileData, chatHistory, userMessage, currentRecommendations) => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profileData,
      chatHistory,
      userMessage,
      currentRecommendations
    })
  });

  if (!response.ok) {
    throw new Error('Failed to chat with advisor');
  }

  const data = await response.json();
  return data.response;
};