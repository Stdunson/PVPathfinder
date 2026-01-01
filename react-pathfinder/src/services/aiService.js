// aiService.js - Frontend service to call backend API
// API key is now secure on the backend!

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Filter courses relevant to the student's major/minor
 */
const getRelevantCourses = (courseCatalog, profileData) => {
  const relevantCourses = courseCatalog.filter(course => {
    const deptMatches = 
      (profileData.major && course.department.toLowerCase().includes(profileData.major.toLowerCase().split(' ')[0])) ||
      (profileData.minor && course.department.toLowerCase().includes(profileData.minor.toLowerCase().split(' ')[0])) ||
      course.department === 'General Studies' ||
      course.code.startsWith('MATH') ||
      course.code.startsWith('ENGL') ||
      course.code.startsWith('HIST') ||
      course.code.startsWith('GNST');
    return deptMatches && course.degreeLevel === "Bachelor's";
  });

  // Limit to 200 courses to stay within token limits
  return relevantCourses.slice(0, 200);
};

/**
 * Generate course recommendations for next semester
 */
export const generateRecommendations = async (profileData, courseCatalog) => {
  try {
    const relevantCourses = getRelevantCourses(courseCatalog, profileData);
    
    const response = await fetch(`${API_BASE_URL}/api/generate-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileData,
        courseCatalog: relevantCourses
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate recommendations');
    }

    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

/**
 * Generate semester-by-semester roadmap
 */
export const generateRoadmap = async (profileData, courseCatalog, previousRecommendations = null) => {
  try {
    const relevantCourses = getRelevantCourses(courseCatalog, profileData);
    
    const response = await fetch(`${API_BASE_URL}/api/generate-roadmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileData,
        courseCatalog: relevantCourses,
        previousRecommendations
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate roadmap');
    }

    const data = await response.json();
    return data.roadmap;
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw error;
  }
};

/**
 * Handle follow-up chat questions about recommendations
 */
export const chatWithAdvisor = async (profileData, chatHistory, userMessage, currentRecommendations) => {
  try {
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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process chat message');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
};