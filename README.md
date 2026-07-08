# SmartMeet AI

SmartMeet AI is a full-stack AI-powered meeting intelligence platform that transforms meeting recordings into searchable transcripts, concise summaries, action items, and key decisions using modern AI models.

The application is built with **Next.js**, **FastAPI**, **Groq Whisper**, and **Google Gemini AI**, providing an end-to-end solution for intelligent meeting management.

---

## Live Demo

**Frontend:**  
https://smartmeet-v2.vercel.app/

**Backend API:**  
https://smartmeet-wlq2.onrender.com

**Swagger Documentation:**  
https://smartmeet-wlq2.onrender.com/docs

---

## Features

### Authentication

- User Registration
- Secure Login
- JWT Authentication
- Protected API Routes
- User-specific Meeting History

### AI Meeting Intelligence

- Upload Meeting Audio
- Speech-to-Text Transcription using Groq Whisper
- AI-generated Meeting Summary
- Action Item Extraction
- Key Decision Extraction

### Meeting Management

- Dashboard
- Meeting History
- Individual Meeting View
- Search Meetings
- Delete Meetings
- User-specific Data Isolation

### User Experience

- Responsive Design
- Modern Authentication Pages
- Loading States
- Toast Notifications
- Secure File Upload

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- React Hot Toast
- jsPDF

## Backend

- FastAPI
- Python
- SQLAlchemy
- SQLite
- JWT Authentication
- Groq Whisper API
- Google Gemini AI

---

# System Architecture

```text
                    User
                      │
                      ▼
            Next.js Frontend
                      │
                      ▼
             FastAPI Backend
                      │
      ┌───────────────┼────────────────┐
      │               │                │
      ▼               ▼                ▼
 JWT Authentication  Audio Upload   Meeting APIs
                      │
                      ▼
              Groq Whisper API
                      │
                      ▼
                 Transcript
                      │
                      ▼
             Google Gemini AI
                      │
                      ▼
     Summary • Tasks • Decisions
                      │
                      ▼
              SQLite Database
                      │
                      ▼
                  Dashboard
```

---

# Application Workflow

```text
User Login
      │
      ▼
JWT Authentication
      │
      ▼
Upload Meeting Audio
      │
      ▼
Groq Whisper
      │
      ▼
Transcript Generation
      │
      ▼
Google Gemini AI
      │
      ▼
Summary
Action Items
Key Decisions
      │
      ▼
Database Storage
      │
      ▼
Dashboard & Meeting History
```

---

# Project Structure

```text
SmartMeet-AI
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── ...
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── database
│   │   ├── schemas
│   │   ├── services
│   │   ├── utils
│   │   └── main.py
│   │
│   ├── uploads
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Riyaz01devloper/SmartMeet-AI.git

cd SmartMeet-AI
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# Environment Variables

Create a `.env` file inside the backend directory.

```env
SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

GROQ_API_KEY=your_groq_api_key

GEMINI_API_KEY=your_gemini_api_key
```

---

# API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | User login |
| GET | `/auth/me` | Get authenticated user |

---

## Meetings

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/upload` | Upload meeting audio |
| GET | `/meetings` | Get all user meetings |
| GET | `/meeting/{id}` | Get meeting details |
| DELETE | `/meeting/{id}` | Delete a meeting |

---

# Screenshots

Add screenshots of the following pages:

- Landing Page
- Login
- Register
- Dashboard
- Upload Meeting
- Meeting Details
- AI Generated Summary

---

# Key Highlights

- Built a complete AI-powered Meeting Intelligence Platform from scratch.
- Implemented secure JWT Authentication with protected REST APIs.
- Integrated Groq Whisper for high-quality speech-to-text transcription.
- Integrated Google Gemini AI for intelligent meeting summarization.
- Built responsive frontend using Next.js, TypeScript, and Tailwind CSS.
- Developed scalable REST APIs using FastAPI and SQLAlchemy.
- Implemented user-specific meeting management and secure data isolation.
- Deployed frontend on Vercel and backend on Render.

---

# Future Enhancements

- Team Workspaces
- Cloud Storage Integration (AWS S3)
- Multi-language Transcription
- AI Chat with Meetings
- Calendar Integration
- Email Meeting Summary
- Meeting Sharing
- Real-time Meeting Recording
- PostgreSQL Support
- Docker Deployment

---

# Author

**Riyaz Malik**

GitHub:  
https://github.com/Riyaz01devloper

LinkedIn:  
https://www.linkedin.com/in/riyaz-malik-a5509332a

---

# License

This project is licensed under the MIT License.

---

If you found this project useful, consider giving it a star.