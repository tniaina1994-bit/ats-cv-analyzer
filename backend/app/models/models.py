from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.connect import Base


class CV(Base):
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(10), nullable=False)
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    analyses = relationship("Analysis", back_populates="cv")


class JobOffer(Base):
    __tablename__ = "job_offers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    analyses = relationship("Analysis", back_populates="job_offer")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    job_offer_id = Column(Integer, ForeignKey("job_offers.id"), nullable=False)
    global_score = Column(Integer, nullable=False)
    scores = Column(JSON, nullable=False)
    matched_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cv = relationship("CV", back_populates="analyses")
    job_offer = relationship("JobOffer", back_populates="analyses")