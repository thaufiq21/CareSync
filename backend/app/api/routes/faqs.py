"""FAQ routes"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_admin
from app.models.faq import FAQ
from app.schemas.faq import FAQCreate, FAQUpdate, FAQResponse

router = APIRouter(prefix="/faqs", tags=["FAQs"])


@router.get("", response_model=List[FAQResponse])
def list_faqs(
    category: Optional[str] = Query(None),
    published_only: bool = True,
    db: Session = Depends(get_db),
):
    query = db.query(FAQ)
    if published_only:
        query = query.filter(FAQ.is_published == True)
    if category:
        query = query.filter(FAQ.category == category)
    return query.order_by(FAQ.id).all()


@router.post("", response_model=FAQResponse, status_code=201)
def create_faq(
    data: FAQCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    faq = FAQ(**data.model_dump())
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq


@router.patch("/{faq_id}", response_model=FAQResponse)
def update_faq(
    faq_id: int,
    data: FAQUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(faq, field, value)
    db.commit()
    db.refresh(faq)
    return faq
