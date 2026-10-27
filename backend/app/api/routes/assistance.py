"""Assistance request routes"""
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.core.deps import get_current_user, get_current_staff_or_admin
from app.models.user import User, UserRole
from app.models.assistance import (
    AssistanceRequest, AssistanceResponse as AssistanceResponseModel,
    ALLOWED_TRANSITIONS, RequestStatus
)
from app.models.notification import Notification
from app.schemas.assistance import (
    AssistanceRequestCreate, AssistanceStatusUpdate,
    AssistanceResponseCreate, AssistanceAssign
)
from app.services.audit import record_audit_event

router = APIRouter(prefix="/assistance-requests", tags=["Assistance Requests"])


def _filter_responses(responses, is_staff: bool):
    """Remove internal notes for patients"""
    if is_staff:
        return responses
    return [r for r in responses if not r.is_internal_note]


def _build_response_out(resp: AssistanceResponseModel) -> dict:
    return {
        "id": resp.id,
        "request_id": resp.request_id,
        "author_id": resp.author_id,
        "author_name": resp.author.name if resp.author else "",
        "message": resp.message,
        "is_internal_note": resp.is_internal_note,
        "created_at": resp.created_at,
    }


@router.post("", status_code=201)
def create_request(
    data: AssistanceRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.patient:
        raise HTTPException(status_code=403, detail="Only patients can submit assistance requests")

    req = AssistanceRequest(
        patient_id=current_user.id,
        category=data.category,
        description=data.description,
        preferred_language=data.preferred_language,
        department_id=data.department_id,
        contact_preference=data.contact_preference,
        accessibility_needs=data.accessibility_needs,
    )
    db.add(req)
    db.flush()

    record_audit_event(db, actor_id=current_user.id, action="assistance_request_created",
                       entity_type="assistance_request", entity_id=req.id)
    db.commit()
    db.refresh(req)
    return {"id": req.id, "reference_code": req.reference_code, "status": req.status.value}


@router.get("")
def list_requests(
    status_filter: Optional[str] = Query(None),
    category_filter: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    is_staff = current_user.role in (UserRole.staff, UserRole.admin)
    query = db.query(AssistanceRequest).options(
        joinedload(AssistanceRequest.responses).joinedload(AssistanceResponseModel.author)
    )

    if not is_staff:
        query = query.filter(AssistanceRequest.patient_id == current_user.id)
    if status_filter:
        query = query.filter(AssistanceRequest.status == status_filter)
    if category_filter:
        query = query.filter(AssistanceRequest.category == category_filter)

    query = query.order_by(AssistanceRequest.created_at.desc())
    offset = (page - 1) * page_size
    requests = query.offset(offset).limit(page_size).all()

    output = []
    for req in requests:
        resp_list = _filter_responses(req.responses, is_staff)
        output.append({
            "id": req.id,
            "reference_code": req.reference_code,
            "patient_id": req.patient_id,
            "category": req.category.value,
            "description": req.description,
            "preferred_language": req.preferred_language,
            "department_id": req.department_id,
            "contact_preference": req.contact_preference,
            "accessibility_needs": req.accessibility_needs,
            "priority": req.priority.value,
            "status": req.status.value,
            "assigned_staff_id": req.assigned_staff_id,
            "is_demo": req.is_demo,
            "created_at": req.created_at.isoformat(),
            "updated_at": req.updated_at.isoformat(),
            "resolved_at": req.resolved_at.isoformat() if req.resolved_at else None,
            "responses": [_build_response_out(r) for r in resp_list],
        })
    return output


@router.get("/{req_id}")
def get_request(
    req_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    is_staff = current_user.role in (UserRole.staff, UserRole.admin)
    req = db.query(AssistanceRequest).options(
        joinedload(AssistanceRequest.responses).joinedload(AssistanceResponseModel.author)
    ).filter(AssistanceRequest.id == req_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if not is_staff and req.patient_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")

    resp_list = _filter_responses(req.responses, is_staff)
    return {
        "id": req.id,
        "reference_code": req.reference_code,
        "patient_id": req.patient_id,
        "category": req.category.value,
        "description": req.description,
        "preferred_language": req.preferred_language,
        "department_id": req.department_id,
        "contact_preference": req.contact_preference,
        "accessibility_needs": req.accessibility_needs,
        "priority": req.priority.value,
        "status": req.status.value,
        "assigned_staff_id": req.assigned_staff_id,
        "is_demo": req.is_demo,
        "created_at": req.created_at.isoformat(),
        "updated_at": req.updated_at.isoformat(),
        "resolved_at": req.resolved_at.isoformat() if req.resolved_at else None,
        "responses": [_build_response_out(r) for r in resp_list],
    }


@router.patch("/{req_id}/status")
def update_status(
    req_id: int,
    data: AssistanceStatusUpdate,
    current_user: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    req = db.query(AssistanceRequest).filter(AssistanceRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    try:
        new_status = RequestStatus(data.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {data.status}")

    allowed = ALLOWED_TRANSITIONS.get(req.status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from {req.status.value} to {new_status.value}"
        )

    req.status = new_status
    if new_status == RequestStatus.resolved:
        req.resolved_at = datetime.now(timezone.utc)

    notif = Notification(
        user_id=req.patient_id,
        title="Request Updated",
        message=f"Your request {req.reference_code} status changed to {new_status.value.replace('_', ' ').title()}",
        notification_type="request_update",
        related_entity_type="assistance_request",
        related_entity_id=req.id,
    )
    db.add(notif)

    if data.note:
        note = AssistanceResponseModel(
            request_id=req.id,
            author_id=current_user.id,
            message=data.note,
            is_internal_note=False,
        )
        db.add(note)

    record_audit_event(db, actor_id=current_user.id, action="request_status_updated",
                       entity_type="assistance_request", entity_id=req.id)
    db.commit()
    return {"status": req.status.value, "reference_code": req.reference_code}


@router.post("/{req_id}/responses", status_code=201)
def add_response(
    req_id: int,
    data: AssistanceResponseCreate,
    current_user: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    req = db.query(AssistanceRequest).filter(AssistanceRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    resp = AssistanceResponseModel(
        request_id=req.id,
        author_id=current_user.id,
        message=data.message,
        is_internal_note=data.is_internal_note,
    )
    db.add(resp)

    if not data.is_internal_note:
        notif = Notification(
            user_id=req.patient_id,
            title="New Response",
            message=f"Hospital staff responded to your request {req.reference_code}",
            notification_type="new_response",
            related_entity_type="assistance_request",
            related_entity_id=req.id,
        )
        db.add(notif)

    record_audit_event(db, actor_id=current_user.id, action="response_added",
                       entity_type="assistance_request", entity_id=req.id)
    db.commit()
    db.refresh(resp)
    return {"id": resp.id, "message": "Response added"}


@router.post("/{req_id}/assign")
def assign_request(
    req_id: int,
    data: AssistanceAssign,
    current_user: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    req = db.query(AssistanceRequest).filter(AssistanceRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    staff = db.query(User).filter(User.id == data.staff_id, User.role.in_(["staff", "admin"])).first()
    if not staff:
        raise HTTPException(status_code=400, detail="Staff member not found")

    req.assigned_staff_id = data.staff_id
    record_audit_event(db, actor_id=current_user.id, action="request_assigned",
                       entity_type="assistance_request", entity_id=req.id)
    db.commit()
    return {"message": "Request assigned", "assigned_to": staff.name}
