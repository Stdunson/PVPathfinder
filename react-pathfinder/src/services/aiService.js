import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variable
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('GEMINI API KEY is missing! Please add REACT_APP_GEMINI_API_KEY to your .env file');
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
 * Format course catalog for prompt
 */
const formatCourseCatalog = (courses) => {
  return courses.map(c => 
    `${c.code} - ${c.name} (${c.credits} cr) [Prereq: ${c.prerequisites}]`
  ).join('\n');
};

/**
 * Format completed courses list
 */
const formatCompletedCourses = (courses) => {
  if (!courses || courses.length === 0) {
    return '  - No courses completed yet';
  }
  return courses.map(c => 
    `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`
  ).join('\n');
};

/**
 * Generate course recommendations for next semester
 */
export const generateRecommendations = async (profileData, courseCatalog) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const coursesList = formatCompletedCourses(profileData.courses);
  const relevantCourses = getRelevantCourses(courseCatalog, profileData);
  const catalogSample = formatCourseCatalog(relevantCourses);

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

/**
 * Generate semester-by-semester roadmap
 */
export const generateRoadmap = async (profileData, courseCatalog, previousRecommendations = null) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const coursesList = formatCompletedCourses(profileData.courses);
  const relevantCourses = getRelevantCourses(courseCatalog, profileData);
  const catalogSample = formatCourseCatalog(relevantCourses);

  const nextSemesterContext = previousRecommendations 
    ? `\n\nIMPORTANT: For the FIRST semester in your roadmap, you should use these recommended courses as the foundation:\n${previousRecommendations}\n\nYou may adjust slightly if needed, but try to keep the first semester consistent with these recommendations.`
    : '';

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

/**
 * Handle follow-up chat questions about recommendations
 */
export const chatWithAdvisor = async (profileData, chatHistory, userMessage, currentRecommendations) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const coursesList = formatCompletedCourses(profileData.courses);
  const chatHistoryText = chatHistory.map(msg => 
    `${msg.role === 'user' ? 'Student' : 'Advisor'}: ${msg.text}`
  ).join('\n');

  const prompt = `You are an academic advisor for Prairie View A&M University (PVAMU). 

Student Profile:
- Name: ${profileData.name || 'Not provided'}
- Major: ${profileData.major || 'Not specified'}${profileData.major2 ? `\n- Second Major: ${profileData.major2}` : ''}
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
  return response.text();
};