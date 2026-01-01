// server.js - Backend API server for PV Pathfinder
// This keeps your Gemini API key secure on the server side

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI with API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors()); // Allow requests from React frontend
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies (increased limit for course data)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PV Pathfinder API Server Running' });
});

// ============================================
// RECOMMENDATIONS ENDPOINT
// ============================================
app.post('/api/generate-recommendations', async (req, res) => {
  try {
    const { profileData, courseCatalog } = req.body;

    // Validation
    if (!profileData) {
      return res.status(400).json({ error: 'Profile data is required' });
    }

    // Format course catalog
    const catalogSample = courseCatalog
      .slice(0, 200)
      .map(c => `${c.code} - ${c.name} (${c.credits} cr) [Prereq: ${c.prerequisites}]`)
      .join('\n');

    // Format completed courses
    const coursesList = profileData.courses && profileData.courses.length > 0
      ? profileData.courses.map(c => 
          `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`
        ).join('\n')
      : '  - No courses completed yet';

    // Build prompt
    const prompt = `You are an academic advisor for Prairie View A&M University (PVAMU). 

A student needs course recommendations for the next semester. Here is their information:

- Name: ${profileData.name || 'Not provided'}
- Major: ${profileData.major || 'Not specified'}${profileData.major2 ? `\n- Second Major: ${profileData.major2}` : ''}
- Minor: ${profileData.minor || 'None'}${profileData.minor2 ? `\n- Second Minor: ${profileData.minor2}` : ''}
- Expected Graduation: ${profileData.expectedGraduation || 'Not specified'}
- Additional Notes/Constraints: ${profileData.additionalNotes || 'None'}
- Completed Courses: 
${coursesList}
- Total Credits Earned: ${profileData.totalCredits || 0}

AVAILABLE COURSES AT PVAMU (Sample of relevant courses):
${catalogSample}

IMPORTANT: You MUST recommend courses from the available PVAMU course catalog above. Use the EXACT course codes and names as shown.

Based on this information, please:
1. Recommend 4-5 courses for the next semester from the available PVAMU courses
2. Use EXACT course codes from the catalog (e.g., "COMP 1336 - Computer Science I")
3. Explain why each course is recommended
4. Ensure prerequisites are met based on their completed courses
5. Consider their graduation timeline
6. Balance the course load appropriately (typically 12-15 credits minimum for full-time students)
7. If they have additional notes/constraints, factor those into your recommendations

Format your response in a clear, organized way with proper headings and sections.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ recommendations: text });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
});

// ============================================
// ROADMAP ENDPOINT
// ============================================
app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { profileData, courseCatalog, previousRecommendations } = req.body;

    // Validation
    if (!profileData) {
      return res.status(400).json({ error: 'Profile data is required' });
    }

    // Format course catalog
    const catalogSample = courseCatalog
      .slice(0, 200)
      .map(c => `${c.code} - ${c.name} (${c.credits} cr) [Prereq: ${c.prerequisites}]`)
      .join('\n');

    // Format completed courses
    const coursesList = profileData.courses && profileData.courses.length > 0
      ? profileData.courses.map(c => 
          `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`
        ).join('\n')
      : '  - No courses completed yet';

    const nextSemesterContext = previousRecommendations 
      ? `\n\nIMPORTANT: For the FIRST semester in your roadmap, you should use these recommended courses as the foundation:\n${previousRecommendations}\n\nYou may adjust slightly if needed, but try to keep the first semester consistent with these recommendations.`
      : '';

    // Build prompt
    const prompt = `You are an academic advisor for Prairie View A&M University (PVAMU).

Create a complete semester-by-semester roadmap for this student to graduate on time:

Student Profile:
- Name: ${profileData.name || 'Not provided'}
- Major: ${profileData.major || 'Not specified'}${profileData.major2 ? `\n- Second Major: ${profileData.major2}` : ''}
- Minor: ${profileData.minor || 'None'}${profileData.minor2 ? `\n- Second Minor: ${profileData.minor2}` : ''}
- Expected Graduation: ${profileData.expectedGraduation || 'Not specified'}
- Additional Notes/Requirements: ${profileData.additionalNotes || 'None'}
- Total Credits Earned: ${profileData.totalCredits || 0}
- Completed Courses:
${coursesList}

AVAILABLE COURSES AT PVAMU (Sample of relevant courses):
${catalogSample}

IMPORTANT: You MUST recommend courses from the available PVAMU course catalog above. Use the EXACT course codes and names.

Pay special attention to the "Additional Notes/Requirements" - these may include scholarship requirements, work schedules, or other constraints that MUST be considered when planning the roadmap. Standard full-time enrollment is 12-15 credits per semester.${nextSemesterContext}

Generate a semester-by-semester plan from now until their expected graduation. For each semester, list:
- Semester name (e.g., "Fall 2024", "Spring 2025")
- 4-5 courses with EXACT course codes from the catalog, names, and credit hours
- Total credits for that semester
- Brief explanation of why these courses were chosen

Also provide a summary at the end with:
- Total remaining credits needed
- Total number of semesters
- Any important notes or warnings

Format your response EXACTLY like this structure:

## Fall 2024 (15 Credits)

**CSCI 1234 - Course Name** (3 Credits)
Brief explanation of why this course.

**MATH 2345 - Another Course** (4 Credits)
Brief explanation.

(Continue for all courses in this semester)

## Spring 2025 (16 Credits)

(Same format)

---

## Summary

**Total Credits Needed:** XX
**Semesters Remaining:** X
**Notes:** Any important considerations

Use this exact format with markdown headers (##) for each semester.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ roadmap: text });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({ 
      error: 'Failed to generate roadmap',
      details: error.message 
    });
  }
});

// ============================================
// CHAT ENDPOINT
// ============================================
app.post('/api/chat', async (req, res) => {
  try {
    const { profileData, chatHistory, userMessage, currentRecommendations } = req.body;

    // Validation
    if (!profileData || !userMessage) {
      return res.status(400).json({ error: 'Profile data and user message are required' });
    }

    // Format completed courses
    const coursesList = profileData.courses && profileData.courses.length > 0
      ? profileData.courses.map(c => 
          `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`
        ).join('\n')
      : '  - No courses completed yet';

    // Format chat history
    const chatHistoryText = chatHistory && chatHistory.length > 0
      ? chatHistory.map(msg => 
          `${msg.role === 'user' ? 'Student' : 'Advisor'}: ${msg.text}`
        ).join('\n')
      : '';

    // Build prompt
    const prompt = `You are an academic advisor for Prairie View A&M University (PVAMU). 

Student Profile:
- Name: ${profileData.name || 'Not provided'}
- Major: ${profileData.major || 'Not specified'}${profileData.major2 ? `\n- Second Major: ${profileData.major2}` : ''}
- Minor: ${profileData.minor || 'None'}${profileData.minor2 ? `\n- Second Minor: ${profileData.minor2}` : ''}
- Expected Graduation: ${profileData.expectedGraduation || 'Not specified'}
- Completed Courses:
${coursesList}

Your previous recommendations:
${currentRecommendations || 'No recommendations yet'}

${chatHistoryText ? `Chat History:\n${chatHistoryText}\n` : ''}

Student's new question: ${userMessage}

Provide a helpful, conversational response to their question. Keep it concise and relevant to their academic planning. Be friendly and supportive.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PV Pathfinder API Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});