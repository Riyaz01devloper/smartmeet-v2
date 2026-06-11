# 🎙️ MeetIQ - AI Meeting Intelligence Platform

MeetIQ is a full-stack AI-powered meeting analysis platform that transforms audio recordings into searchable transcripts, intelligent summaries, action items, and meeting insights.

##  Features

-  Upload meeting audio recordings
-  Speech-to-text transcription using Whisper AI
-  AI-generated meeting summaries using Gemini AI
-  Search meetings instantly
-  Analytics dashboard
-  Export meeting reports as PDF
-  Delete meetings with confirmation
-  Toast notifications for user actions
-  Meeting history dashboard
-  Detailed meeting view page

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Axios
- React Hot Toast
- jsPDF

### Backend
- FastAPI
- Python
- SQLAlchemy
- SQLite
- Whisper AI
- Google Gemini AI

---


##  Installation

### Clone Repository

```bash
git clone https://github.com/Riyaz01devloper/MeetIQ.git
cd MeetIQ
```

---

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

##  Environment Variables

Create a `.env` file inside backend:

```env
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
```

---

##  Project Structure

```text
MeetIQ
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── app
│   ├── uploads
│   ├── requirements.txt
│   └── main.py
│
└── README.md
```

---

##  Application Flow

```text
Audio Upload
      ↓
Whisper Transcription
      ↓
Gemini AI Summary
      ↓
Database Storage
      ↓
Dashboard Analytics
      ↓
Search / View / Export PDF
```

---

##  Key Highlights

- Built a full-stack AI application from scratch.
- Integrated Whisper AI for speech-to-text conversion.
- Implemented Gemini AI for intelligent meeting summarization.
- Developed REST APIs using FastAPI.
- Built responsive UI with Next.js and Tailwind CSS.
- Implemented search, analytics, PDF export, and meeting management features.

---

##  Future Improvements

- User Authentication
- Team Workspaces
- Cloud Storage Integration
- Multi-language Transcription
- Real-time Meeting Analysis
- Calendar Integration

---

##  Author

**Riyaz Malik**

- GitHub: https://github.com/Riyaz01devloper


---

 If you found this project useful, consider giving it a star.