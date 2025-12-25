import React, { useState, useCallback } from 'react';
import './App.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import Select from 'react-select';

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

// Major options for searchable dropdown
const majorOptions = [
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Computer Engineering', label: 'Computer Engineering' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Chemical Engineering', label: 'Chemical Engineering' },
  { value: 'Architecture', label: 'Architecture' },
  { value: 'Biology', label: 'Biology' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Management', label: 'Management' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Nursing', label: 'Nursing' },
  { value: 'Psychology', label: 'Psychology' },
  { value: 'Sociology', label: 'Sociology' },
  { value: 'Criminal Justice', label: 'Criminal Justice' },
  { value: 'Political Science', label: 'Political Science' },
  { value: 'English', label: 'English' },
  { value: 'History', label: 'History' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Education', label: 'Education' },
  { value: 'Social Work', label: 'Social Work' }
];

// Minor options for searchable dropdown
const minorOptions = [
  { value: 'Business', label: 'Business' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Psychology', label: 'Psychology' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'Physics', label: 'Physics' },
  { value: 'English', label: 'English' },
  { value: 'History', label: 'History' },
  { value: 'Political Science', label: 'Political Science' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Sociology', label: 'Sociology' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'Art', label: 'Art' },
  { value: 'Music', label: 'Music' },
  { value: 'Philosophy', label: 'Philosophy' },
  { value: 'Criminal Justice', label: 'Criminal Justice' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Statistics', label: 'Statistics' }
];

// Graduation semester options
const graduationOptions = [
  { value: 'Spring 2025', label: 'Spring 2025' },
  { value: 'Summer 2025', label: 'Summer 2025' },
  { value: 'Fall 2025', label: 'Fall 2025' },
  { value: 'Spring 2026', label: 'Spring 2026' },
  { value: 'Summer 2026', label: 'Summer 2026' },
  { value: 'Fall 2026', label: 'Fall 2026' },
  { value: 'Spring 2027', label: 'Spring 2027' },
  { value: 'Summer 2027', label: 'Summer 2027' },
  { value: 'Fall 2027', label: 'Fall 2027' },
  { value: 'Spring 2028', label: 'Spring 2028' },
  { value: 'Summer 2028', label: 'Summer 2028' },
  { value: 'Fall 2028', label: 'Fall 2028' },
  { value: 'Spring 2029', label: 'Spring 2029' },
  { value: 'Summer 2029', label: 'Summer 2029' },
  { value: 'Fall 2029', label: 'Fall 2029' }
];

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
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          padding: '5px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}>
          <img 
            src="/logo.png" 
            alt="PV Pathfinder Logo" 
            style={{ width: '80px', height: '80px', borderRadius: '50%' }}
          />
        </div>
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
  const firstName = profileData?.name ? profileData.name.split(' ')[0] : null;
  
  // Calculate GPA
  const calculateGPA = () => {
    if (!profileData?.courses || profileData.courses.length === 0) return 0;
    
    const gradePoints = {
      'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    profileData.courses.forEach(course => {
      const grade = course.grade?.toUpperCase();
      const credits = parseInt(course.credits) || 0;
      
      if (gradePoints[grade] !== undefined) {
        totalPoints += gradePoints[grade] * credits;
        totalCredits += credits;
      }
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };
  
  const gpa = calculateGPA();
  
  // Assuming 120 credits needed for graduation (typical bachelor's degree)
  const totalCreditsNeeded = 120;
  const progressPercentage = Math.min((creditsEarned / totalCreditsNeeded) * 100, 100);
  
  return (
    <div>
      <div className="welcome-card">
        <h3 className="welcome-title">
          {firstName ? `Welcome back, ${firstName}! 🎓` : 'Welcome to PV Pathfinder! 🎓'}
        </h3>
        <p className="welcome-text">
          {profileData 
            ? 'Your AI-powered academic planning assistant is ready to help you plan your next semester.'
            : 'Your AI-powered academic planning assistant. Get started by setting up your profile.'
          }
        </p>
        <button onClick={() => onNavigate('profile')} className="primary-button" aria-label={profileData ? 'Update your profile' : 'Set up your profile'}>
          {profileData ? 'Update Profile' : 'Set Up Profile'}
        </button>
      </div>

      {profileData && gpa > 0 && (
        <div className="progress-gpa-row">
          <div className="progress-section">
            <h4 className="progress-title">Degree Progress</h4>
            <div className="progress-bar-container" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin="0" aria-valuemax="100" aria-label="Degree completion progress">
              <div className="progress-bar" style={{ width: `${progressPercentage}%` }}>
                {progressPercentage > 10 && (
                  <span className="progress-text">{Math.round(progressPercentage)}%</span>
                )}
              </div>
            </div>
            <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '14px' }}>
              {creditsEarned} of {totalCreditsNeeded} credits completed
            </p>
          </div>

          <div className="gpa-section">
            <h4 className="gpa-title">Current GPA</h4>
            <div className="gpa-value">{gpa}</div>
            <p className="gpa-scale">out of 4.0</p>
          </div>
        </div>
      )}

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

function ProfileForm({ onSaveProfile, existingProfile, showToast, onTempUpdate }) {
  const [formData, setFormData] = useState({
    name: existingProfile?.name || '',
    major: existingProfile?.major || '',
    major2: existingProfile?.major2 || '',
    minor: existingProfile?.minor || '',
    minor2: existingProfile?.minor2 || '',
    hasDualMajor: existingProfile?.hasDualMajor || false,
    hasDualMinor: existingProfile?.hasDualMinor || false,
    expectedGraduation: existingProfile?.expectedGraduation || '',
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
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [initialData, setInitialData] = useState(null);

  // Store initial data on mount to compare for changes
  React.useEffect(() => {
    if (!initialData && existingProfile) {
      setInitialData({
        formData: {
          name: existingProfile.name || '',
          major: existingProfile.major || '',
          major2: existingProfile.major2 || '',
          minor: existingProfile.minor || '',
          minor2: existingProfile.minor2 || '',
          hasDualMajor: existingProfile.hasDualMajor || false,
          hasDualMinor: existingProfile.hasDualMinor || false,
          expectedGraduation: existingProfile.expectedGraduation || '',
          additionalNotes: existingProfile.additionalNotes || ''
        },
        courses: [...(existingProfile.courses || [])]
      });
    }
  }, [existingProfile, initialData]);

  // Update temp data whenever form changes
  React.useEffect(() => {
    const tempProfile = {
      ...formData,
      courses: courses,
      totalCredits: courses.reduce((sum, course) => sum + parseInt(course.credits || 0), 0)
    };
    
    // Check if there are actual changes
    let hasChanges = false;
    if (initialData) {
      const formChanged = JSON.stringify(formData) !== JSON.stringify(initialData.formData);
      const coursesChanged = JSON.stringify(courses) !== JSON.stringify(initialData.courses);
      hasChanges = formChanged || coursesChanged;
    }
    
    onTempUpdate(tempProfile, hasChanges);
  }, [formData, courses, onTempUpdate, initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : ''
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
        setCourses(prev => prev.map((course, idx) => 
          idx === editingCourse ? { ...newCourse, id: course.id } : course
        ));
        setEditingCourse(null);
      } else {
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.major) {
      newErrors.major = 'Major is required';
    }
    
    if (formData.hasDualMajor && !formData.major2) {
      newErrors.major2 = 'Second major is required when dual major is selected';
    }
    
    if (formData.hasDualMinor && formData.minor && !formData.minor2) {
      newErrors.minor2 = 'Second minor is required when dual minor is selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const profileToSave = {
      ...formData,
      courses: courses,
      totalCredits: courses.reduce((sum, course) => sum + parseInt(course.credits || 0), 0)
    };
    onSaveProfile(profileToSave);
    
    // Update initial data after save
    setInitialData({
      formData: { ...formData },
      courses: [...courses]
    });
    
    setSaved(true);
    showToast('Profile saved successfully!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="profile-form">
      {saved && (
        <div className="success-message">
          ✓ Profile saved successfully!
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Remove Course?</h3>
            <p className="modal-message">
              Are you sure you want to remove this course?
            </p>
            <div className="modal-actions">
              <button 
                className="modal-button secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="modal-button primary"
                onClick={() => {
                  removeCourse(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="form-section">
        <h3 className="section-title">Personal Information</h3>
        
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="Enter your full name"
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Major *</label>
          <Select
            name="major"
            value={majorOptions.find(option => option.value === formData.major) || null}
            onChange={(option) => handleSelectChange('major', option)}
            options={majorOptions}
            placeholder="Search or select your major..."
            isClearable
            isSearchable
            className={errors.major ? 'error' : ''}
          />
          {errors.major && <div className="form-error">{errors.major}</div>}
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
          <input
            type="checkbox"
            id="hasDualMajor"
            name="hasDualMajor"
            checked={formData.hasDualMajor}
            onChange={handleInputChange}
            style={{ width: 'auto', cursor: 'pointer' }}
          />
          <label htmlFor="hasDualMajor" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 'normal' }}>
            I have a dual major
          </label>
        </div>

        {formData.hasDualMajor && (
          <div className="form-group">
            <label className="form-label">Second Major *</label>
            <Select
              name="major2"
              value={majorOptions.find(option => option.value === formData.major2) || null}
              onChange={(option) => handleSelectChange('major2', option)}
              options={majorOptions}
              placeholder="Search or select your second major..."
              isClearable
              isSearchable
              className={errors.major2 ? 'error' : ''}
            />
            {errors.major2 && <div className="form-error">{errors.major2}</div>}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Minor (Optional)</label>
          <Select
            name="minor"
            value={minorOptions.find(option => option.value === formData.minor) || null}
            onChange={(option) => handleSelectChange('minor', option)}
            options={minorOptions}
            placeholder="Search or select your minor..."
            isClearable
            isSearchable
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
          <input
            type="checkbox"
            id="hasDualMinor"
            name="hasDualMinor"
            checked={formData.hasDualMinor}
            onChange={handleInputChange}
            style={{ width: 'auto', cursor: 'pointer' }}
          />
          <label htmlFor="hasDualMinor" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 'normal' }}>
            I have a second minor
          </label>
        </div>

        {formData.hasDualMinor && (
          <div className="form-group">
            <label className="form-label">Second Minor</label>
            <Select
              name="minor2"
              value={minorOptions.find(option => option.value === formData.minor2) || null}
              onChange={(option) => handleSelectChange('minor2', option)}
              options={minorOptions}
              placeholder="Search or select your second minor..."
              isClearable
              isSearchable
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Expected Graduation</label>
          <Select
            name="expectedGraduation"
            value={graduationOptions.find(option => option.value === formData.expectedGraduation) || null}
            onChange={(option) => handleSelectChange('expectedGraduation', option)}
            options={graduationOptions}
            placeholder="Select graduation semester..."
            isClearable
            isSearchable
          />
        </div>

        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <input
            type="text"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Scholarship requirements, preferred schedule, etc."
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
                    onClick={() => setShowDeleteConfirm(course.id)}
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

function Recommendations({ profileData, onNavigate, savedData, onSaveData, onGenerate, isLoading }) {
  const [recommendations, setRecommendations] = useState(savedData?.recommendations || null);
  const [chatMessages, setChatMessages] = useState(savedData?.chatMessages || []);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  React.useEffect(() => {
    if (savedData?.recommendations) {
      setRecommendations(savedData.recommendations);
      setChatMessages(savedData.chatMessages || []);
    }
  }, [savedData]);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
- Major: ${profileData.major || 'Not specified'}${profileData.major2 ? `\n- Second Major: ${profileData.major2}` : ''}
- Minor: ${profileData.minor || 'None'}${profileData.minor2 ? `\n- Second Minor: ${profileData.minor2}` : ''}
- Expected Graduation: ${profileData.expectedGraduation || 'Not specified'}
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

      const updatedMessages = [...chatMessages, { role: 'ai', text }];
      setChatMessages(updatedMessages);
      onSaveData({ recommendations, chatMessages: updatedMessages });
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

  const handlePrint = () => {
    window.print();
  };

  const handleExportText = () => {
    const element = document.createElement('a');
    const file = new Blob([recommendations], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'course-recommendations.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
      ) : !recommendations && !isLoading ? (
        <div className="recommendations-intro">
          <h3 className="recommendations-title">Get AI-Powered Course Recommendations</h3>
          <p className="recommendations-description">
            Our AI advisor will analyze your academic progress, major requirements, and graduation 
            timeline to recommend the best courses for your next semester. Click the button below 
            to get personalized recommendations.
          </p>
          <button onClick={onGenerate} className="primary-button">
            Get Recommendations
          </button>
        </div>
      ) : null}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="paw"></div>
            <div className="paw"></div>
            <div className="paw"></div>
            <div className="paw"></div>
          </div>
          <p className="loading-text">Analyzing your profile and generating recommendations...</p>
        </div>
      )}

      {recommendations && !isLoading && (
        <div className="recommendations-results">
          <div className="results-header">
            <h3 className="results-title">Your Course Recommendations</h3>
            <button onClick={onGenerate} className="regenerate-button" disabled={isLoading} aria-label="Regenerate course recommendations">
              Regenerate
            </button>
          </div>
          <div className="recommendations-content">
            <ReactMarkdown>{recommendations}</ReactMarkdown>
          </div>

          <div className="export-buttons">
            <button onClick={handlePrint} className="export-button" aria-label="Print recommendations">
              🖨️ Print
            </button>
            <button onClick={handleExportText} className="export-button" aria-label="Download recommendations as text file">
              📄 Download as Text
            </button>
          </div>

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

function SemesterRoadmap({ profileData, onNavigate, savedRoadmap, onGenerate, isLoading, hasRecommendations }) {
  const [roadmap, setRoadmap] = useState(savedRoadmap || null);

  React.useEffect(() => {
    if (savedRoadmap) {
      setRoadmap(savedRoadmap);
    }
  }, [savedRoadmap]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportText = () => {
    const element = document.createElement('a');
    const file = new Blob([roadmap], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'semester-roadmap.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="roadmap-container">
      {!profileData ? (
        <div className="roadmap-intro">
          <h3 className="recommendations-title">Profile Required</h3>
          <p className="recommendations-description">
            Please complete your student profile first so we can create a personalized semester roadmap.
          </p>
          <button onClick={() => onNavigate('profile')} className="primary-button">
            Go to Profile
          </button>
        </div>
      ) : !hasRecommendations ? (
        <div className="roadmap-intro">
          <h3 className="recommendations-title">Recommendations Required</h3>
          <p className="recommendations-description">
            To ensure consistency in your academic plan, please generate your course recommendations first. 
            The roadmap will build upon those recommendations to create a complete semester-by-semester plan.
          </p>
          <button onClick={() => onNavigate('recommendations')} className="primary-button">
            Go to Recommendations
          </button>
        </div>
      ) : !roadmap && !isLoading ? (
        <div className="roadmap-intro">
          <h3 className="recommendations-title">Generate Your Semester Roadmap</h3>
          <p className="recommendations-description">
            Get a complete semester-by-semester plan from now until graduation. Our AI will create 
            a personalized roadmap showing exactly which courses to take each semester, considering 
            prerequisites, your graduation timeline, and degree requirements.
          </p>
          <button onClick={onGenerate} className="primary-button">
            Generate Roadmap
          </button>
        </div>
      ) : null}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="paw"></div>
            <div className="paw"></div>
            <div className="paw"></div>
            <div className="paw"></div>
          </div>
          <p className="loading-text">Creating your personalized roadmap...</p>
        </div>
      )}

      {roadmap && !isLoading && (
        <div className="roadmap-results">
          <div className="results-header">
            <h3 className="results-title">Your Semester Roadmap</h3>
            <button onClick={onGenerate} className="regenerate-button" disabled={isLoading} aria-label="Regenerate semester roadmap">
              Regenerate
            </button>
          </div>
          <div className="recommendations-content">
            <ReactMarkdown>{roadmap}</ReactMarkdown>
          </div>
          
          <div className="export-buttons">
            <button onClick={handlePrint} className="export-button" aria-label="Print roadmap">
              🖨️ Print
            </button>
            <button onClick={handleExportText} className="export-button" aria-label="Download roadmap as text file">
              📄 Download as Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [profileData, setProfileData] = useState(null);
  const [tempProfileData, setTempProfileData] = useState(null);
  const [savedRecommendations, setSavedRecommendations] = useState(null);
  const [savedRoadmap, setSavedRoadmap] = useState(null);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const pageTitle = navItems.find(item => item.id === currentPage)?.label || 'Dashboard';

  // Toast notification system
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Handle page navigation with unsaved changes warning
  const handleNavigation = (page) => {
    if (hasUnsavedChanges && currentPage === 'profile') {
      showToast('Don\'t forget to save your profile changes!', 'info');
    }
    setCurrentPage(page);
  };

  // Save profile and clear temp data
  const handleSaveProfile = (profile) => {
    setProfileData(profile);
    setTempProfileData(null);
    setHasUnsavedChanges(false);
  };

  // Update temp profile data
  const handleTempProfileUpdate = useCallback((tempData, hasChanges) => {
    setTempProfileData(tempData);
    setHasUnsavedChanges(hasChanges);
  }, []);

  const generateRecommendations = async () => {
    if (!profileData) return;
    
    setIsGeneratingRecommendations(true);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const coursesList = profileData.courses && profileData.courses.length > 0
        ? profileData.courses.map(c => 
            `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`
          ).join('\n')
        : '  - No courses completed yet';

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

Based on this information, please:
1. Recommend 4-5 courses for the next semester
2. Explain why each course is recommended
3. Ensure prerequisites are met based on their completed courses
4. Consider their graduation timeline
5. Balance the course load appropriately (typically 12-15 credits minimum for full-time students)
6. If they have additional notes/constraints, factor those into your recommendations

Format your response in a clear, organized way with proper headings and sections.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setSavedRecommendations({ recommendations: text, chatMessages: [] });
      showToast('Recommendations generated successfully!', 'success');
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
      showToast('Failed to generate recommendations. Please try again.', 'error');
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const generateRoadmap = async () => {
    if (!profileData) return;
    
    setIsGeneratingRoadmap(true);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const coursesList = profileData.courses && profileData.courses.length > 0
        ? profileData.courses.map(c => 
            `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`
          ).join('\n')
        : '  - No courses completed yet';

      const nextSemesterContext = savedRecommendations?.recommendations 
        ? `\n\nIMPORTANT: For the FIRST semester in your roadmap, you should use these recommended courses as the foundation:\n${savedRecommendations.recommendations}\n\nYou may adjust slightly if needed, but try to keep the first semester consistent with these recommendations.`
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

IMPORTANT: Pay special attention to the "Additional Notes/Requirements" - these may include scholarship requirements, work schedules, or other constraints that MUST be considered when planning the roadmap. Standard full-time enrollment is 12-15 credits per semester.${nextSemesterContext}

Generate a semester-by-semester plan from now until their expected graduation. For each semester, list:
- Semester name (e.g., "Fall 2024", "Spring 2025")
- 4-5 courses with course codes, names, and credit hours
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
      
      setSavedRoadmap(text);
      showToast('Roadmap generated successfully!', 'success');
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
      showToast('Failed to generate roadmap. Please try again.', 'error');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigation} profileData={profileData} />;
      case 'profile':
        return <ProfileForm 
          onSaveProfile={handleSaveProfile}
          existingProfile={tempProfileData || profileData}
          showToast={showToast}
          onTempUpdate={handleTempProfileUpdate}
        />;
      case 'courses':
        return <PlaceholderPage message="Course catalog will go here..." />;
      case 'recommendations':
        return <Recommendations 
          profileData={profileData} 
          onNavigate={handleNavigation} 
          savedData={savedRecommendations}
          onSaveData={setSavedRecommendations}
          onGenerate={generateRecommendations}
          isLoading={isGeneratingRecommendations}
        />;
      case 'roadmap':
        return <SemesterRoadmap 
          profileData={profileData} 
          onNavigate={handleNavigation}
          savedRoadmap={savedRoadmap}
          onGenerate={generateRoadmap}
          isLoading={isGeneratingRoadmap}
          hasRecommendations={!!savedRecommendations}
        />;
      default:
        return <Dashboard onNavigate={handleNavigation} profileData={profileData} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigation} />
      
      <main className="main-content">
        <Header title={pageTitle} />
        <div className="content-area">{renderPage()}</div>
        <footer className="app-footer">
          © {new Date().getFullYear()} PV Pathfinder | Prairie View A&M University
        </footer>
      </main>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'info' && 'ℹ'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;