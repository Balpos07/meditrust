from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import billing, webhooks, auth, websockets_router
from app.db.database import engine
from app.db.models import Base

app = FastAPI(title="Meditrust Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from sqlalchemy import text

@app.on_event("startup")
async def startup_event():
    # Database is now managed by Alembic migrations
    pass

app.include_router(billing.router, prefix="/api/v1/billing", tags=["Billing"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["Webhooks"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(websockets_router.router, prefix="/api/v1/ws", tags=["WebSockets"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}


