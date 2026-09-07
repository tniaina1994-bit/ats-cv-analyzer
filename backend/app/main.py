from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import scan

app = FastAPI(
    title="ATS CV Analyzer API",
    description="API for analyzing CVs against job offers",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(scan.router, prefix="/api", tags=["scan"])


@app.get("/")
async def root():
    return {"message": "ATS CV Analyzer API", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}