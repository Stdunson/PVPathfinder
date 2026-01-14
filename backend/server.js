const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper functions
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
  return relevantCourses.slice(0, 200);
};

const formatCourseCatalog = (courses) => {
  return courses.map(c => 
    `${c.code} - ${c.name} (${c.credits} cr) [Prereq: ${c.prerequisites}]`
  ).join('\n');
};

const formatCompletedCourses = (courses) => {
  if (!courses || courses.length === 0) {
    return '  - No courses completed yet';
  }
  return courses.map(c => 
    `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`
  ).join('\n');
};

// API Routes

// Generate course recommendations
app.post('/api/generate-recommendations', async (req, res) => {
  try {
    const { profileData, courseCatalog } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const coursesList = formatCompletedCourses(profileData.courses);
    const relevantCourses = getRelevantCourses(courseCatalog, profileData);
    const catalogSample = formatCourseCatalog(relevantCourses);

    // Add concentration support
    const concentrationInfo = profileData.concentration ? `\n- Concentration: ${profileData.concentration}` : '';
    const concentrationGuidance = profileData.concentration 
      ? `6. IMPORTANT: Prioritize courses that align with their concentration (${profileData.concentration}). This is a key part of their academic focus.`
      : '6. Consider their major and minor when selecting courses';

    const prompt = `You are an academic advisor for Prairie View A&M University (PVAMU). 

A student needs course recommendations for the next semester. Here is their information:

- Name: ${profileData.name || 'Not provided'}
- Major: ${profileData.major || 'Not specified'}${profileData.major2 ? `\n- Second Major: ${profileData.major2}` : ''}${concentrationInfo}
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
${concentrationGuidance}
7. Balance the course load appropriately (typically 12-15 credits minimum for full-time students)
8. If they have additional notes/constraints, factor those into your recommendations

Format your response in a clear, organized way with proper headings and sections.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ recommendations: text });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Generate semester roadmap
app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { profileData, courseCatalog, previousRecommendations } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const coursesList = formatCompletedCourses(profileData.courses);
    const relevantCourses = getRelevantCourses(courseCatalog, profileData);
    const catalogSample = formatCourseCatalog(relevantCourses);

    const nextSemesterContext = previousRecommendations 
      ? `\n\nIMPORTANT: For the FIRST semester in your roadmap, you should use these recommended courses as the foundation:\n${previousRecommendations}\n\nYou may adjust slightly if needed, but try to keep the first semester consistent with these recommendations.`
      : '';

    // Add concentration support
    const concentrationInfo = profileData.concentration ? `\n- Concentration: ${profileData.concentration}` : '';
    const concentrationGuidance = profileData.concentration
      ? `\n\nIMPORTANT: The student has a concentration in ${profileData.concentration}. Please ensure the roadmap includes courses that support this concentration throughout their remaining semesters.`
      : '';

    const prompt = `You are an academic advisor for Prairie View A&M University (PVAMU).

Create a complete semester-by-semester roadmap for this student to graduate on time:

Student Profile:
- Name: ${profileData.name || 'Not provided'}
- Major: ${profileData.major || 'Not specified'}${profileData.major2 ? `\n- Second Major: ${profileData.major2}` : ''}${concentrationInfo}
- Minor: ${profileData.minor || 'None'}${profileData.minor2 ? `\n- Second Minor: ${profileData.minor2}` : ''}
- Expected Graduation: ${profileData.expectedGraduation || 'Not specified'}
- Additional Notes/Requirements: ${profileData.additionalNotes || 'None'}
- Total Credits Earned: ${profileData.totalCredits || 0}
- Completed Courses:
${coursesList}

AVAILABLE COURSES AT PVAMU (Sample of relevant courses):
${catalogSample}

IMPORTANT: You MUST recommend courses from the available PVAMU course catalog above. Use the EXACT course codes and names.

Pay special attention to the "Additional Notes/Requirements" - these may include scholarship requirements, work schedules, or other constraints that MUST be considered when planning the roadmap. Standard full-time enrollment is 12-15 credits per semester.${nextSemesterContext}${concentrationGuidance}

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ roadmap: text });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
});

// Chat with advisor
app.post('/api/chat', async (req, res) => {
  try {
    const { profileData, chatHistory, userMessage, currentRecommendations } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const coursesList = formatCompletedCourses(profileData.courses);
    const chatHistoryText = chatHistory.map(msg => 
      `${msg.role === 'user' ? 'Student' : 'Advisor'}: ${msg.text}`
    ).join('\n');

    // Add concentration support
    const concentrationInfo = profileData.concentration ? `\n- Concentration: ${profileData.concentration}` : '';

    const prompt = `You are an academic advisor for Prairie View A&M University (PVAMU). 

Student Profile:
- Name: ${profileData.name || 'Not provided'}
- Major: ${profileData.major || 'Not specified'}${profileData.major2 ? `\n- Second Major: ${profileData.major2}` : ''}${concentrationInfo}
- Minor: ${profileData.minor || 'None'}${profileData.minor2 ? `\n- Second Minor: ${profileData.minor2}` : ''}
- Expected Graduation: ${profileData.expectedGraduation || 'Not specified'}
- Completed Courses:
${coursesList}

Your previous recommendations:
${currentRecommendations}

Chat History:
${chatHistoryText}

Student's new question: ${userMessage}

Provide a helpful, conversational response to their question. Keep it concise and relevant to their academic planning. Be friendly and supportive.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PV Pathfinder API Server Running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PV Pathfinder Backend running on http://localhost:${PORT}`);
  console.log(`💡 Health check: http://localhost:${PORT}/health`);
});