"""Ensure all models are registered in the Declarative registry"""
from app.models.user import User, UserRole, Language  # noqa: F401
from app.models.department import Department  # noqa: F401
from app.models.appointment import Appointment, AppointmentStatus  # noqa: F401
from app.models.assistance import AssistanceRequest, AssistanceResponse, RequestCategory, RequestStatus, RequestPriority  # noqa: F401
from app.models.feedback import Feedback  # noqa: F401
from app.models.faq import FAQ  # noqa: F401
from app.models.empathy import EmpathyCheckIn  # noqa: F401
from app.models.audit import AuditEvent  # noqa: F401
from app.models.notification import Notification  # noqa: F401
