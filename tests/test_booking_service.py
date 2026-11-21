from backend.schemas.booking import AppointmentRequest
from backend.services.booking_service import booking_service

def test_booking_creation():
    req = AppointmentRequest(
        domain="cardiology",
        preferred_date="2026-12-01",
        preferred_time_slot="11:00 AM",
        chief_complaint="Exertional chest discomfort and elevated LDL",
        urgency_level="urgent"
    )
    res = booking_service.create_appointment(req)
    assert res.booking_id.startswith("BK-")
    assert res.status == "confirmed"
    assert "Cardiology" in res.referral_summary
