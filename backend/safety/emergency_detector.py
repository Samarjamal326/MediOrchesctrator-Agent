"""
Emergency Detector for MediOrchestrator.
Detects acute life-threatening symptoms (chest pain, stroke, anaphylaxis, severe trauma, suicidal ideation)
to short-circuit the pipeline directly to immediate emergency services guidance.
"""

import re
from typing import List

EMERGENCY_KEYWORDS: List[str] = [
    "chest pain",
    "crushing chest",
    "shortness of breath",
    "difficulty breathing",
    "cannot breathe",
    "severe bleeding",
    "heavy bleeding",
    "loss of consciousness",
    "passed out",
    "unconscious",
    "stroke symptoms",
    "face drooping",
    "slurred speech",
    "anaphylaxis",
    "throat closing",
    "suicidal",
    "kill myself",
    "overdose",
    "poisoning",
    "heart attack"
]

EMERGENCY_DISCLAIMER_RESPONSE = (
    "🚨 **MEDICAL EMERGENCY ALERT**\n\n"
    "Your symptoms indicate a potentially life-threatening medical emergency. **Do not wait for online advice.**\n\n"
    "- **Call 911 (or your local emergency number: 112 / 999) immediately.**\n"
    "- If you are alone, call for emergency assistance right now and unlock your door for responders.\n"
    "- If you are experiencing chest pain, difficulty breathing, or stroke symptoms, sit upright and rest quietly while help is on the way.\n\n"
    "⚕️ *MediOrchestrator emergency safety protocol automatically triggered.*"
)

class EmergencyDetector:
    def __init__(self, keywords: List[str] = EMERGENCY_KEYWORDS):
        self.keywords = keywords

    def is_emergency(self, query: str) -> bool:
        q_lower = query.lower()
        for kw in self.keywords:
            if kw in q_lower:
                return True
        return False

    def get_emergency_response(self) -> str:
        return EMERGENCY_DISCLAIMER_RESPONSE

emergency_detector = EmergencyDetector()
