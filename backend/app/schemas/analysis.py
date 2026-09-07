from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict


class Scores(BaseModel):
    required_skills: float
    secondary_skills: float
    experience: float
    semantic: float
    education: float
    ats_quality: float


class AnalysisBase(BaseModel):
    cv_id: int
    job_offer_id: int


class AnalysisCreate(AnalysisBase):
    pass


class AnalysisResponse(AnalysisBase):
    id: int
    global_score: float
    scores: Scores
    matched_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]
    created_at: datetime

    class Config:
        from_attributes = True