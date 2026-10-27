"""Import all models so Alembic can detect them"""
from app.db.base import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.department import Department  # noqa: F401
from app.models.appointment import Appointment  # noqa: F401
from app.models.assistance import AssistanceRequest, AssistanceResponse  # noqa: F401
from app.models.feedback import Feedback  # noqa: F401
from app.models.faq import FAQ  # noqa: F401
from app.models.empathy import EmpathyCheckIn  # noqa: F401
from app.models.audit import AuditEvent  # noqa: F401
from app.models.notification import Notification  # noqa: F401
