"""CareSync Backend - Main Application Entry Point"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.session import engine
from app.db.models import Base
from app.api.routes import (
    auth,
    profile,
    departments,
    appointments,
    assistance,
    feedback,
    empathy,
    faqs,
    assistant,
    staff,
    admin,
    analytics,
    notifications,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CareSync backend starting up...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema verified/created successfully.")
    yield
    logger.info("CareSync backend shutting down.")


app = FastAPI(
    title="CareSync API",
    description="CareSync — A Smart Patient Support and Hospital Communication Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(profile.router, prefix=PREFIX)
app.include_router(departments.router, prefix=PREFIX)
app.include_router(appointments.router, prefix=PREFIX)
app.include_router(assistance.router, prefix=PREFIX)
app.include_router(feedback.router, prefix=PREFIX)
app.include_router(empathy.router, prefix=PREFIX)
app.include_router(faqs.router, prefix=PREFIX)
app.include_router(assistant.router, prefix=PREFIX)
app.include_router(staff.router, prefix=PREFIX)
app.include_router(admin.router, prefix=PREFIX)
app.include_router(analytics.router, prefix=PREFIX)
app.include_router(notifications.router, prefix=PREFIX)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "CareSync API", "version": "1.0.0"}


@app.exception_handler(404)
def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": "Resource not found"})


@app.exception_handler(500)
def server_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."},
    )
