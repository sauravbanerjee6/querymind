import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes.connect import router as connect_router
from app.routes.chat import router as chat_router

load_dotenv()

app = FastAPI(title="DataLens API", version="1.0.0")

# Define allowed origins explicitly
# CORS requires an exact match including protocol and port
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

# Add FRONTEND_URL from .env if it exists
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    # Ensure no trailing slash for the origin string
    origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(connect_router, prefix="/api/connect", tags=["connect"])
app.include_router(chat_router,   prefix="/api/chat",    tags=["chat"])

@app.get("/api/health")
def health():
    return {"status": "ok"}