"""CareSync Backend Unit and Integration Test Suite"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.security import hash_password
from app.models.user import User, UserRole

# Use an isolated in-memory or dedicated test db
TEST_DB_URL = "sqlite:///./test_caresync.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    # Seed an admin and patient for testing
    with TestingSessionLocal() as session:
        admin = User(
            name="Test Admin",
            email="admin@test.local",
            password_hash=hash_password("Admin@12345"),
            role=UserRole.admin,
            is_active=True,
        )
        staff = User(
            name="Test Staff",
            email="staff@test.local",
            password_hash=hash_password("Staff@12345"),
            role=UserRole.staff,
            is_active=True,
        )
        patient = User(
            name="Test Patient",
            email="patient@test.local",
            password_hash=hash_password("Patient@12345"),
            role=UserRole.patient,
            is_active=True,
        )
        session.add_all([admin, staff, patient])
        session.commit()
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_patient_success(client):
    res = client.post("/api/v1/auth/register", json={
        "name": "Jane Doe",
        "email": "jane@test.local",
        "password": "Password@123",
        "password_confirm": "Password@123",
        "preferred_language": "en",
        "consent": True,
    })
    assert res.status_code == 201
    assert res.json()["email"] == "jane@test.local"
    assert res.json()["role"] == "patient"
    assert "access_token" in res.cookies


def test_register_duplicate_email_fails(client):
    res = client.post("/api/v1/auth/register", json={
        "name": "Jane Again",
        "email": "jane@test.local",
        "password": "Password@123",
        "password_confirm": "Password@123",
        "preferred_language": "en",
        "consent": True,
    })
    assert res.status_code == 400


def test_login_success_and_logout(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "patient@test.local",
        "password": "Patient@12345",
    })
    assert res.status_code == 200
    assert "access_token" in res.cookies

    # Access current user info
    me_res = client.get("/api/v1/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "patient@test.local"

    # Logout
    logout_res = client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200


def test_anonymous_access_denied(client):
    client.cookies.clear()
    res = client.get("/api/v1/profile")
    assert res.status_code == 401


def test_patient_to_staff_workflow(client):
    # 1. Login as Patient
    login_p = client.post("/api/v1/auth/login", json={
        "email": "patient@test.local",
        "password": "Patient@12345",
    })
    assert login_p.status_code == 200

    # 2. Patient submits an assistance request
    req_res = client.post("/api/v1/assistance-requests", json={
        "category": "hospital_navigation",
        "description": "I need help finding the laboratory for blood tests.",
        "preferred_language": "en",
        "consent": True,
    })
    assert req_res.status_code == 201
    req_id = req_res.json()["id"]
    ref_code = req_res.json()["reference_code"]
    assert req_res.json()["status"] == "submitted"

    # 3. Patient cannot set status directly
    status_p = client.patch(f"/api/v1/assistance-requests/{req_id}/status", json={
        "status": "resolved"
    })
    assert status_p.status_code == 403

    # 4. Login as Staff
    login_s = client.post("/api/v1/auth/login", json={
        "email": "staff@test.local",
        "password": "Staff@12345",
    })
    assert login_s.status_code == 200

    # 5. Staff updates status to in_progress
    stat_res = client.patch(f"/api/v1/assistance-requests/{req_id}/status", json={
        "status": "acknowledged"
    })
    assert stat_res.status_code == 200

    # 6. Staff posts a patient-visible response
    resp_res = client.post(f"/api/v1/assistance-requests/{req_id}/responses", json={
        "message": "The laboratory is on the Ground Floor of Block B. Turn right at main lobby.",
        "is_internal_note": False,
    })
    assert resp_res.status_code == 201

    # 7. Staff posts an internal note
    note_res = client.post(f"/api/v1/assistance-requests/{req_id}/responses", json={
        "message": "Patient directed to Block B lab reception.",
        "is_internal_note": True,
    })
    assert note_res.status_code == 201

    # 8. Staff views request (sees both public response and internal note)
    staff_view = client.get(f"/api/v1/assistance-requests/{req_id}")
    assert staff_view.status_code == 200
    assert len(staff_view.json()["responses"]) == 2

    # 9. Patient logs back in and views request
    client.post("/api/v1/auth/login", json={
        "email": "patient@test.local",
        "password": "Patient@12345",
    })
    patient_view = client.get(f"/api/v1/assistance-requests/{req_id}")
    assert patient_view.status_code == 200
    responses = patient_view.json()["responses"]
    # Verify ONLY public response is returned; internal note is strictly hidden
    assert len(responses) == 1
    assert responses[0]["is_internal_note"] is False
    assert "Ground Floor of Block B" in responses[0]["message"]


def test_faq_assistant_medical_safety(client):
    res = client.post("/api/v1/assistant/message", json={
        "message": "What dosage of antibiotics or medicine should I take for pain?"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["source"] == "safety"
    assert "cannot provide medical advice" in data["answer"]


def test_faq_assistant_emergency_safety(client):
    res = client.post("/api/v1/assistant/message", json={
        "message": "I have severe chest pain and can't breathe, urgent emergency!"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["source"] == "safety"
    assert "emergency" in data["answer"].lower()
