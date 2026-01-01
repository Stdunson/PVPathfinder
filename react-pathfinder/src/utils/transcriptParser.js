import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Check if a semester is completed (in the past)
 */
const isSemesterCompleted = (semesterString) => {
  if (!semesterString) return false;
  
  // Parse semester string like "Fall 2024" or "Spring 2025"
  const match = semesterString.match(/(Fall|Spring|Summer)\s+(\d{4})/i);
  if (!match) return false;
  
  const season = match[1];
  const year = parseInt(match[2]);
  const now = new Date();
  
  // Semester end dates (approximate)
  const semesterEndDates = {
    'Spring': { month: 5, day: 15 },   // Mid-May
    'Summer': { month: 8, day: 15 },   // Mid-August
    'Fall': { month: 12, day: 20 }     // Mid-December
  };
  
  const endDate = semesterEndDates[season];
  if (!endDate) return false;
  
  // Create a date for when this semester would end
  const semesterEndDate = new Date(year, endDate.month - 1, endDate.day);
  
  // Semester is completed if its end date is in the past
  return semesterEndDate < now;
};

/**
 * Check if a grade indicates an incomplete/in-progress course
 */
const isIncompleteGrade = (grade) => {
  if (!grade) return true;
  
  const incompleteGrades = ['I', 'IP', 'W', 'WP', 'WF', 'AU', 'P', 'S', 'U', 'NG'];
  return incompleteGrades.includes(grade.toUpperCase());
};

/**
 * Parse PVAMU transcript text
 * Handles format where course info spans multiple lines:
 * Line 1: COMP     1121      UG      Computer Science Lab I               A       1.000          4.00
 * OR multi-line:
 * Line 1: COMP     1336      UG      Computer Science I
 * Line 2: A       3.000          12.00
 */
export const parseTranscriptText = (text) => {
  console.log('=== TRANSCRIPT PARSER ===');
  const courses = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const termPattern = /Term\s*:?\s*(Fall|Spring|Summer)\s+(\d{4})/i;
  // Match course code at start of line
  const coursePattern = /^([A-Z]{4})\s+(\d{4})/;
  // Match grade anywhere in the line: letter grade followed by numbers
  const gradeInLinePattern = /\b([A-DF][+-]?|[IWPSU])\s+(\d+)\.?\d*/;
  
  let currentSemester = '';
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Check for semester
    const termMatch = line.match(termPattern);
    if (termMatch) {
      currentSemester = `${termMatch[1]} ${termMatch[2]}`;
      console.log('✓ Semester:', currentSemester);
      i++;
      continue;
    }
    
    // Check for course code
    const courseMatch = line.match(coursePattern);
    if (courseMatch && currentSemester) {
      const dept = courseMatch[1];
      const num = courseMatch[2];
      const code = `${dept} ${num}`;
      
      // Extract everything after the course number
      const restOfLine = line.substring(line.indexOf(num) + num.length).trim();
      
      // Try to find grade in the same line
      const gradeMatch = restOfLine.match(gradeInLinePattern);
      
      let courseName = '';
      let grade = 'A';
      let credits = '3';
      
      if (gradeMatch) {
        // Grade is on the same line
        grade = gradeMatch[1];
        credits = Math.floor(parseFloat(gradeMatch[2])).toString();
        
        // Course name is everything before the grade
        const nameEndIndex = restOfLine.indexOf(gradeMatch[0]);
        courseName = restOfLine.substring(0, nameEndIndex).trim();
        
        // Remove "UG" or level indicator
        courseName = courseName.replace(/^(UG|GR|DR)\s+/, '');
      } else {
        // Grade is probably on next line
        courseName = restOfLine.replace(/^(UG|GR|DR)\s+/, '');
        
        // Look at next few lines for grade
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const nextLine = lines[j];
          
          // Stop if we hit another course or semester
          if (coursePattern.test(nextLine) || termPattern.test(nextLine)) {
            break;
          }
          
          const nextGradeMatch = nextLine.match(gradeInLinePattern);
          if (nextGradeMatch) {
            grade = nextGradeMatch[1];
            credits = Math.floor(parseFloat(nextGradeMatch[2])).toString();
            break;
          } else if (!nextLine.includes('Term Totals') && !nextLine.includes('Academic Standing')) {
            // This line might be continuation of course name
            courseName += ' ' + nextLine;
          }
        }
      }
      
      // Clean up course name
      courseName = courseName.replace(/\s+/g, ' ').trim();
      
      // Validate and add - ONLY add completed courses
      const creditsNum = parseInt(credits);
      const semesterCompleted = isSemesterCompleted(currentSemester);
      const gradeComplete = !isIncompleteGrade(grade);
      
      if (code && creditsNum > 0 && creditsNum <= 6) {
        // Check if course is completed
        if (!semesterCompleted) {
          console.log(`⏭️  SKIPPED (future/current): ${code} - ${currentSemester}`);
        } else if (!gradeComplete) {
          console.log(`⏭️  SKIPPED (incomplete grade ${grade}): ${code}`);
        } else {
          // Course is completed - add it!
          courses.push({
            id: Date.now() + courses.length + Math.random(),
            code: code,
            name: courseName || code,
            credits: credits,
            semester: currentSemester,
            grade: grade
          });
          console.log(`✓ ${code} - ${courseName} (${credits} cr, ${grade})`);
        }
      }
    }
    
    i++;
  }
  
  console.log(`\nTotal: ${courses.length} courses`);
  console.log('=== END PARSER ===');
  return courses;
};

/**
 * Parse PDF transcript
 */
export const parsePDFTranscript = async (file) => {
  try {
    console.log('Loading PDF...');
    const arrayBuffer = await file.arrayBuffer();
    
    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch (pdfError) {
      console.error('PDF error:', pdfError);
      throw new Error('⚠️ Unable to read this PDF. It may be corrupted or password-protected.\n\n💡 Solution: Use "Paste Text" instead!\n1. Open your PDF\n2. Press Ctrl+A (select all)\n3. Press Ctrl+C (copy)\n4. Click "Paste Text" and paste with Ctrl+V');
    }
    
    console.log(`PDF loaded: ${pdf.numPages} pages`);
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Sort items by Y position (top to bottom)
      const sortedItems = textContent.items.sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 3) return yDiff;
        return a.transform[4] - b.transform[4];
      });
      
      let lastY = null;
      for (let itemIdx = 0; itemIdx < sortedItems.length; itemIdx++) {
        const item = sortedItems[itemIdx];
        const y = item.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 3) {
          fullText += '\n';
        }
        fullText += item.str + ' ';
        lastY = y;
      }
      
      fullText += '\n';
    }
    
    console.log(`Extracted ${fullText.length} characters`);
    
    if (fullText.length < 50) {
      throw new Error('⚠️ No text found in PDF. The PDF may be scanned/image-based.\n\n💡 Solution: Use "Paste Text" instead - it works much better!');
    }
    
    return parseTranscriptText(fullText);
  } catch (error) {
    console.error('PDF error:', error);
    
    if (error.message.includes('💡') || error.message.includes('Paste Text')) {
      throw error;
    } else {
      throw new Error('⚠️ PDF parsing failed.\n\n💡 Recommended: Use "Paste Text" option!\n1. Open PDF in viewer\n2. Select all text (Ctrl+A)\n3. Copy (Ctrl+C)\n4. Paste here (Ctrl+V)\n\nThis method is more reliable than PDF upload!');
    }
  }
};

/**
 * Parse plain text transcript
 */
export const parseTextTranscript = (text) => {
  return parseTranscriptText(text);
};

/**
 * Extract student information
 */
export const extractStudentInfo = (text) => {
  const info = { name: '', major: '', concentration: '', expectedGraduation: '' };
  
  console.log('=== EXTRACTING STUDENT INFO ===');
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('Total lines:', lines.length);
  
  // === NAME EXTRACTION ===
  // Try multiple methods to handle different transcript formats
  
  // Method 1: Find line with "Name" header, then get next line and split by spaces
  let nameFound = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If this line contains "Name" (but not as part of a person's name)
    if (/^Name\s|^Name$/i.test(line)) {
      console.log('Found Name header at line', i, ':', line);
      
      // Next line should have the actual name
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        console.log('Next line:', nextLine);
        
        // Split by 3+ spaces to get just the name part
        const parts = nextLine.split(/\s{3,}/);
        console.log('Split parts:', parts);
        
        const potentialName = parts[0].trim();
        
        // Validate it looks like a name (starts with capital letter)
        if (potentialName && /^[A-Z][a-z]/.test(potentialName)) {
          info.name = potentialName;
          console.log('✓ Method 1 SUCCESS - Name:', potentialName);
          nameFound = true;
          break;
        } else {
          console.log('✗ Method 1 failed validation');
        }
      }
    }
  }
  
  // Method 2: Look for "Name" followed by the name on same or next line
  if (!nameFound) {
    console.log('Trying Method 2: Regex pattern...');
    const namePattern = /Name\s*:?\s*\n?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,5})(?=\s{3,}|Student|Continuing|Type|\n|$)/im;
    const match = text.match(namePattern);
    if (match && match[1]) {
      info.name = match[1].trim();
      console.log('✓ Method 2 SUCCESS - Name:', info.name);
      nameFound = true;
    } else {
      console.log('✗ Method 2 failed');
    }
  }
  
  // Method 3: Last resort - find any line that looks like a full name
  if (!nameFound) {
    console.log('Trying Method 3: Looking for name-like lines...');
    for (const line of lines) {
      // Skip header lines
      if (/Name|Student|Type|Program|Major|Term|INFORMATION/i.test(line)) continue;
      
      // Look for line with 2-4 capitalized words (typical name format)
      const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s/);
      if (nameMatch) {
        info.name = nameMatch[1].trim();
        console.log('✓ Method 3 SUCCESS - Name:', info.name);
        break;
      }
    }
  }
  
  if (!nameFound) {
    console.log('⚠️ WARNING: Could not extract name from transcript');
  }
  
  // === MAJOR EXTRACTION ===
  const majorHeaderIdx = lines.findIndex(line => /^Major\s*$/i.test(line));
  if (majorHeaderIdx >= 0 && majorHeaderIdx + 1 < lines.length) {
    const majorLine = lines[majorHeaderIdx + 1];
    info.major = majorLine;
    console.log('✓ Major found:', info.major);
  } else {
    // Fallback: try to find "Major" followed by the major name
    const majorMatch = text.match(/Major\s*:?\s*\n?\s*([A-Za-z\s&]+?)(?:\n|INSTITUTION|Term|Primary|Bachelor|$)/i);
    if (majorMatch) {
      info.major = majorMatch[1].trim();
      console.log('✓ Major found (fallback):', info.major);
    }
  }
  
  // === CONCENTRATION EXTRACTION ===
  // Look for "Concentration" field in transcript
  const concentrationHeaderIdx = lines.findIndex(line => /^Concentration\s*$/i.test(line));
  if (concentrationHeaderIdx >= 0 && concentrationHeaderIdx + 1 < lines.length) {
    const concentrationLine = lines[concentrationHeaderIdx + 1];
    info.concentration = concentrationLine;
    console.log('✓ Concentration found:', info.concentration);
  } else {
    // Fallback: try regex pattern
    const concentrationMatch = text.match(/Concentration\s*:?\s*\n?\s*([A-Za-z\s&,]+?)(?:\n|INSTITUTION|Term|Major|$)/i);
    if (concentrationMatch) {
      info.concentration = concentrationMatch[1].trim();
      console.log('✓ Concentration found (fallback):', info.concentration);
    } else {
      console.log('ℹ️ No concentration found in transcript');
    }
  }
  
  // === GRADUATION ESTIMATE ===
  // Estimate graduation based on FIRST semester + 4 years (typical bachelor's degree)
  const termPattern = /Term\s*:?\s*(Fall|Spring|Summer)\s+(\d{4})/gi;
  const terms = [...text.matchAll(termPattern)];
  
  if (terms.length > 0) {
    // Use FIRST term (when they started) instead of last term
    const firstTerm = terms[0];
    const startSeason = firstTerm[1];
    const startYear = parseInt(firstTerm[2]);
    
    // Add 4 years for typical bachelor's degree
    const gradYear = startYear + 4;
    
    // If started in Fall, graduate in Spring 4 years later
    // If started in Spring, graduate in Spring 4 years later  
    // If started in Summer, graduate in Spring 4 years later
    info.expectedGraduation = `Spring ${gradYear}`;
    
    console.log(`✓ Graduation estimate: ${info.expectedGraduation} (based on start: ${startSeason} ${startYear} + 4 years)`);
    console.log('ℹ️ Please verify and adjust if needed!');
  }
  
  console.log('=== EXTRACTION COMPLETE ===');
  console.log('Final result:', info);
  return info;
};

/**
 * Validate parsed courses
 */
export const validateParsedCourses = (courses) => {
  return courses.filter(course => {
    const valid = (
      course.code &&
      course.code.length >= 4 &&
      course.credits &&
      parseInt(course.credits) > 0 &&
      parseInt(course.credits) <= 6
    );
    if (!valid) console.log('Filtered out invalid course:', course);
    return valid;
  });
};