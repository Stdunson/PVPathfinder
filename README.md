# 🎓 PV Pathfinder

**AI-Powered Academic Planning Assistant for Prairie View A&M University**

PV Pathfinder helps PVAMU students plan their academic journey with intelligent course recommendations, personalized semester roadmaps, and easy transcript importing.

---

## ✨ Features

### 📋 Profile Management
- Complete student profile with major, minor, and concentration
- Dual major/minor support
- Track completed courses with grades and credits
- Import transcripts automatically (text or PDF)
- Real-time GPA calculation

### 🎯 AI-Powered Recommendations
- Personalized course recommendations for next semester
- Considers prerequisites, graduation timeline, and constraints
- Interactive chat to discuss recommendations
- Export recommendations to PDF

### 🗺️ Semester Roadmap
- Complete semester-by-semester plan to graduation
- Builds on your recommendations for consistency
- Accounts for prerequisites and course sequencing
- Export roadmap to PDF

### 📚 Course Catalog
- Browse 2000+ PVAMU courses
- Search by course code or name
- Filter by department and degree level
- Pagination for fast performance
- Prerequisite checking

### 🎨 Modern UI
- Clean, professional design with PVAMU branding
- Dark mode support
- Mobile responsive
- Smooth animations and transitions

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Gemini API Key** (free from Google AI Studio)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd pv-pathfinder
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Then edit `.env` and add your Gemini API key:
```
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

4. **Start the development server**
```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 🔧 Backend Setup (Required for AI Features)

PV Pathfinder uses a separate backend server to securely handle AI API calls.

### Start Backend Server

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Create backend .env file**
```bash
cp .env.example .env
```
Add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

4. **Start backend server**
```bash
npm start
```

Backend runs on `http://localhost:3001`

### Run Both Servers (Recommended)

In the root directory:
```bash
npm run dev
```

This starts both frontend and backend concurrently.

---

## 📁 Project Structure

```
pv-pathfinder/
├── public/
│   ├── logo.png                    # PVAMU logo
│   ├── pvamu_courses.json          # Course catalog data
│   └── pdf.worker.min.mjs          # PDF.js worker
├── src/
│   ├── services/
│   │   └── aiService.js            # Backend API calls
│   ├── utils/
│   │   ├── pdfExport.js            # PDF generation
│   │   └── transcriptParser.js     # Transcript parsing
│   ├── App.js                      # Main application
│   ├── App.css                     # Styles
│   └── index.js                    # Entry point
├── backend/
│   ├── server.js                   # Express backend server
│   ├── .env                        # Backend environment variables
│   └── package.json                # Backend dependencies
├── .env                            # Frontend environment variables
├── .env.example                    # Environment template
├── package.json                    # Frontend dependencies
└── README.md                       # This file
```

---

## 🎯 Usage Guide

### 1. Set Up Profile
- Navigate to "My Profile"
- Enter your name, major, minor, and expected graduation
- Add completed courses manually or import from transcript

### 2. Import Transcript (Recommended)
- Click "Import Transcript"
- **Best method:** Copy text from PDF (Ctrl+A, Ctrl+C, paste)
- Automatically extracts courses, grades, and student info
- Review and confirm before importing

### 3. Get Recommendations
- Navigate to "Recommendations"
- Click "Get Recommendations"
- AI analyzes your profile and suggests 4-5 courses
- Ask follow-up questions via chat
- Export to PDF for reference

### 4. Generate Roadmap
- Navigate to "Semester Roadmap"
- Click "Generate Roadmap"
- View complete semester-by-semester plan
- Export to PDF for advising appointments

### 5. Browse Course Catalog
- Navigate to "Course Catalog"
- Search by course code or name
- Filter by department or degree level
- Check prerequisites against your completed courses

---

## 🛠️ Technologies Used

### Frontend
- **React** 18 - UI framework
- **React Select** - Enhanced dropdowns
- **React Markdown** - Display AI responses
- **jsPDF** - PDF generation
- **PDF.js** - PDF parsing
- **LocalStorage** - Data persistence

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Google Generative AI** - Gemini API integration
- **CORS** - Cross-origin support

### AI
- **Gemini 2.5 Flash** - Fast, accurate course recommendations

---

## 📊 Data Management

### Data Storage
All data is stored locally in your browser using LocalStorage:
- Profile data
- Completed courses
- Recommendations
- Roadmap

**Note:** Data persists across sessions but is device-specific. Clear browser data to reset.

### Course Catalog
The course catalog (`pvamu_courses.json`) contains 2000+ PVAMU courses with:
- Course codes and names
- Credit hours
- Prerequisites and co-requisites
- Department and degree level

---

## 🎨 Customization

### Colors (PVAMU Branding)
- **Purple:** `#4f2d7f` (Primary)
- **Gold:** `#fdb913` (Accent)
- **Dark Purple:** `#3d2463` (Hover states)

### Dark Mode
Toggle dark mode using the moon/sun icon in the header. Preference is saved automatically.

---

## 🐛 Troubleshooting

### AI Features Not Working
**Problem:** "Failed to generate recommendations"
**Solution:**
1. Check backend server is running (`npm start` in backend folder)
2. Verify `REACT_APP_API_URL` in `.env` points to correct backend
3. Check Gemini API key is valid in backend `.env`

### Transcript Import Issues
**Problem:** "No valid courses found"
**Solution:**
1. Use "Paste Text" method instead of PDF upload
2. Ensure you're copying from an official PVAMU transcript
3. Check transcript follows standard format (Term, Course Code, Grade)

### Courses Not Loading
**Problem:** Course catalog shows loading forever
**Solution:**
1. Verify `pvamu_courses.json` exists in `/public` folder
2. Check browser console for errors
3. Refresh page

### Dark Mode Issues
**Problem:** Colors look wrong in dark mode
**Solution:**
1. Clear browser cache
2. Toggle dark mode off and on
3. Check CSS file has all dark mode styles

---

## 📝 Development

### Available Scripts

**Frontend:**
```bash
npm start          # Start development server (port 3000)
npm run build      # Build for production
npm test           # Run tests
```

**Backend:**
```bash
cd backend
npm start          # Start backend server (port 3001)
```

**Both (Concurrent):**
```bash
npm run dev        # Requires concurrently package
```

### Code Structure
- Components are organized by feature
- Utility functions in `/utils`
- Services handle external API calls
- All styles in single `App.css` file

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the app**
```bash
npm run build
```

2. **Deploy `build/` folder** to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Any static hosting

3. **Set environment variables** in hosting dashboard:
   - `REACT_APP_API_URL` - Your deployed backend URL

### Backend Deployment (Render/Railway/Heroku)

1. **Deploy backend folder** to:
   - Render
   - Railway
   - Heroku
   - Any Node.js hosting

2. **Set environment variables:**
   - `GEMINI_API_KEY` - Your API key
   - `PORT` - Usually set automatically
   - `FRONTEND_URL` - Your deployed frontend URL (for CORS)

---

## 🔐 Security Notes

- **Never commit `.env` files** - They contain API keys
- **Backend handles API calls** - Keeps API keys secure
- **CORS configured** - Only allows requests from your frontend
- **LocalStorage data** - Stays on user's device only

---

## 📄 License

This project is created for Prairie View A&M University students. All rights reserved.

---

## 🤝 Contributing

This is a university project. For questions or contributions, please contact the development team.

---

## 📧 Support

For issues or questions:
1. Check this README
2. Review browser console for errors
3. Contact your academic advisor for course planning questions

---

## 🎓 About PVAMU

Prairie View A&M University is a historically black university and a member of the Texas A&M University System. Located in Prairie View, Texas.

**Go Panthers! 💜💛**

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Built with ❤️ for PVAMU Students**