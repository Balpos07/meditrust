from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import billing, webhooks, auth
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
    # Only for simple dev initialization - normally use Alembic
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        # Attempt to add the column in case it's an old database
        try:
            await conn.execute(text("ALTER TABLE invoices ADD COLUMN dynamic_bank_name VARCHAR"))
        except Exception:
            pass

app.include_router(billing.router, prefix="/api/v1/billing", tags=["Billing"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["Webhooks"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}


