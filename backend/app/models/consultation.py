from pydantic import BaseModel
from typing import Optional
from enum import Enum


class ConsultationStatus(str, Enum):
    new = "New"
    in_progress = "In Progress"
    done = "Done"


class Consultation(BaseModel):
    id: str
    timestamp: str
    language: str
    name: str
    contact: str
    query_type: str
    budget: Optional[str] = None
    car_preference: Optional[str] = None
    details: Optional[str] = None
    status: str = "New"


class SaveConsultationRequest(BaseModel):
    language: str
    name: str
    contact: str
    query_type: str
    budget: Optional[str] = None
    car_preference: Optional[str] = None
    details: Optional[str] = None


class StatusUpdateRequest(BaseModel):
    status: ConsultationStatus
