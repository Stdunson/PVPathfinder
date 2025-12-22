import React, { useState } from 'react';
import './App.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'profile', label: 'My Profile', icon: '📝' },
  { id: 'courses', label: 'Course Catalog', icon: '📚' },
  { id: 'recommendations', label: 'Recommendations', icon: '🎯' },
  { id: 'roadmap', label: 'Semester Roadmap', icon: '🗺️' }
];

function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">PV Pathfinder</h1>
        <p className="sidebar-subtitle">Academic Planning Assistant</p>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function Recommendations({ profileData, onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Build courses list from profile data
      const coursesList = profileData.courses && profileData.courses.length > 0
        ? profileData.courses.map(c => 
            `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`
          ).join('\n')
        : '  - No courses completed yet';

      // Build dynamic prompt with actual student data
      const prompt = `You are an academic advisor for Prairie View A&M University (PVAMU). 
      
A student needs course recommendations for the next semester. Here is their information:

- Name: ${profileData.name || 'Not provided'}
- Major: ${profileData.major || 'Not specified'}
- Minor: ${profileData.minor || 'None'}
- Expected Graduation: ${profileData.expectedGraduation || 'Not specified'}
- Minimum Credits per Semester: ${profileData.minCredits || 'Not specified'}
- Additional Notes: ${profileData.additionalNotes || 'None'}
- Completed Courses: 
${coursesList}
- Total Credits Earned: ${profileData.totalCredits || 0}

Based on this information, please:
1. Recommend 4-5 courses for the next semester
2. Explain why each course is recommended
3. Ensure prerequisites are met based on their completed courses
4. Consider their graduation timeline
5. Balance the course load to meet their minimum credit requirement
6. If they have additional notes (like scholarship requirements), consider those

Format your response in a clear, organized way with proper headings and sections.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setRecommendations(text);
      setChatMessages([]); // Reset chat when new recommendations are generated
    } catch (err) {
      setError('Failed to get recommendations. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Build context with profile, recommendations, and chat history
      const coursesList = profileData.courses && profileData.courses.length > 0
        ? profileData.courses.map(c => 
            `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`
          ).join('\n')
        : '  - No courses completed yet';

      const chatHistory = chatMessages.map(msg => 
        `${msg.role === 'user' ? 'Student' : 'Advisor'}: ${msg.text}`
      ).join('\n');

      const chatPrompt = `You are an academic advisor for Prairie View A&M University (PVAMU). 

Student Profile:
- Name: ${profileData.name || 'Not provided'}
- Major: ${profileData.major || 'Not specified'}
- Minor: ${profileData.minor || 'None'}
- Expected Graduation: ${profileData.expectedGraduation || 'Not specified'}
- Minimum Credits per Semester: ${profileData.minCredits || 'Not specified'}
- Completed Courses:
${coursesList}

Your previous recommendations:
${recommendations}

Chat History:
${chatHistory}

Student's new question: ${userMessage}

Provide a helpful, conversational response to their question. Keep it concise and relevant to their academic planning. Be friendly and supportive.`;

      const result = await model.generateContent(chatPrompt);
      const response = await result.response;
      const text = response.text();

      setChatMessages(prev => [...prev, { role: 'ai', text }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  return (
    <div className="recommendations-container">
      {!profileData ? (
        <div className="recommendations-intro">
          <h3 className="recommendations-title">Profile Required</h3>
          <p className="recommendations-description">
            Please complete your student profile first so we can provide personalized course recommendations.
          </p>
          <button onClick={() => onNavigate('profile')} className="primary-button">
            Go to Profile
          </button>
        </div>
      ) : !recommendations && !loading ? (
        <div className="recommendations-intro">
          <h3 className="recommendations-title">Get AI-Powered Course Recommendations</h3>
          <p className="recommendations-description">
            Our AI advisor will analyze your academic progress, major requirements, and graduation 
            timeline to recommend the best courses for your next semester. Click the button below 
            to get personalized recommendations.
          </p>
          <button onClick={getRecommendations} className="primary-button">
            Get Recommendations
          </button>
          {error && (
            <div className="error-container">
              <p className="error-text">{error}</p>
            </div>
          )}
        </div>
      ) : null}

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Analyzing your profile and generating recommendations...</p>
        </div>
      )}

      {recommendations && !loading && (
        <div className="recommendations-results">
          <div className="results-header">
            <h3 className="results-title">Your Course Recommendations</h3>
            <button onClick={getRecommendations} className="regenerate-button">
              Regenerate
            </button>
          </div>
          <div className="recommendations-content">
            <ReactMarkdown>{recommendations}</ReactMarkdown>
          </div>

          {/* Chat Interface */}
          <div className="chat-container">
            <h4 className="chat-title">Have questions about these recommendations? 💬</h4>
            
            {chatMessages.length > 0 && (
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    <div className="chat-message-label">
                      {msg.role === 'user' ? 'You' : 'AI Advisor'}
                    </div>
                    <div className="chat-message-text">
                      {msg.role === 'user' ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-loading">
                    <span>AI Advisor is thinking</span>
                    <div className="chat-loading-dots">
                      <div className="chat-loading-dot"></div>
                      <div className="chat-loading-dot"></div>
                      <div className="chat-loading-dot"></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask a question about your recommendations..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={chatLoading}
              />
              <button 
                className="chat-send-button"
                onClick={handleChatSend}
                disabled={chatLoading || !chatInput.trim()}
              >
                {chatLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ title }) {
  return (
    <header className="header">
      <h2 className="header-title">{title}</h2>
    </header>
  );
}

function Dashboard({ onNavigate, profileData }) {
  const coursesCompleted = profileData?.courses?.length || 0;
  const creditsEarned = profileData?.totalCredits || 0;
  
  return (
    <div>
      <div className="welcome-card">
        <h3 className="welcome-title">
          {profileData?.name ? `Welcome back, ${profileData.name}! 🎓` : 'Welcome to PV Pathfinder! 🎓'}
        </h3>
        <p className="welcome-text">
          {profileData 
            ? 'Your AI-powered academic planning assistant is ready to help you plan your next semester.'
            : 'Your AI-powered academic planning assistant. Get started by setting up your profile.'
          }
        </p>
        <button onClick={() => onNavigate('profile')} className="primary-button">
          {profileData ? 'Update Profile' : 'Set Up Profile'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4 className="stat-label">Courses Completed</h4>
          <p className="stat-value">{coursesCompleted}</p>
        </div>
        
        <div className="stat-card">
          <h4 className="stat-label">Credits Earned</h4>
          <p className="stat-value">{creditsEarned}</p>
        </div>
        
        <div className="stat-card">
          <h4 className="stat-label">Expected Graduation</h4>
          <p className="stat-value">{profileData?.expectedGraduation || '--'}</p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ message }) {
  return (
    <div className="placeholder-card">
      <p className="placeholder-text">{message}</p>
    </div>
  );
}

function ProfileForm({ onSaveProfile, existingProfile }) {
  const [formData, setFormData] = useState({
    name: existingProfile?.name || '',
    major: existingProfile?.major || '',
    minor: existingProfile?.minor || '',
    expectedGraduation: existingProfile?.expectedGraduation || '',
    minCredits: existingProfile?.minCredits || '',
    additionalNotes: existingProfile?.additionalNotes || ''
  });

  const [courses, setCourses] = useState(existingProfile?.courses || []);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    credits: '',
    semester: '',
    grade: ''
  });
  const [saved, setSaved] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addCourse = () => {
    if (newCourse.code && newCourse.name && newCourse.credits) {
      if (editingCourse !== null) {
        // Update existing course
        setCourses(prev => prev.map((course, idx) => 
          idx === editingCourse ? { ...newCourse, id: course.id } : course
        ));
        setEditingCourse(null);
      } else {
        // Add new course
        setCourses(prev => [...prev, { ...newCourse, id: Date.now() }]);
      }
      setNewCourse({ code: '', name: '', credits: '', semester: '', grade: '' });
      setShowAddCourse(false);
    }
  };

  const editCourse = (index) => {
    const course = courses[index];
    setNewCourse({
      code: course.code,
      name: course.name,
      credits: course.credits,
      semester: course.semester,
      grade: course.grade
    });
    setEditingCourse(index);
    setShowAddCourse(true);
  };

  const cancelEdit = () => {
    setNewCourse({ code: '', name: '', credits: '', semester: '', grade: '' });
    setEditingCourse(null);
    setShowAddCourse(false);
  };

  const removeCourse = (id) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  };

  const handleSave = () => {
    const profileToSave = {
      ...formData,
      courses: courses,
      totalCredits: courses.reduce((sum, course) => sum + parseInt(course.credits || 0), 0)
    };
    onSaveProfile(profileToSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="profile-form">
      {saved && (
        <div className="success-message">
          ✓ Profile saved successfully!
        </div>
      )}

      <div className="form-section">
        <h3 className="section-title">Personal Information</h3>
        
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Major</label>
            <select
              name="major"
              value={formData.major}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select your major</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Biology">Biology</option>
              <option value="Business">Business</option>
              <option value="Nursing">Nursing</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Minor (Optional)</label>
            <input
              type="text"
              name="minor"
              value={formData.minor}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your minor"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Expected Graduation</label>
            <select
              name="expectedGraduation"
              value={formData.expectedGraduation}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select graduation semester</option>
              <option value="Spring 2025">Spring 2025</option>
              <option value="Summer 2025">Summer 2025</option>
              <option value="Fall 2025">Fall 2025</option>
              <option value="Spring 2026">Spring 2026</option>
              <option value="Summer 2026">Summer 2026</option>
              <option value="Fall 2026">Fall 2026</option>
              <option value="Spring 2027">Spring 2027</option>
              <option value="Summer 2027">Summer 2027</option>
              <option value="Fall 2027">Fall 2027</option>
              <option value="Spring 2028">Spring 2028</option>
              <option value="Summer 2028">Summer 2028</option>
              <option value="Fall 2028">Fall 2028</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Credit Hours per Semester</label>
            <input
              type="number"
              name="minCredits"
              value={formData.minCredits}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 12"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <input
            type="text"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Scholarship requirements, work schedule, etc."
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Completed Courses</h3>
        
        <div className="course-list">
          {courses.length === 0 ? (
            <p className="placeholder-text">No courses added yet.</p>
          ) : (
            courses.map((course, index) => (
              <div key={course.id} className="course-item">
                <div className="course-info">
                  <div className="course-code">{course.code} - {course.name}</div>
                  <div className="course-details">
                    {course.credits} credits • {course.semester} • Grade: {course.grade}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => editCourse(index)}
                    className="secondary-button"
                    style={{ padding: '6px 12px', margin: 0 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeCourse(course.id)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!showAddCourse ? (
          <button
            onClick={() => setShowAddCourse(true)}
            className="primary-button"
            style={{ marginTop: '16px' }}
          >
            + Add Course
          </button>
        ) : (
          <div className="add-course-section">
            <h4 style={{ marginBottom: '12px', color: '#1f2937' }}>
              {editingCourse !== null ? 'Edit Course' : 'Add New Course'}
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input
                  type="text"
                  name="code"
                  value={newCourse.code}
                  onChange={handleCourseInputChange}
                  className="form-input"
                  placeholder="e.g., CS 101"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Name</label>
                <input
                  type="text"
                  name="name"
                  value={newCourse.name}
                  onChange={handleCourseInputChange}
                  className="form-input"
                  placeholder="e.g., Intro to Programming"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Credits</label>
                <input
                  type="number"
                  name="credits"
                  value={newCourse.credits}
                  onChange={handleCourseInputChange}
                  className="form-input"
                  placeholder="e.g., 3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Semester Taken</label>
                <input
                  type="text"
                  name="semester"
                  value={newCourse.semester}
                  onChange={handleCourseInputChange}
                  className="form-input"
                  placeholder="e.g., Fall 2023"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Grade</label>
              <select
                name="grade"
                value={newCourse.grade}
                onChange={handleCourseInputChange}
                className="form-select"
              >
                <option value="">Select grade</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="F">F</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={addCourse} className="primary-button">
                {editingCourse !== null ? 'Update Course' : 'Add Course'}
              </button>
              <button
                onClick={cancelEdit}
                className="secondary-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button 
          onClick={handleSave} 
          className={`primary-button ${saved ? 'saved' : ''}`}
        >
          {saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [profileData, setProfileData] = useState(null);

  const pageTitle = navItems.find(item => item.id === currentPage)?.label || 'Dashboard';

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} profileData={profileData} />;
      case 'profile':
        return <ProfileForm onSaveProfile={setProfileData} existingProfile={profileData} />;
      case 'courses':
        return <PlaceholderPage message="Course catalog will go here..." />;
      case 'recommendations':
        return <Recommendations profileData={profileData} onNavigate={setCurrentPage} />;
      case 'roadmap':
        return <PlaceholderPage message="Semester roadmap will go here..." />;
      default:
        return <Dashboard onNavigate={setCurrentPage} profileData={profileData} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="main-content">
        <Header title={pageTitle} />
        <div className="content-area">{renderPage()}</div>
      </main>
    </div>
  );
}

export default App;