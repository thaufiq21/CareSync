"""FAQ Assistant route"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.faq import FAQ

router = APIRouter(prefix="/assistant", tags=["FAQ Assistant"])
logger = logging.getLogger(__name__)

MEDICAL_KEYWORDS = [
    "diagnos", "prescri", "medic", "drug", "dose", "symptom", "treatment",
    "surgery", "cancer", "disease", "infect", "pain reliever", "antibiotic",
]
EMERGENCY_KEYWORDS = ["emergency", "urgent", "chest pain", "can't breathe", "heart attack", "stroke"]


class MessageRequest(BaseModel):
    message: str
    language: str = "en"


class MessageResponse(BaseModel):
    answer: str
    source: str  # "faq", "ai", "fallback", "safety"
    related_faqs: List[int] = []


def _is_medical_query(message: str) -> bool:
    msg_lower = message.lower()
    return any(kw in msg_lower for kw in MEDICAL_KEYWORDS)


def _is_emergency_query(message: str) -> bool:
    msg_lower = message.lower()
    return any(kw in msg_lower for kw in EMERGENCY_KEYWORDS)


def _find_faq_match(faqs: list, message: str, language: str) -> tuple[str, list]:
    msg_lower = message.lower()
    scored = []
    for faq in faqs:
        q = (faq.question_en or "").lower()
        a = (faq.answer_en or "").lower()
        score = 0
        words = [w for w in msg_lower.split() if len(w) > 3]
        for word in words:
            if word in q:
                score += 3
            if word in a:
                score += 1
        if score > 0:
            scored.append((score, faq))
    if not scored:
        return "", []
    scored.sort(key=lambda x: x[0], reverse=True)
    best = scored[0][1]
    if language == "ta" and best.answer_ta:
        answer = best.answer_ta
    else:
        answer = best.answer_en
    related_ids = [s[1].id for s in scored[:3]]
    return answer, related_ids


@router.post("/message", response_model=MessageResponse)
def send_message(
    req: MessageRequest,
    db: Session = Depends(get_db),
):
    if not req.message or len(req.message.strip()) < 2:
        raise HTTPException(status_code=400, detail="Message too short")
    if len(req.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long")

    if _is_emergency_query(req.message):
        return MessageResponse(
            answer=(
                "⚠️ If this is a medical emergency, please immediately alert hospital staff nearby, "
                "call emergency services, or go to the Emergency Department. "
                "This assistant cannot dispatch emergency help."
            ),
            source="safety",
        )

    if _is_medical_query(req.message):
        return MessageResponse(
            answer=(
                "I'm an information assistant and cannot provide medical advice, diagnoses, or treatment recommendations. "
                "Please speak directly with a qualified healthcare professional or your treating doctor for medical questions."
            ),
            source="safety",
        )

    faqs = db.query(FAQ).filter(FAQ.is_published == True).all()
    answer, related_ids = _find_faq_match(faqs, req.message, req.language)

    if answer:
        return MessageResponse(answer=answer, source="faq", related_faqs=related_ids)

    fallback_en = (
        "I don't have a specific answer to your question in my approved information. "
        "Please visit the Patient Assistance Desk, ask a hospital staff member, "
        "or submit an assistance request through the 'Request Assistance' page and we'll get back to you."
    )
    fallback_ta = (
        "என்னிடம் உங்கள் கேள்விக்கு குறிப்பிட்ட பதில் இல்லை. "
        "தயவுசெய்து நோயாளி உதவி மேசையை சந்தியுங்கள் அல்லது 'உதவி கோரு' பக்கத்தில் கோரிக்கை சமர்ப்பிக்கவும்."
    )
    return MessageResponse(
        answer=fallback_ta if req.language == "ta" else fallback_en,
        source="fallback",
    )
