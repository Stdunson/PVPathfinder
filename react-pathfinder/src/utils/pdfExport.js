import jsPDF from 'jspdf';

/**
 * Export recommendations to PDF
 */
export const exportRecommendationsToPDF = (recommendations, profileData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addText = (text, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    
    lines.forEach(line => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
  };

  // Add header with logo styling
  doc.setFillColor(79, 45, 127); // Purple
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PV Pathfinder', margin, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Prairie View A&M University', margin, 30);
  
  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // Add student info
  if (profileData) {
    addText(`Student: ${profileData.name || 'N/A'}`, 14, true);
    addText(`Major: ${profileData.major || 'N/A'}`, 12);
    if (profileData.major2) addText(`Second Major: ${profileData.major2}`, 12);
    if (profileData.minor) addText(`Minor: ${profileData.minor}`, 12);
    addText(`Expected Graduation: ${profileData.expectedGraduation || 'N/A'}`, 12);
    yPosition += 5;
  }

  // Add separator line
  doc.setDrawColor(253, 185, 19); // Gold
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Add recommendations title
  addText('Course Recommendations', 16, true);
  yPosition += 3;

  // Process and add recommendations content
  const cleanText = recommendations
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '') // Remove italic markers
    .replace(/`/g, ''); // Remove code markers

  addText(cleanText, 11);

  // Add footer
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${today}`, margin, pageHeight - 10);
  doc.text('© Prairie View A&M University', pageWidth - margin - 60, pageHeight - 10);

  // Save the PDF
  doc.save('PV_Pathfinder_Recommendations.pdf');
};

/**
 * Export roadmap to PDF
 */
export const exportRoadmapToPDF = (roadmap, profileData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addText = (text, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    
    lines.forEach(line => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
  };

  // Add header
  doc.setFillColor(79, 45, 127);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PV Pathfinder', margin, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Semester Roadmap', margin, 30);
  
  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // Add student info
  if (profileData) {
    addText(`Student: ${profileData.name || 'N/A'}`, 14, true);
    addText(`Major: ${profileData.major || 'N/A'}`, 12);
    addText(`Expected Graduation: ${profileData.expectedGraduation || 'N/A'}`, 12);
    yPosition += 5;
  }

  // Add separator
  doc.setDrawColor(253, 185, 19);
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Process and add roadmap content
  const cleanText = roadmap
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '');

  addText(cleanText, 11);

  // Add footer
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${today}`, margin, pageHeight - 10);
  doc.text('© Prairie View A&M University', pageWidth - margin - 60, pageHeight - 10);

  // Save the PDF
  doc.save('PV_Pathfinder_Roadmap.pdf');
};