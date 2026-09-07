from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class JobBase(BaseModel):
    title: str
    content: str


class JobCreate(JobBase):
    pass


class JobResponse(JobBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True