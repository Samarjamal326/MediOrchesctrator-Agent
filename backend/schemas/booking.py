from pydantic import BaseModel, Field
from typing import Optional

class AppointmentRequest(BaseModel):
    patient_id: Optional[str] = "anon-patient"
    domain: str = Field(..., description="Target specialist clinical domain")
    doctor_name: Optional[str] = None
    preferred_date: str = Field(..., description="YYYY-MM-DD format")
    preferred_time_slot: str = Field(..., description="e.g. 10:00 AM")
    chief_complaint: str = Field(..., description="Summary of presenting symptoms")
    urgency_level: str = Field("routine", description="routine, urgent, immediate")

class AppointmentResponse(BaseModel):
    booking_id: str
    domain: str
    status: str
    scheduled_time: str
    confirmation_code: str
    referral_summary: str
