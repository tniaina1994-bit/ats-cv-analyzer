from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CVBase(BaseModel):
    filename: str
    file_type: str


class CVCreate(CVBase):
    pass


class CVResponse(CVBase):
    id: int
    file_path: str
    extracted_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True