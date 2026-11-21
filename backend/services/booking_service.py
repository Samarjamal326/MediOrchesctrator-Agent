import uuid
from schemas.booking import AppointmentRequest, AppointmentResponse

class BookingService:
    def create_appointment(self, req: AppointmentRequest) -> AppointmentResponse:
        booking_id = f"BK-{uuid.uuid4().hex[:8].upper()}"
        confirmation_code = f"MED-{uuid.uuid4().hex[:6].upper()}"
        return AppointmentResponse(
            booking_id=booking_id,
            domain=req.domain,
            status="confirmed",
            scheduled_time=f"{req.preferred_date} at {req.preferred_time_slot}",
            confirmation_code=confirmation_code,
            referral_summary=f"Referral to {req.domain.capitalize()} specialist for: {req.chief_complaint}"
        )

booking_service = BookingService()
