from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.upload import router as upload_router
from app.api.meeting import router as meeting_router
from app.database.db import Base, engine
from app.database import models
from app.api.auth import router as auth_router

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
         "https://smartmeet-v2.vercel.app",
           "https://smartmeet-v2-cuiafryce-riyaz-maliks-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(upload_router)
app.include_router(meeting_router)
app.include_router(auth_router)

# Test Route
@app.get("/")
def root():
    return {"message": "Backend Running"}