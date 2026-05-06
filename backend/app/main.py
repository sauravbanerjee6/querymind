import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes.connect import router as connect_router
from app.routes.chat import router as chat_router

load_dotenv()

app = FastAPI(title="DataLens API", version="1.0.0")

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(connect_router, prefix="/api/connect", tags=["connect"])
app.include_router(chat_router,   prefix="/api/chat",    tags=["chat"])

@app.get("/api/health")
def health():
    return {"status": "ok"}