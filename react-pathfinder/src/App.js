import React, { useState, useCallback } from 'react';
import './App.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import Select from 'react-select';

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

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

const courseCatalog = [
  // Computer Science
  { id: 1, code: 'CS 1013', name: 'Introduction to Computer Science', credits: 3, department: 'Computer Science', description: 'Introduction to computer science concepts, problem-solving, and programming fundamentals.', prerequisites: 'None', semesters: ['Fall', 'Spring'] },
  { id: 2, code: 'CS 2013', name: 'Data Structures', credits: 3, department: 'Computer Science', description: 'Study of abstract data types, including lists, stacks, queues, trees, and graphs.', prerequisites: 'CS 1013', semesters: ['Fall', 'Spring'] },
  { id: 3, code: 'CS 3013', name: 'Algorithms', credits: 3, department: 'Computer Science', description: 'Design and analysis of algorithms, complexity theory, and computational problem-solving.', prerequisites: 'CS 2013', semesters: ['Fall', 'Spring'] },
  { id: 4, code: 'CS 3113', name: 'Database Systems', credits: 3, department: 'Computer Science', description: 'Database design, SQL, normalization, and database management systems.', prerequisites: 'CS 2013', semesters: ['Spring'] },
  { id: 5, code: 'CS 4013', name: 'Software Engineering', credits: 3, department: 'Computer Science', description: 'Software development lifecycle, design patterns, testing, and project management.', prerequisites: 'CS 3013', semesters: ['Fall'] },
  
  // Mathematics
  { id: 6, code: 'MATH 1314', name: 'College Algebra', credits: 3, department: 'Mathematics', description: 'Study of algebraic concepts including functions, polynomials, and equations.', prerequisites: 'None', semesters: ['Fall', 'Spring', 'Summer'] },
  { id: 7, code: 'MATH 1324', name: 'Trigonometry', credits: 3, department: 'Mathematics', description: 'Trigonometric functions, identities, and applications.', prerequisites: 'MATH 1314', semesters: ['Fall', 'Spring'] },
  { id: 8, code: 'MATH 2413', name: 'Calculus I', credits: 4, department: 'Mathematics', description: 'Limits, derivatives, and applications of differentiation.', prerequisites: 'MATH 1324', semesters: ['Fall', 'Spring', 'Summer'] },
  { id: 9, code: 'MATH 2414', name: 'Calculus II', credits: 4, department: 'Mathematics', description: 'Integration techniques, applications of integration, and series.', prerequisites: 'MATH 2413', semesters: ['Fall', 'Spring'] },
  { id: 10, code: 'MATH 3320', name: 'Linear Algebra', credits: 3, department: 'Mathematics', description: 'Vector spaces, matrices, linear transformations, and eigenvalues.', prerequisites: 'MATH 2413', semesters: ['Fall', 'Spring'] },
  
  // Engineering
  { id: 11, code: 'ENGR 1201', name: 'Introduction to Engineering', credits: 2, department: 'Engineering', description: 'Overview of engineering disciplines, problem-solving, and design process.', prerequisites: 'None', semesters: ['Fall', 'Spring'] },
  { id: 12, code: 'ENGR 2304', name: 'Engineering Mechanics - Statics', credits: 3, department: 'Engineering', description: 'Forces, moments, equilibrium, and analysis of structures.', prerequisites: 'MATH 2413', semesters: ['Fall', 'Spring'] },
  { id: 13, code: 'ENGR 2305', name: 'Engineering Mechanics - Dynamics', credits: 3, department: 'Engineering', description: 'Kinematics and kinetics of particles and rigid bodies.', prerequisites: 'ENGR 2304', semesters: ['Spring'] },
  { id: 14, code: 'ENGR 3301', name: 'Thermodynamics', credits: 3, department: 'Engineering', description: 'Laws of thermodynamics, heat transfer, and energy systems.', prerequisites: 'MATH 2414', semesters: ['Fall'] },
  
  // Business
  { id: 15, code: 'ACCT 2301', name: 'Principles of Accounting I', credits: 3, department: 'Business', description: 'Financial accounting concepts, preparation of financial statements.', prerequisites: 'None', semesters: ['Fall', 'Spring', 'Summer'] },
  { id: 16, code: 'ACCT 2302', name: 'Principles of Accounting II', credits: 3, department: 'Business', description: 'Managerial accounting, cost analysis, and budgeting.', prerequisites: 'ACCT 2301', semesters: ['Fall', 'Spring'] },
  { id: 17, code: 'BUAD 3301', name: 'Business Statistics', credits: 3, department: 'Business', description: 'Statistical methods for business decision-making and data analysis.', prerequisites: 'MATH 1314', semesters: ['Fall', 'Spring'] },
  { id: 18, code: 'MGMT 3301', name: 'Principles of Management', credits: 3, department: 'Business', description: 'Management theory, organizational behavior, and leadership.', prerequisites: 'Junior standing', semesters: ['Fall', 'Spring'] },
  { id: 19, code: 'MKTG 3301', name: 'Principles of Marketing', credits: 3, department: 'Business', description: 'Marketing concepts, consumer behavior, and marketing strategies.', prerequisites: 'Junior standing', semesters: ['Fall', 'Spring'] },
  
  // Biology
  { id: 20, code: 'BIOL 1406', name: 'General Biology I', credits: 4, department: 'Biology', description: 'Cell structure, genetics, evolution, and molecular biology.', prerequisites: 'None', semesters: ['Fall', 'Spring'] },
  { id: 21, code: 'BIOL 1407', name: 'General Biology II', credits: 4, department: 'Biology', description: 'Diversity of life, ecology, and organismal biology.', prerequisites: 'BIOL 1406', semesters: ['Fall', 'Spring'] },
  { id: 22, code: 'BIOL 3401', name: 'Genetics', credits: 4, department: 'Biology', description: 'Mendelian and molecular genetics, gene expression and regulation.', prerequisites: 'BIOL 1407', semesters: ['Fall'] },
  
  // Chemistry
  { id: 23, code: 'CHEM 1411', name: 'General Chemistry I', credits: 4, department: 'Chemistry', description: 'Atomic structure, chemical bonding, and stoichiometry.', prerequisites: 'MATH 1314', semesters: ['Fall', 'Spring'] },
  { id: 24, code: 'CHEM 1412', name: 'General Chemistry II', credits: 4, department: 'Chemistry', description: 'Thermodynamics, kinetics, equilibrium, and electrochemistry.', prerequisites: 'CHEM 1411', semesters: ['Fall', 'Spring'] },
  { id: 25, code: 'CHEM 3411', name: 'Organic Chemistry I', credits: 4, department: 'Chemistry', description: 'Structure, properties, and reactions of organic compounds.', prerequisites: 'CHEM 1412', semesters: ['Fall'] },
  
  // English
  { id: 26, code: 'ENGL 1301', name: 'Composition I', credits: 3, department: 'English', description: 'Academic writing, critical thinking, and research skills.', prerequisites: 'None', semesters: ['Fall', 'Spring', 'Summer'] },
  { id: 27, code: 'ENGL 1302', name: 'Composition II', credits: 3, department: 'English', description: 'Advanced composition, argumentation, and literary analysis.', prerequisites: 'ENGL 1301', semesters: ['Fall', 'Spring', 'Summer'] },
  { id: 28, code: 'ENGL 2311', name: 'Technical Writing', credits: 3, department: 'English', description: 'Professional and technical communication for various audiences.', prerequisites: 'ENGL 1302', semesters: ['Fall', 'Spring'] },
  
  // History
  { id: 29, code: 'HIST 1301', name: 'United States History I', credits: 3, department: 'History', description: 'American history from colonial period to Reconstruction.', prerequisites: 'None', semesters: ['Fall', 'Spring', 'Summer'] },
  { id: 30, code: 'HIST 1302', name: 'United States History II', credits: 3, department: 'History', description: 'American history from Reconstruction to present.', prerequisites: 'None', semesters: ['Fall', 'Spring', 'Summer'] },
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
  
  const calculateGPA = () => {
    if (!profileData?.courses || profileData.courses.length === 0) return 0;
    
    const gradePoints = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
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
        <button onClick={() => onNavigate('profile')} className="primary-button">
          {profileData ? 'Update Profile' : 'Set Up Profile'}
        </button>
      </div>

      {profileData && gpa > 0 && (
        <div className="progress-gpa-row">
          <div className="progress-section">
            <h4 className="progress-title">Degree Progress</h4>
            <div className="progress-bar-container">
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

function CourseCatalog({ profileData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');

  const departments = ['All', ...new Set(courseCatalog.map(course => course.department))];
  const semesters = ['All', 'Fall', 'Spring', 'Summer'];

  const filteredCourses = courseCatalog.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || course.department === selectedDepartment;
    const matchesSemester = selectedSemester === 'All' || course.semesters.includes(selectedSemester);
    
    return matchesSearch && matchesDepartment && matchesSemester;
  });

  const checkPrerequisites = (course) => {
    if (!profileData?.courses || course.prerequisites === 'None') return true;
    
    const completedCodes = profileData.courses.map(c => c.code.toUpperCase());
    const prereqCodes = course.prerequisites.split(',').map(p => p.trim().toUpperCase());
    
    return prereqCodes.every(prereq => 
      prereq === 'NONE' || 
      prereq.includes('STANDING') || 
      completedCodes.some(code => code === prereq)
    );
  };

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h3 className="catalog-title">Course Catalog</h3>
        <p className="catalog-description">
          Browse and search through available courses. Use filters to find courses by department or semester.
        </p>
      </div>

      <div className="catalog-filters">
        <div className="search-box">
          <input
            type="text"
            className="catalog-search"
            placeholder="Search by course code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Department:</label>
          <select 
            className="catalog-select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Semester:</label>
          <select 
            className="catalog-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            {semesters.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="catalog-results">
        <p className="results-count">
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
        </p>

        <div className="courses-grid">
          {filteredCourses.map(course => {
            const hasPrereqs = checkPrerequisites(course);
            
            return (
              <div key={course.id} className="course-card">
                <div className="course-card-header">
                  <div>
                    <h4 className="course-card-code">{course.code}</h4>
                    <p className="course-card-name">{course.name}</p>
                  </div>
                  <div className="course-card-credits">{course.credits} Credits</div>
                </div>

                <p className="course-card-description">{course.description}</p>

                <div className="course-card-footer">
                  <div className="course-card-meta">
                    <span className="course-meta-item">
                      <strong>Department:</strong> {course.department}
                    </span>
                    <span className="course-meta-item">
                      <strong>Offered:</strong> {course.semesters.join(', ')}
                    </span>
                    <span className="course-meta-item">
                      <strong>Prerequisites:</strong> {course.prerequisites}
                    </span>
                  </div>

                  {profileData && !hasPrereqs && course.prerequisites !== 'None' && (
                    <div className="prereq-warning">
                      ⚠️ Prerequisites not met
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="no-results">
            <p>No courses found matching your search criteria.</p>
            <p className="no-results-hint">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
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
  const [newCourse, setNewCourse] = useState({ code: '', name: '', credits: '', semester: '', grade: '' });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [initialData, setInitialData] = useState(null);

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

  React.useEffect(() => {
    const tempProfile = {
      ...formData,
      courses: courses,
      totalCredits: courses.reduce((sum, course) => sum + parseInt(course.credits || 0), 0)
    };
    
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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
  };

  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
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
    setNewCourse({ code: course.code, name: course.name, credits: course.credits, semester: course.semester, grade: course.grade });
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
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.major) newErrors.major = 'Major is required';
    if (formData.hasDualMajor && !formData.major2) newErrors.major2 = 'Second major is required when dual major is selected';
    if (formData.hasDualMinor && formData.minor && !formData.minor2) newErrors.minor2 = 'Second minor is required when dual minor is selected';
    
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
    
    setInitialData({ formData: { ...formData }, courses: [...courses] });
    setSaved(true);
    showToast('Profile saved successfully!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="profile-form">
      {saved && <div className="success-message">✓ Profile saved successfully!</div>}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Remove Course?</h3>
            <p className="modal-message">Are you sure you want to remove this course?</p>
            <div className="modal-actions">
              <button className="modal-button secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="modal-button primary" onClick={() => { removeCourse(showDeleteConfirm); setShowDeleteConfirm(null); }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      <div className="form-section">
        <h3 className="section-title">Personal Information</h3>
        
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Enter your full name" />
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
          <input type="checkbox" id="hasDualMajor" name="hasDualMajor" checked={formData.hasDualMajor} onChange={handleInputChange} style={{ width: 'auto', cursor: 'pointer' }} />
          <label htmlFor="hasDualMajor" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 'normal' }}>I have a dual major</label>
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
          <input type="checkbox" id="hasDualMinor" name="hasDualMinor" checked={formData.hasDualMinor} onChange={handleInputChange} style={{ width: 'auto', cursor: 'pointer' }} />
          <label htmlFor="hasDualMinor" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 'normal' }}>I have a second minor</label>
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
          <input type="text" name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} className="form-input" placeholder="Scholarship requirements, preferred schedule, etc." />
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
                  <div className="course-details">{course.credits} credits • {course.semester} • Grade: {course.grade}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => editCourse(index)} className="secondary-button" style={{ padding: '6px 12px', margin: 0 }}>Edit</button>
                  <button onClick={() => setShowDeleteConfirm(course.id)} className="remove-button">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {!showAddCourse ? (
          <button onClick={() => setShowAddCourse(true)} className="primary-button" style={{ marginTop: '16px' }}>+ Add Course</button>
        ) : (
          <div className="add-course-section">
            <h4 style={{ marginBottom: '12px', color: '#1f2937' }}>{editingCourse !== null ? 'Edit Course' : 'Add New Course'}</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input type="text" name="code" value={newCourse.code} onChange={handleCourseInputChange} className="form-input" placeholder="e.g., CS 101" />
              </div>
              <div className="form-group">
                <label className="form-label">Course Name</label>
                <input type="text" name="name" value={newCourse.name} onChange={handleCourseInputChange} className="form-input" placeholder="e.g., Intro to Programming" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Credits</label>
                <input type="number" name="credits" value={newCourse.credits} onChange={handleCourseInputChange} className="form-input" placeholder="e.g., 3" />
              </div>
              <div className="form-group">
                <label className="form-label">Semester Taken</label>
                <input type="text" name="semester" value={newCourse.semester} onChange={handleCourseInputChange} className="form-input" placeholder="e.g., Fall 2023" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Grade</label>
              <select name="grade" value={newCourse.grade} onChange={handleCourseInputChange} className="form-select">
                <option value="">Select grade</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="F">F</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={addCourse} className="primary-button">{editingCourse !== null ? 'Update Course' : 'Add Course'}</button>
              <button onClick={cancelEdit} className="secondary-button">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button onClick={handleSave} className={`primary-button ${saved ? 'saved' : ''}`}>{saved ? '✓ Saved!' : 'Save Profile'}</button>
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
        ? profileData.courses.map(c => `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`).join('\n')
        : '  - No courses completed yet';

      const chatHistory = chatMessages.map(msg => `${msg.role === 'user' ? 'Student' : 'Advisor'}: ${msg.text}`).join('\n');

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
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
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

  const handlePrint = () => window.print();

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
          <p className="recommendations-description">Please complete your student profile first so we can provide personalized course recommendations.</p>
          <button onClick={() => onNavigate('profile')} className="primary-button">Go to Profile</button>
        </div>
      ) : !recommendations && !isLoading ? (
        <div className="recommendations-intro">
          <h3 className="recommendations-title">Get AI-Powered Course Recommendations</h3>
          <p className="recommendations-description">Our AI advisor will analyze your academic progress, major requirements, and graduation timeline to recommend the best courses for your next semester. Click the button below to get personalized recommendations.</p>
          <button onClick={onGenerate} className="primary-button">Get Recommendations</button>
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
            <button onClick={onGenerate} className="regenerate-button" disabled={isLoading}>Regenerate</button>
          </div>
          <div className="recommendations-content">
            <ReactMarkdown>{recommendations}</ReactMarkdown>
          </div>

          <div className="export-buttons">
            <button onClick={handlePrint} className="export-button">🖨️ Print</button>
            <button onClick={handleExportText} className="export-button">📄 Download as Text</button>
          </div>

          <div className="chat-container">
            <h4 className="chat-title">Have questions about these recommendations? 💬</h4>
            
            {chatMessages.length > 0 && (
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    <div className="chat-message-label">{msg.role === 'user' ? 'You' : 'AI Advisor'}</div>
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
              <button className="chat-send-button" onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}>
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

  const handlePrint = () => window.print();

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
          <p className="recommendations-description">Please complete your student profile first so we can create a personalized semester roadmap.</p>
          <button onClick={() => onNavigate('profile')} className="primary-button">Go to Profile</button>
        </div>
      ) : !hasRecommendations ? (
        <div className="roadmap-intro">
          <h3 className="recommendations-title">Recommendations Required</h3>
          <p className="recommendations-description">To ensure consistency in your academic plan, please generate your course recommendations first. The roadmap will build upon those recommendations to create a complete semester-by-semester plan.</p>
          <button onClick={() => onNavigate('recommendations')} className="primary-button">Go to Recommendations</button>
        </div>
      ) : !roadmap && !isLoading ? (
        <div className="roadmap-intro">
          <h3 className="recommendations-title">Generate Your Semester Roadmap</h3>
          <p className="recommendations-description">Get a complete semester-by-semester plan from now until graduation. Our AI will create a personalized roadmap showing exactly which courses to take each semester, considering prerequisites, your graduation timeline, and degree requirements.</p>
          <button onClick={onGenerate} className="primary-button">Generate Roadmap</button>
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
            <button onClick={onGenerate} className="regenerate-button" disabled={isLoading}>Regenerate</button>
          </div>
          <div className="recommendations-content">
            <ReactMarkdown>{roadmap}</ReactMarkdown>
          </div>
          
          <div className="export-buttons">
            <button onClick={handlePrint} className="export-button">🖨️ Print</button>
            <button onClick={handleExportText} className="export-button">📄 Download as Text</button>
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

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleNavigation = (page) => {
    if (hasUnsavedChanges && currentPage === 'profile') {
      showToast('Don\'t forget to save your profile changes!', 'info');
    }
    setCurrentPage(page);
  };

  const handleSaveProfile = (profile) => {
    setProfileData(profile);
    setTempProfileData(null);
    setHasUnsavedChanges(false);
  };

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
        ? profileData.courses.map(c => `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`).join('\n')
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
        ? profileData.courses.map(c => `  - ${c.code} - ${c.name} (${c.credits} credits, ${c.semester}, Grade: ${c.grade})`).join('\n')
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
        return <ProfileForm onSaveProfile={handleSaveProfile} existingProfile={tempProfileData || profileData} showToast={showToast} onTempUpdate={handleTempProfileUpdate} />;
      case 'courses':
        return <CourseCatalog profileData={profileData} />;
      case 'recommendations':
        return <Recommendations profileData={profileData} onNavigate={handleNavigation} savedData={savedRecommendations} onSaveData={setSavedRecommendations} onGenerate={generateRecommendations} isLoading={isGeneratingRecommendations} />;
      case 'roadmap':
        return <SemesterRoadmap profileData={profileData} onNavigate={handleNavigation} savedRoadmap={savedRoadmap} onGenerate={generateRoadmap} isLoading={isGeneratingRoadmap} hasRecommendations={!!savedRecommendations} />;
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