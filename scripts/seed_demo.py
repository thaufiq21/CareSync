"""
CareSync Demo Data Seed Script (Synchronous version)
Seeds demonstration accounts, departments, FAQs, and sample records.
"""
import os
import sys
from datetime import datetime, timezone, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models.user import User, UserRole, Language
from app.models.department import Department
from app.models.faq import FAQ
from app.models.assistance import AssistanceRequest, AssistanceResponse, RequestCategory, RequestStatus, RequestPriority
from app.models.feedback import Feedback
from app.models.appointment import Appointment, AppointmentStatus
from app.models.empathy import EmpathyCheckIn
from app.models.notification import Notification
from app.models.audit import AuditEvent
from app.db.base import Base

DB_PATH = os.path.join(BASE_DIR, "backend", "caresync.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

DEPARTMENTS = [
    {
        "name": "Registration & Admissions",
        "description": "Patient registration, admissions processing, and administrative support. [DEMO DATA]",
        "location": "Ground Floor, Main Building",
        "building": "Main Building",
        "floor": "Ground Floor",
        "opening_hours": "Monday–Saturday: 8:00 AM – 6:00 PM",
        "contact_information": "Contact the front desk for assistance (demo contact)",
        "directions": "Enter through the main entrance. Registration is on the right side of the lobby.",
        "accessibility_info": "Wheelchair accessible. Assistance available on request.",
    },
    {
        "name": "Outpatient Consultation",
        "description": "Outpatient consultations with specialist doctors. [DEMO DATA]",
        "location": "First Floor, Block A",
        "building": "Block A",
        "floor": "First Floor",
        "opening_hours": "Monday–Friday: 9:00 AM – 5:00 PM, Saturday: 9:00 AM – 1:00 PM",
        "contact_information": "Consult the duty nurse at the OPD counter (demo contact)",
        "directions": "Take the main staircase or elevator to the first floor. Turn left at the landing.",
        "accessibility_info": "Elevator available. Priority seating for elderly and differently-abled patients.",
    },
    {
        "name": "Laboratory & Diagnostics",
        "description": "Blood tests, urine analysis, and other diagnostic services. [DEMO DATA]",
        "location": "Ground Floor, Block B",
        "building": "Block B",
        "floor": "Ground Floor",
        "opening_hours": "Monday–Saturday: 7:00 AM – 4:00 PM",
        "contact_information": "Approach the lab counter directly with your requisition form (demo contact)",
        "directions": "From the main entrance, walk straight ahead and turn right into Block B. Lab is clearly marked.",
        "accessibility_info": "Wheelchair accessible entrance on the east side of Block B.",
    },
    {
        "name": "Pharmacy",
        "description": "Dispensing prescribed medications and over-the-counter health products. [DEMO DATA]",
        "location": "Ground Floor, adjacent to Main Entrance",
        "building": "Main Building",
        "floor": "Ground Floor",
        "opening_hours": "Monday–Sunday: 8:00 AM – 8:00 PM",
        "contact_information": "Speak with the pharmacist at the counter (demo contact)",
        "directions": "Located to the left of the main entrance. Look for the green pharmacy sign.",
        "accessibility_info": "Low counter available for wheelchair users.",
    },
    {
        "name": "Radiology & Imaging",
        "description": "X-ray, ultrasound, MRI, and CT scan services. [DEMO DATA]",
        "location": "Basement Floor, Block C",
        "building": "Block C",
        "floor": "Basement",
        "opening_hours": "Monday–Saturday: 8:00 AM – 5:00 PM (Emergency scans available 24 hours)",
        "contact_information": "Report to the radiology reception with your doctor's referral (demo contact)",
        "directions": "Use the elevator in Block C to reach the basement. Follow blue floor markings.",
        "accessibility_info": "Dedicated accessible changing rooms available.",
    },
    {
        "name": "Billing & Accounts",
        "description": "Payment processing, insurance documentation, and billing queries. [DEMO DATA]",
        "location": "Ground Floor, Main Building (Near Exit)",
        "building": "Main Building",
        "floor": "Ground Floor",
        "opening_hours": "Monday–Friday: 9:00 AM – 5:00 PM",
        "contact_information": "Approach the billing counter with your treatment summary (demo contact)",
        "directions": "Near the main exit on the right side. Look for the billing signboard.",
        "accessibility_info": "Seating available for patients who need to wait.",
    },
    {
        "name": "Patient Assistance Desk",
        "description": "Non-emergency patient support, directions, language assistance, and general inquiries. [DEMO DATA]",
        "location": "Ground Floor, Main Lobby",
        "building": "Main Building",
        "floor": "Ground Floor",
        "opening_hours": "Monday–Saturday: 8:00 AM – 6:00 PM",
        "contact_information": "Our desk volunteers are happy to assist (demo contact)",
        "directions": "Located in the centre of the main lobby, next to the information board.",
        "accessibility_info": "Assistive communication aids available. Tamil and English assistance available.",
    },
]

FAQS = [
    {
        "question_en": "What documents should I bring for my first visit?",
        "answer_en": (
            "For your first visit, please bring: your government-issued photo ID (Aadhaar card, passport, or driving licence), "
            "any previous medical records or test reports related to your condition, a referral letter if you have one, "
            "your insurance card or policy documents if applicable, and any medications you are currently taking."
        ),
        "question_ta": "முதல் வருகைக்கு என்ன ஆவணங்கள் கொண்டு வர வேண்டும்?",
        "answer_ta": (
            "உங்கள் முதல் வருகைக்கு, அரசு வழங்கிய புகைப்பட அடையாள அட்டை, முந்தைய மருத்துவ பதிவுகள், "
            "காப்பீட்டு அட்டை மற்றும் நீங்கள் தற்போது எடுத்துக்கொள்ளும் மருந்துகளை கொண்டு வாருங்கள்."
        ),
        "category": "preparation",
    },
    {
        "question_en": "How do I find a specific department?",
        "answer_en": (
            "You can use the Hospital Directory on this website to search for any department. "
            "Each department entry includes its location, floor, building, and directions. "
            "Or submit an assistance request through the 'Request Assistance' page."
        ),
        "question_ta": "ஒரு குறிப்பிட்ட துறையை எவ்வாறு கண்டுபிடிப்பது?",
        "answer_ta": (
            "இந்த வலைத்தளத்தில் உள்ள மருத்துவமனை அகராதியில் எந்த துறையையும் தேடலாம். "
            "அல்லது 'உதவி கோரு' பக்கத்தில் கோரிக்கை சமர்ப்பிக்கவும்."
        ),
        "category": "navigation",
    },
    {
        "question_en": "How do I request wheelchair or mobility assistance?",
        "answer_en": (
            "You can request wheelchair or mobility assistance by submitting an assistance request "
            "online through the 'Request Assistance' page (category: Wheelchair or Mobility Assistance) "
            "or visiting the Patient Assistance Desk in the main lobby."
        ),
        "question_ta": "சக்கர நாற்காலி அல்லது இயக்க உதவியை எவ்வாறு கோருவது?",
        "answer_ta": (
            "'உதவி கோரு' பக்கம் வழியாக சக்கர நாற்காலி உதவியை கோரலாம் அல்லது முக்கிய லாபியில் உள்ள உதவி மேசையை அணுகலாம்."
        ),
        "category": "assistance",
    },
    {
        "question_en": "How can I submit feedback about my experience?",
        "answer_en": (
            "You can submit feedback through the 'Patient Feedback' page after logging into your account. "
            "Your feedback helps us understand what is working well and where we can improve."
        ),
        "question_ta": "என் அனுபவத்தைப் பற்றி கருத்தை எவ்வாறு சமர்ப்பிப்பது?",
        "answer_ta": "உங்கள் கணக்கில் உள்நுழைந்த பிறகு 'நோயாளி கருத்து' பக்கம் வழியாக கருத்தை சமர்ப்பிக்கலாம்.",
        "category": "feedback",
    },
]


def seed():
    engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        existing = session.query(User).filter(User.email == "admin@caresync.demo").first()
        if existing:
            print("⚠️ Demo data already exists. Skipping.")
            return

        print("🌱 Seeding demonstration users...")
        admin = User(
            name="Demo Administrator",
            email="admin@caresync.demo",
            password_hash=hash_password("Admin@12345"),
            role=UserRole.admin,
            preferred_language=Language.en,
            is_demo=True,
        )
        staff1 = User(
            name="Demo Staff - Priya Sharma",
            email="staff1@caresync.demo",
            password_hash=hash_password("Staff@12345"),
            role=UserRole.staff,
            preferred_language=Language.en,
            is_demo=True,
        )
        staff2 = User(
            name="Demo Staff - Arjun Kumar",
            email="staff2@caresync.demo",
            password_hash=hash_password("Staff@12345"),
            role=UserRole.staff,
            preferred_language=Language.ta,
            is_demo=True,
        )
        patient1 = User(
            name="Demo Patient - Meera Rajan",
            email="patient1@caresync.demo",
            password_hash=hash_password("Patient@12345"),
            role=UserRole.patient,
            preferred_language=Language.en,
            is_demo=True,
        )
        patient2 = User(
            name="Demo Patient - Selvam Murugan",
            email="patient2@caresync.demo",
            password_hash=hash_password("Patient@12345"),
            role=UserRole.patient,
            preferred_language=Language.ta,
            is_demo=True,
        )
        session.add_all([admin, staff1, staff2, patient1, patient2])
        session.flush()

        print("🌱 Seeding departments...")
        depts = []
        for d in DEPARTMENTS:
            dept = Department(**d, is_demo=True)
            session.add(dept)
            depts.append(dept)
        session.flush()

        print("🌱 Seeding FAQs...")
        for f in FAQS:
            faq = FAQ(**f, is_published=True, is_demo=True)
            session.add(faq)
        session.flush()

        print("🌱 Seeding demo appointments...")
        future_date = datetime.now(timezone.utc) + timedelta(days=3)
        appt = Appointment(
            patient_id=patient1.id,
            department_id=depts[1].id,
            title="Demo Outpatient Consultation [DEMO]",
            appointment_date=future_date,
            status=AppointmentStatus.demo,
            notes="This is a demonstration appointment record.",
            is_demo=True,
        )
        session.add(appt)
        session.flush()

        print("🌱 Seeding assistance requests and responses...")
        req1 = AssistanceRequest(
            patient_id=patient1.id,
            category=RequestCategory.navigation,
            description="I need help finding the Radiology department for my scheduled CT scan.",
            preferred_language="en",
            department_id=depts[4].id,
            status=RequestStatus.acknowledged,
            priority=RequestPriority.normal,
            assigned_staff_id=staff1.id,
            is_demo=True,
        )
        req2 = AssistanceRequest(
            patient_id=patient2.id,
            category=RequestCategory.language,
            description="நான் தமிழ்நாட்டில் இருந்து வந்தேன். மருத்துவ வழிமுறைகளை தமிழில் புரிந்துகொள்ள உதவி கேட்கிறேன்.",
            preferred_language="ta",
            status=RequestStatus.submitted,
            priority=RequestPriority.normal,
            is_demo=True,
        )
        session.add_all([req1, req2])
        session.flush()

        resp1 = AssistanceResponse(
            request_id=req1.id,
            author_id=staff1.id,
            message="Hello Meera! Radiology is in Basement Block C. Use the elevator in Block C and follow the blue floor markings.",
            is_internal_note=False,
        )
        resp2 = AssistanceResponse(
            request_id=req1.id,
            author_id=staff1.id,
            message="[INTERNAL NOTE] Volunteer escort offered upon arrival at lobby.",
            is_internal_note=True,
        )
        session.add_all([resp1, resp2])

        print("🌱 Seeding feedback...")
        fb = Feedback(
            patient_id=patient1.id,
            communication_rating=5,
            information_rating=4,
            assistance_rating=5,
            overall_rating=5,
            comments="The navigation support and prompt staff response made my hospital visit much less stressful!",
            preferred_language="en",
            is_demo=True,
        )
        session.add(fb)

        session.commit()
        print("✅ Demo data seeded successfully into SQLite!")


if __name__ == "__main__":
    seed()
