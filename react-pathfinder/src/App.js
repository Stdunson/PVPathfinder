import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';
import Select from 'react-select';
import * as aiService from './services/aiService';
import { exportRecommendationsToPDF, exportRoadmapToPDF } from './utils/pdfExport';
import { parseTextTranscript, extractStudentInfo, validateParsedCourses } from './utils/transcriptParser';

const majorOptions = [
  // Engineering
  { value: 'Computer Engineering', label: 'Computer Engineering' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Chemical Engineering', label: 'Chemical Engineering' },
  { value: 'Industrial Engineering', label: 'Industrial Engineering' },
  
  // Architecture & Construction
  { value: 'Architecture', label: 'Architecture' },
  { value: 'Construction Science', label: 'Construction Science' },
  
  // Agriculture & Natural Resources
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Agricultural Economics', label: 'Agricultural Economics' },
  { value: 'Agribusiness', label: 'Agribusiness' },
  { value: 'Animal Science', label: 'Animal Science' },
  { value: 'Plant & Soil Science', label: 'Plant & Soil Science' },
  
  // Business
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Management', label: 'Management' },
  { value: 'Management Information Systems', label: 'Management Information Systems' },
  { value: 'Economics', label: 'Economics' },
  
  // Natural Sciences
  { value: 'Biology', label: 'Biology' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Mathematics', label: 'Mathematics' },
  
  // Health & Human Services
  { value: 'Nursing', label: 'Nursing' },
  { value: 'Health & Human Performance', label: 'Health & Human Performance' },
  { value: 'Kinesiology', label: 'Kinesiology' },
  { value: 'Nutrition & Dietetics', label: 'Nutrition & Dietetics' },
  { value: 'Social Work', label: 'Social Work' },
  
  // Behavioral & Social Sciences
  { value: 'Psychology', label: 'Psychology' },
  { value: 'Sociology', label: 'Sociology' },
  { value: 'Criminal Justice', label: 'Criminal Justice' },
  { value: 'Juvenile Justice', label: 'Juvenile Justice' },
  { value: 'Political Science', label: 'Political Science' },
  
  // Arts & Humanities
  { value: 'English', label: 'English' },
  { value: 'History', label: 'History' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Music', label: 'Music' },
  { value: 'Art', label: 'Art' },
  { value: 'Drama/Theatre', label: 'Drama/Theatre' },
  { value: 'Languages', label: 'Languages' },
  
  // Education
  { value: 'Education', label: 'Education' },
  { value: 'Elementary Education', label: 'Elementary Education' },
  { value: 'Secondary Education', label: 'Secondary Education' },
  { value: 'Special Education', label: 'Special Education' },
  { value: 'Kinesiology Education', label: 'Kinesiology Education' },
  
  // Interdisciplinary
  { value: 'Interdisciplinary Studies', label: 'Interdisciplinary Studies' },
  { value: 'Liberal Studies', label: 'Liberal Studies' },
  { value: 'General Studies', label: 'General Studies' }
];

const minorOptions = [
  // Business & Economics
  { value: 'Business', label: 'Business' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Management', label: 'Management' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Entrepreneurship', label: 'Entrepreneurship' },
  
  // STEM
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Statistics', label: 'Statistics' },
  { value: 'Data Science', label: 'Data Science' },
  
  // Social & Behavioral Sciences
  { value: 'Psychology', label: 'Psychology' },
  { value: 'Sociology', label: 'Sociology' },
  { value: 'Criminal Justice', label: 'Criminal Justice' },
  { value: 'Political Science', label: 'Political Science' },
  { value: 'Anthropology', label: 'Anthropology' },
  { value: 'Social Work', label: 'Social Work' },
  
  // Arts & Humanities
  { value: 'English', label: 'English' },
  { value: 'History', label: 'History' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Philosophy', label: 'Philosophy' },
  { value: 'Art', label: 'Art' },
  { value: 'Music', label: 'Music' },
  { value: 'Theatre', label: 'Theatre' },
  { value: 'Creative Writing', label: 'Creative Writing' },
  
  // Languages
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Chinese', label: 'Chinese' },
  
  // Health & Wellness
  { value: 'Public Health', label: 'Public Health' },
  { value: 'Nutrition', label: 'Nutrition' },
  { value: 'Health Sciences', label: 'Health Sciences' },
  { value: 'Kinesiology', label: 'Kinesiology' },
  
  // Other
  { value: 'Education', label: 'Education' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Environmental Studies', label: 'Environmental Studies' },
  { value: 'Women\'s Studies', label: 'Women\'s Studies' },
  { value: 'African American Studies', label: 'African American Studies' },
  { value: 'Leadership', label: 'Leadership' },
  { value: 'Interdisciplinary Studies', label: 'Interdisciplinary Studies' }
];

const concentrationOptions = [
  // Computer Science concentrations
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Web Development', label: 'Web Development' },
  { value: 'Mobile Development', label: 'Mobile Development' },
  { value: 'Game Development', label: 'Game Development' },
  { value: 'Database Systems', label: 'Database Systems' },
  { value: 'Computer Networks', label: 'Computer Networks' },
  { value: 'Cloud Computing', label: 'Cloud Computing' },
  
  // Engineering concentrations
  { value: 'Robotics', label: 'Robotics' },
  { value: 'Power Systems', label: 'Power Systems' },
  { value: 'Structural Engineering', label: 'Structural Engineering' },
  { value: 'Environmental Engineering', label: 'Environmental Engineering' },
  { value: 'Aerospace', label: 'Aerospace' },
  { value: 'Biomedical Engineering', label: 'Biomedical Engineering' },
  { value: 'Systems Engineering', label: 'Systems Engineering' },
  
  // Business concentrations
  { value: 'Digital Marketing', label: 'Digital Marketing' },
  { value: 'International Business', label: 'International Business' },
  { value: 'Entrepreneurship', label: 'Entrepreneurship' },
  { value: 'Supply Chain Management', label: 'Supply Chain Management' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Financial Analysis', label: 'Financial Analysis' },
  { value: 'Investment Management', label: 'Investment Management' },
  
  // Science concentrations
  { value: 'Biochemistry', label: 'Biochemistry' },
  { value: 'Molecular Biology', label: 'Molecular Biology' },
  { value: 'Genetics', label: 'Genetics' },
  { value: 'Microbiology', label: 'Microbiology' },
  { value: 'Organic Chemistry', label: 'Organic Chemistry' },
  { value: 'Theoretical Physics', label: 'Theoretical Physics' },
  { value: 'Applied Mathematics', label: 'Applied Mathematics' },
  { value: 'Statistics', label: 'Statistics' },
  
  // Psychology concentrations
  { value: 'Clinical Psychology', label: 'Clinical Psychology' },
  { value: 'Counseling Psychology', label: 'Counseling Psychology' },
  { value: 'Industrial-Organizational Psychology', label: 'Industrial-Organizational Psychology' },
  { value: 'Developmental Psychology', label: 'Developmental Psychology' },
  
  // Healthcare concentrations
  { value: 'Pediatric Nursing', label: 'Pediatric Nursing' },
  { value: 'Critical Care Nursing', label: 'Critical Care Nursing' },
  { value: 'Psychiatric Nursing', label: 'Psychiatric Nursing' },
  { value: 'Public Health', label: 'Public Health' },
  
  // Other common concentrations
  { value: 'Project Management', label: 'Project Management' },
  { value: 'Quality Assurance', label: 'Quality Assurance' },
  { value: 'Research', label: 'Research' },
  { value: 'Education Technology', label: 'Education Technology' }
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

const semesterOptions = [
  { value: 'Spring 2020', label: 'Spring 2020' },
  { value: 'Summer 2020', label: 'Summer 2020' },
  { value: 'Fall 2020', label: 'Fall 2020' },
  { value: 'Spring 2021', label: 'Spring 2021' },
  { value: 'Summer 2021', label: 'Summer 2021' },
  { value: 'Fall 2021', label: 'Fall 2021' },
  { value: 'Spring 2022', label: 'Spring 2022' },
  { value: 'Summer 2022', label: 'Summer 2022' },
  { value: 'Fall 2022', label: 'Fall 2022' },
  { value: 'Spring 2023', label: 'Spring 2023' },
  { value: 'Summer 2023', label: 'Summer 2023' },
  { value: 'Fall 2023', label: 'Fall 2023' },
  { value: 'Spring 2024', label: 'Spring 2024' },
  { value: 'Summer 2024', label: 'Summer 2024' },
  { value: 'Fall 2024', label: 'Fall 2024' },
  { value: 'Spring 2025', label: 'Spring 2025' }
];

const gradeOptions = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'F', label: 'F' }
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
  const totalCreditsNeeded = profileData?.creditsRequired || 120;
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

function CourseCatalog({ profileData, courseCatalog, isLoadingCourses }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const departments = ['All', ...new Set(courseCatalog.map(course => course.department))].sort();
  const degreeLevels = ['All', "Bachelor's", "Master's", "Doctoral", "Executive Master's"];

  const filteredCourses = courseCatalog.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || course.department === selectedDepartment;
    const matchesLevel = selectedLevel === 'All' || course.degreeLevel === selectedLevel;
    
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const checkPrerequisites = (course) => {
    if (!profileData?.courses || !course.prerequisites || course.prerequisites === 'None') return true;
    
    const completedCodes = profileData.courses.map(c => c.code.toUpperCase().trim());
    const prereqText = course.prerequisites.toUpperCase();
    
    return completedCodes.some(code => prereqText.includes(code)) || prereqText === 'NONE';
  };

  if (isLoadingCourses) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="paw"></div>
          <div className="paw"></div>
          <div className="paw"></div>
          <div className="paw"></div>
        </div>
        <p className="loading-text">Loading PVAMU course catalog...</p>
      </div>
    );
  }

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h3 className="catalog-title">PVAMU Course Catalog</h3>
        <p className="catalog-description">
          Browse Prairie View A&M University's complete course catalog with {courseCatalog.length.toLocaleString()}+ courses. Search by course code or name, and filter by department or degree level.
        </p>
      </div>

      <div className="catalog-filters">
        <div className="filter-group">
          <label className="filter-label">Search Courses:</label>
          <input
            type="text"
            className="catalog-search"
            placeholder="Search by course code or name (e.g., COMP 1336, Calculus)..."
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
          <label className="filter-label">Degree Level:</label>
          <select 
            className="catalog-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {degreeLevels.map(level => (
              <option key={level} value={level}>{level}</option>
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
                  <div className="course-card-credits">{course.credits} {course.credits === 1 ? 'Credit' : 'Credits'}</div>
                </div>

                <p className="course-card-description">{course.description}</p>

                <div className="course-card-footer">
                  <div className="course-card-meta">
                    <span className="course-meta-item">
                      <strong>Department:</strong> {course.department}
                    </span>
                    <span className="course-meta-item">
                      <strong>Level:</strong> {course.degreeLevel}
                    </span>
                    <span className="course-meta-item">
                      <strong>Prerequisites:</strong> {course.prerequisites || 'None'}
                    </span>
                    {course.coRequisites && course.coRequisites !== 'None' && (
                      <span className="course-meta-item">
                        <strong>Co-requisites:</strong> {course.coRequisites}
                      </span>
                    )}
                  </div>

                  {profileData && !hasPrereqs && course.prerequisites && course.prerequisites !== 'None' && (
                    <div className="prereq-warning">
                      ⚠️ Prerequisites may not be met
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

function ProfileForm({ onSaveProfile, existingProfile, showToast, onTempUpdate, courseCatalog, onClearAllData }) {
  const [formData, setFormData] = useState({
    name: existingProfile?.name || '',
    major: existingProfile?.major || '',
    major2: existingProfile?.major2 || '',
    minor: existingProfile?.minor || '',
    minor2: existingProfile?.minor2 || '',
    concentration: existingProfile?.concentration || '',
    hasDualMajor: existingProfile?.hasDualMajor || false,
    hasDualMinor: existingProfile?.hasDualMinor || false,
    expectedGraduation: existingProfile?.expectedGraduation || '',
    creditsRequired: existingProfile?.creditsRequired || 120,
    additionalNotes: existingProfile?.additionalNotes || ''
  });

  const [courses, setCourses] = useState(existingProfile?.courses || []);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({ code: '', name: '', credits: '', semester: '', grade: '' });
  const [selectedCourseOption, setSelectedCourseOption] = useState(null);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [initialData, setInitialData] = useState(null);
  
  // Transcript import states
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showTextImport, setShowTextImport] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [parsedCourses, setParsedCourses] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isParsingTranscript, setIsParsingTranscript] = useState(false);
  const [parsedStudentInfo, setParsedStudentInfo] = useState(null);

  React.useEffect(() => {
    if (!initialData && existingProfile) {
      setInitialData({
        formData: {
          name: existingProfile.name || '',
          major: existingProfile.major || '',
          major2: existingProfile.major2 || '',
          minor: existingProfile.minor || '',
          minor2: existingProfile.minor2 || '',
          concentration: existingProfile.concentration || '',
          hasDualMajor: existingProfile.hasDualMajor || false,
          hasDualMinor: existingProfile.hasDualMinor || false,
          expectedGraduation: existingProfile.expectedGraduation || '',
          creditsRequired: existingProfile.creditsRequired || 120,
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

  // Format courses for React-Select autocomplete
  const courseOptions = courseCatalog
    .filter(course => course.degreeLevel === "Bachelor's") // Only show bachelor's courses
    .map(course => ({
      value: course.id,
      label: `${course.code} - ${course.name} (${course.credits} credits)`,
      courseData: {
        code: course.code,
        name: course.name,
        credits: course.credits
      }
    }));

  // Handle course selection from autocomplete
  const handleCourseSelect = (selectedOption) => {
    if (selectedOption) {
      setSelectedCourseOption(selectedOption);
      setNewCourse(prev => ({
        ...prev,
        code: selectedOption.courseData.code,
        name: selectedOption.courseData.name,
        credits: selectedOption.courseData.credits.toString()
      }));
    } else {
      setSelectedCourseOption(null);
      setNewCourse(prev => ({
        ...prev,
        code: '',
        name: '',
        credits: ''
      }));
    }
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
      setSelectedCourseOption(null);
      setShowAddCourse(false);
    }
  };

  const editCourse = (index) => {
    const course = courses[index];
    setNewCourse({ code: course.code, name: course.name, credits: course.credits, semester: course.semester, grade: course.grade });
    setSelectedCourseOption(null); // Clear autocomplete when editing
    setEditingCourse(index);
    setShowAddCourse(true);
  };

  const cancelEdit = () => {
    setNewCourse({ code: '', name: '', credits: '', semester: '', grade: '' });
    setSelectedCourseOption(null);
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

  // Transcript import handlers

  const handleTextParse = () => {
    if (!transcriptText.trim()) {
      showToast('Please paste your transcript text', 'error');
      return;
    }

    setIsParsingTranscript(true);
    
    try {
      const courses = parseTextTranscript(transcriptText);
      const validCourses = validateParsedCourses(courses);
      
      if (validCourses.length === 0) {
        showToast('No valid courses found. Please check the format.', 'error');
        setIsParsingTranscript(false);
        return;
      }
      
      setParsedCourses(validCourses);
      
      // Extract student info
      const studentInfo = extractStudentInfo(transcriptText);
      setParsedStudentInfo(studentInfo);
      
      setShowPreview(true);
      setShowTextImport(false);
      showToast(`Found ${validCourses.length} courses!`, 'success');
    } catch (error) {
      console.error('Error parsing text:', error);
      showToast('Failed to parse transcript text', 'error');
    } finally {
      setIsParsingTranscript(false);
    }
  };

  const handleImportCourses = () => {
    setCourses(prev => [...prev, ...parsedCourses]);
    
    // Apply parsed student info if available
    if (parsedStudentInfo) {
      setFormData(prev => ({
        ...prev,
        ...(parsedStudentInfo.name && !prev.name && { name: parsedStudentInfo.name }),
        ...(parsedStudentInfo.major && !prev.major && { major: parsedStudentInfo.major }),
        ...(parsedStudentInfo.concentration && !prev.concentration && { concentration: parsedStudentInfo.concentration }),
        ...(parsedStudentInfo.expectedGraduation && !prev.expectedGraduation && { expectedGraduation: parsedStudentInfo.expectedGraduation })
      }));
    }
    
    setShowPreview(false);
    setParsedCourses([]);
    setParsedStudentInfo(null);
    setTranscriptText('');
    showToast(`Successfully imported ${parsedCourses.length} courses! Please review and adjust the auto-filled information.`, 'success');
  };

  const cancelImport = () => {
    setShowPreview(false);
    setShowTextImport(false);
    setShowImportOptions(false);
    setParsedCourses([]);
    setParsedStudentInfo(null);
    setTranscriptText('');
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
          <label className="form-label">Concentration (Optional)</label>
          <Select
            name="concentration"
            value={concentrationOptions.find(option => option.value === formData.concentration) || null}
            onChange={(option) => handleSelectChange('concentration', option)}
            options={concentrationOptions}
            placeholder="Search or select your concentration..."
            isClearable
            isSearchable
          />
        </div>

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
          <label className="form-label">Total Credits Required for Degree</label>
          <input 
            type="number" 
            name="creditsRequired" 
            value={formData.creditsRequired} 
            onChange={handleInputChange} 
            className="form-input" 
            placeholder="120"
            min="60"
            max="200"
          />
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Most bachelor's degrees require 120 credits. Some engineering programs may require 126-130 credits. Check your degree plan.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <input type="text" name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} className="form-input" placeholder="Scholarship requirements, preferred schedule, etc." />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Completed Courses</h3>
        
        {/* Import Transcript Button */}
        {!showImportOptions && (
          <button 
            onClick={() => setShowImportOptions(true)} 
            className="secondary-button" 
            style={{ marginBottom: '16px' }}
          >
            📄 Import Transcript
          </button>
        )}

        {/* Import Options */}
        {showImportOptions && (
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ marginBottom: '16px', color: '#1f2937' }}>Import Transcript</h4>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Copy all text from your PVAMU transcript PDF and paste it below. The system will automatically extract your courses, grades, and student information.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <button 
                onClick={() => setShowTextImport(!showTextImport)} 
                className="primary-button"
              >
                📋 {showTextImport ? 'Hide' : 'Paste Transcript Text'}
              </button>
              
              <button 
                onClick={cancelImport} 
                className="secondary-button"
              >
                Cancel
              </button>
            </div>

            {isParsingTranscript && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                <div style={{ fontSize: '14px' }}>Parsing transcript...</div>
              </div>
            )}

            {showTextImport && !isParsingTranscript && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ 
                  backgroundColor: '#fef3c7', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  marginBottom: '12px',
                  fontSize: '13px',
                  color: '#92400e'
                }}>
                  <strong>📋 How to copy text from your PDF:</strong>
                  <ol style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
                    <li>Open your PVAMU transcript PDF</li>
                    <li>Press Ctrl+A (or Cmd+A on Mac) to select all text</li>
                    <li>Press Ctrl+C (or Cmd+C) to copy</li>
                    <li>Paste below with Ctrl+V (or Cmd+V)</li>
                  </ol>
                </div>
                <label className="form-label">Paste Transcript Text</label>
                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  className="form-input"
                  rows="10"
                  placeholder="Paste your transcript text here..."
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
                <button 
                  onClick={handleTextParse} 
                  className="primary-button" 
                  style={{ marginTop: '12px' }}
                  disabled={!transcriptText.trim()}
                >
                  Parse Text
                </button>
              </div>
            )}
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="modal-overlay" onClick={cancelImport}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '80vh', overflow: 'auto' }}>
              <h3 className="modal-title">Preview Imported Courses</h3>
              
              {parsedStudentInfo && (parsedStudentInfo.name || parsedStudentInfo.major || parsedStudentInfo.expectedGraduation) && (
                <div style={{ 
                  backgroundColor: '#f0fdf4', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  marginBottom: '16px',
                  border: '1px solid #86efac'
                }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
                    Found Student Information:
                  </p>
                  {parsedStudentInfo.name && (
                    <p style={{ fontSize: '13px', color: '#166534' }}>Name: {parsedStudentInfo.name}</p>
                  )}
                  {parsedStudentInfo.major && (
                    <p style={{ fontSize: '13px', color: '#166534' }}>Major: {parsedStudentInfo.major}</p>
                  )}
                  {parsedStudentInfo.concentration && (
                    <p style={{ fontSize: '13px', color: '#166534' }}>Concentration: {parsedStudentInfo.concentration}</p>
                  )}
                  {parsedStudentInfo.expectedGraduation && (
                    <p style={{ fontSize: '13px', color: '#166534' }}>Graduation: {parsedStudentInfo.expectedGraduation}</p>
                  )}
                </div>
              )}

              <p className="modal-message">
                Found <strong>{parsedCourses.length} courses</strong>. Review and confirm to import them.
              </p>
              
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px', 
                padding: '12px',
                marginBottom: '20px',
                backgroundColor: '#f9fafb'
              }}>
                {parsedCourses.map((course, index) => (
                  <div key={index} style={{ 
                    padding: '8px', 
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '13px'
                  }}>
                    <strong>{course.code}</strong> - {course.name} ({course.credits} cr, {course.semester}, Grade: {course.grade})
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button className="modal-button secondary" onClick={cancelImport}>Cancel</button>
                <button className="modal-button primary" style={{ backgroundColor: '#4f2d7f' }} onClick={handleImportCourses}>
                  Import {parsedCourses.length} Courses
                </button>
              </div>
            </div>
          </div>
        )}
        
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
            
            {editingCourse === null && (
              <div className="form-group">
                <label className="form-label">Search for Course</label>
                <Select
                  value={selectedCourseOption}
                  onChange={handleCourseSelect}
                  options={courseOptions}
                  placeholder="Type to search (e.g., COMP 1336, Calculus, Biology)..."
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No courses found"}
                />
              </div>
            )}

            {editingCourse !== null && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course Code</label>
                  <input type="text" name="code" value={newCourse.code} onChange={handleCourseInputChange} className="form-input" placeholder="e.g., COMP 1336" />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Name</label>
                  <input type="text" name="name" value={newCourse.name} onChange={handleCourseInputChange} className="form-input" placeholder="e.g., Computer Science I" />
                </div>
              </div>
            )}

            {selectedCourseOption && editingCourse === null && (
              <div style={{ 
                backgroundColor: '#f0fdf4', 
                border: '1px solid #86efac', 
                borderRadius: '6px', 
                padding: '12px', 
                marginBottom: '16px' 
              }}>
                <p style={{ fontSize: '14px', color: '#166534', fontWeight: '600', marginBottom: '4px' }}>
                  ✓ Course Selected:
                </p>
                <p style={{ fontSize: '14px', color: '#166534' }}>
                  <strong>{newCourse.code}</strong> - {newCourse.name} ({newCourse.credits} credits)
                </p>
              </div>
            )}

            {editingCourse !== null && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input type="number" name="credits" value={newCourse.credits} onChange={handleCourseInputChange} className="form-input" placeholder="e.g., 3" />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Semester Taken</label>
              <Select
                name="semester"
                value={semesterOptions.find(option => option.value === newCourse.semester) || null}
                onChange={(option) => setNewCourse(prev => ({ ...prev, semester: option ? option.value : '' }))}
                options={semesterOptions}
                placeholder="Select semester..."
                isClearable
                isSearchable
              />
            </div>
            
            
            <div className="form-group">
              <label className="form-label">Grade</label>
              <Select
                name="grade"
                value={gradeOptions.find(option => option.value === newCourse.grade) || null}
                onChange={(option) => setNewCourse(prev => ({ ...prev, grade: option ? option.value : '' }))}
                options={gradeOptions}
                placeholder="Select grade..."
                isClearable
                isSearchable
              />
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

      {/* Clear All Data Section */}
      <div className="clear-data-section">
        <h3 className="clear-data-title">⚠️ Danger Zone</h3>
        <p className="clear-data-description">
          Clear all your data and start over. This will permanently delete your profile, courses, recommendations, and roadmap. This action cannot be undone.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Are you absolutely sure you want to delete ALL your data? This includes your profile, all courses, recommendations, and roadmap. This action CANNOT be undone!')) {
              onClearAllData();
            }
          }}
          className="danger-button"
        >
          🗑️ Clear All Data
        </button>
      </div>
    </div>
  );
}

function Recommendations({ profileData, onNavigate, savedData, onSaveData, onGenerate, isLoading, showToast }) {
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
    const newUserMessage = { role: 'user', text: userMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatLoading(true);

    try {
      const text = await aiService.chatWithAdvisor(
        profileData,
        chatMessages,
        userMessage,
        recommendations
      );

      const updatedMessages = [...chatMessages, newUserMessage, { role: 'ai', text }];
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

  const handleExportPDF = () => {
    exportRecommendationsToPDF(recommendations, profileData);
    showToast('PDF downloaded successfully!', 'success');
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
            <button onClick={handleExportPDF} className="export-button">📄 Export PDF</button>
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

  const handleExportPDF = () => {
    exportRoadmapToPDF(roadmap, profileData);
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
            <button onClick={handleExportPDF} className="export-button">📄 Export PDF</button>
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
  const [courseCatalog, setCourseCatalog] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const pageTitle = navItems.find(item => item.id === currentPage)?.label || 'Dashboard';

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('pv_pathfinder_profile');
      const savedRecs = localStorage.getItem('pv_pathfinder_recommendations');
      const savedRoad = localStorage.getItem('pv_pathfinder_roadmap');
      
      if (savedProfile) {
        setProfileData(JSON.parse(savedProfile));
      }
      if (savedRecs) {
        setSavedRecommendations(JSON.parse(savedRecs));
      }
      if (savedRoad) {
        setSavedRoadmap(JSON.parse(savedRoad));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profileData) {
      try {
        localStorage.setItem('pv_pathfinder_profile', JSON.stringify(profileData));
      } catch (error) {
        console.error('Error saving profile to localStorage:', error);
        showToast('Failed to save profile locally', 'error');
      }
    }
  }, [profileData]);

  // Save recommendations to localStorage whenever they change
  useEffect(() => {
    if (savedRecommendations) {
      try {
        localStorage.setItem('pv_pathfinder_recommendations', JSON.stringify(savedRecommendations));
      } catch (error) {
        console.error('Error saving recommendations to localStorage:', error);
      }
    }
  }, [savedRecommendations]);

  // Save roadmap to localStorage whenever it changes
  useEffect(() => {
    if (savedRoadmap) {
      try {
        localStorage.setItem('pv_pathfinder_roadmap', JSON.stringify(savedRoadmap));
      } catch (error) {
        console.error('Error saving roadmap to localStorage:', error);
      }
    }
  }, [savedRoadmap]);

  useEffect(() => {
    fetch('/pvamu_courses.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load courses');
        return res.json();
      })
      .then(data => {
        const transformedData = data.map(course => {
          const departmentCode = course.course_code.split(' ')[0];
          const departmentNames = {
            'ACCT': 'Accounting', 'AFAM': 'African American Studies', 'AGRI': 'Agriculture',
            'AGRO': 'Agronomy', 'ANSC': 'Animal Science', 'ARAB': 'Arabic', 'ARCH': 'Architecture',
            'ARMY': 'Army ROTC', 'ARTS': 'Arts', 'BIOL': 'Biology', 'BLAW': 'Business Law',
            'BCOM': 'Business Communication', 'CHEG': 'Chemical Engineering', 'CHEM': 'Chemistry',
            'CHIN': 'Chinese', 'CINS': 'Computer Information Systems', 'CODE': 'Community Development',
            'COMM': 'Communication', 'COMP': 'Computer Science', 'CONS': 'Construction Science',
            'CNSL': 'Counseling', 'CPSY': 'Clinical Psychology', 'CPET': 'Computer Engineering Technology',
            'CRIJ': 'Criminal Justice', 'CURR': 'Curriculum', 'CUIN': 'Curriculum and Instruction',
            'CVEG': 'Civil Engineering', 'DANC': 'Dance', 'DGMA': 'Digital Media Arts', 'DRAM': 'Drama',
            'ECON': 'Economics', 'EDBA': 'Executive Doctor of Business Administration',
            'ADMN': 'Educational Administration', 'EDUL': 'Educational Leadership',
            'EDFN': 'Educational Foundations', 'EDTC': 'Educational Technology',
            'ELEG': 'Electrical Engineering', 'ELET': 'Electrical Engineering Technology',
            'EMGM': 'Executive Management', 'EMIS': 'Executive MIS', 'EMCO': 'Executive Communication',
            'EMRK': 'Executive Marketing', 'ENGL': 'English', 'ENTR': 'Entrepreneurship',
            'ESPT': 'eSports', 'FDSC': 'Food Science', 'FINA': 'Finance', 'EFIN': 'Executive Finance',
            'FLLT': 'Foreign Languages', 'FREN': 'French', 'GNEG': 'General Engineering',
            'GNST': 'General Studies', 'GEOG': 'Geography', 'HKIN': 'Health and Kinesiology',
            'HLTH': 'Health', 'HIST': 'History', 'HCOL': 'Honors College',
            'HDFM': 'Human Development and Family Studies', 'HUMA': 'Humanities',
            'HUNF': 'Human Nutrition and Foods', 'HUSC': 'Human Sciences',
            'JPSY': 'Juvenile Psychology', 'JJUS': 'Juvenile Justice', 'KINE': 'Kinesiology',
            'MATH': 'Mathematics', 'MCEG': 'Mechanical Engineering', 'MGMT': 'Management',
            'MRKT': 'Marketing', 'MISY': 'Management Information Systems', 'MUSC': 'Music',
            'NAVY': 'Navy ROTC', 'NRES': 'Natural Resources', 'NURS': 'Nursing', 'NUTR': 'Nutrition',
            'PHIL': 'Philosophy', 'PHED': 'Physical Education', 'PHSC': 'Physical Science',
            'PHYS': 'Physics', 'PHLT': 'Public Health', 'POSC': 'Political Science',
            'PSYC': 'Psychology', 'PVEX': 'Prairie View Experience', 'RDNG': 'Reading',
            'REST': 'Real Estate', 'SOCG': 'Sociology', 'SOWK': 'Social Work', 'SPAN': 'Spanish',
            'SPED': 'Special Education', 'SPMT': 'Sport Management', 'SCMG': 'Supply Chain Management',
            'SUPV': 'Supervision', 'AFSC': 'Air Force ROTC'
          };
          
          return {
            id: course.id,
            code: course.course_code,
            name: course.title,
            credits: parseInt(course.credit_hours) || 0,
            department: departmentNames[departmentCode] || departmentCode,
            description: course.title,
            prerequisites: course.prerequisites === 'NULL' ? 'None' : course.prerequisites,
            degreeLevel: course.degree_level,
            coRequisites: course.co_requisites === 'NULL' ? 'None' : course.co_requisites
          };
        });
        
        setCourseCatalog(transformedData);
        setIsLoadingCourses(false);
      })
      .catch(err => {
        console.error('Error loading courses:', err);
        showToast('Failed to load course catalog. Please refresh the page.', 'error');
        setIsLoadingCourses(false);
      });
  }, []);

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

  const handleClearAllData = () => {
    // Clear all state
    setProfileData(null);
    setTempProfileData(null);
    setSavedRecommendations(null);
    setSavedRoadmap(null);
    setHasUnsavedChanges(false);
    
    // Clear localStorage
    localStorage.removeItem('pv_pathfinder_profile');
    localStorage.removeItem('pv_pathfinder_recommendations');
    localStorage.removeItem('pv_pathfinder_roadmap');
    
    // Navigate to dashboard
    setCurrentPage('dashboard');
    
    // Show success message
    showToast('All data cleared successfully. Starting fresh!', 'success');
  };

  const generateRecommendations = async () => {
    if (!profileData) return;
    
    setIsGeneratingRecommendations(true);

    try {
      const text = await aiService.generateRecommendations(profileData, courseCatalog);
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
      const text = await aiService.generateRoadmap(
        profileData, 
        courseCatalog, 
        savedRecommendations?.recommendations
      );
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
        return <ProfileForm onSaveProfile={handleSaveProfile} existingProfile={tempProfileData || profileData} showToast={showToast} onTempUpdate={handleTempProfileUpdate} courseCatalog={courseCatalog} onClearAllData={handleClearAllData} />;
      case 'courses':
        return <CourseCatalog profileData={profileData} courseCatalog={courseCatalog} isLoadingCourses={isLoadingCourses} />;
      case 'recommendations':
        return <Recommendations profileData={profileData} onNavigate={handleNavigation} savedData={savedRecommendations} onSaveData={setSavedRecommendations} onGenerate={generateRecommendations} isLoading={isGeneratingRecommendations} showToast={showToast} />;
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