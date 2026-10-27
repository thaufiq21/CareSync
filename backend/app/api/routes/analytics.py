"""Analytics routes"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta

from app.db.session import get_db
from app.core.deps import get_current_staff_or_admin
from app.models.user import User
from app.models.assistance import AssistanceRequest, RequestStatus
from app.models.feedback import Feedback

router = APIRouter(prefix="/staff/analytics", tags=["Analytics"])


@router.get("")
def get_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    status_counts = db.query(AssistanceRequest.status, func.count(AssistanceRequest.id)).group_by(AssistanceRequest.status).all()
    by_status = {row[0].value: row[1] for row in status_counts}

    cat_counts = db.query(AssistanceRequest.category, func.count(AssistanceRequest.id)).group_by(AssistanceRequest.category).all()
    by_category = {row[0].value: row[1] for row in cat_counts}

    total_requests = db.query(func.count(AssistanceRequest.id)).scalar() or 0

    open_statuses = [RequestStatus.submitted, RequestStatus.acknowledged, RequestStatus.in_progress]
    open_requests = db.query(func.count(AssistanceRequest.id)).filter(AssistanceRequest.status.in_(open_statuses)).scalar() or 0

    fb_row = db.query(
        func.avg(Feedback.overall_rating),
        func.avg(Feedback.communication_rating),
        func.avg(Feedback.information_rating),
        func.avg(Feedback.assistance_rating),
        func.count(Feedback.id),
    ).first()

    def safe_round(val, digits=1):
        return round(float(val), digits) if val is not None else None

    weekly_trend = []
    for week in range(3, -1, -1):
        week_start = datetime.now(timezone.utc) - timedelta(weeks=week + 1)
        week_end = datetime.now(timezone.utc) - timedelta(weeks=week)
        count = db.query(func.count(AssistanceRequest.id)).filter(
            AssistanceRequest.created_at >= week_start,
            AssistanceRequest.created_at < week_end,
        ).scalar() or 0
        weekly_trend.append({
            "week": f"Week -{week+1}",
            "count": count,
        })

    return {
        "total_requests": total_requests,
        "open_requests": open_requests,
        "resolved_requests": by_status.get("resolved", 0),
        "closed_requests": by_status.get("closed", 0),
        "by_status": by_status,
        "by_category": by_category,
        "feedback": {
            "count": fb_row[4] or 0 if fb_row else 0,
            "avg_overall": safe_round(fb_row[0]) if fb_row else None,
            "avg_communication": safe_round(fb_row[1]) if fb_row else None,
            "avg_information": safe_round(fb_row[2]) if fb_row else None,
            "avg_assistance": safe_round(fb_row[3]) if fb_row else None,
        },
        "weekly_trend": weekly_trend,
    }
