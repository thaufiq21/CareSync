"""Audit event service"""
import json
from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent


def record_audit_event(
    db: Session,
    action: str,
    actor_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    metadata: Optional[dict] = None,
):
    """Record an audit event. Never include passwords or tokens in metadata."""
    event = AuditEvent(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata_json=json.dumps(metadata) if metadata else None,
    )
    db.add(event)
