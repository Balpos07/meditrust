import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
from unittest.mock import patch
import httpx

from app.db.database import get_db, Base
from app.main import app
from app.core.config import settings

engine_test = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    echo=False,
    future=True,
    pool_pre_ping=True,
)
async_session_test = async_sessionmaker(
    engine_test, class_=AsyncSession, expire_on_commit=False
)

async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_test() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def mock_monnify(respx_mock):
    # Mock Auth
    respx_mock.post(f"{settings.MONNIFY_BASE_URL}/api/v1/auth/login").mock(
        return_value=httpx.Response(200, json={
            "requestSuccessful": True,
            "responseBody": {"accessToken": "mocked_token"}
        })
    )
    
    # Mock Create Account
    respx_mock.post(f"{settings.MONNIFY_BASE_URL}/api/v1/bank-transfer/merchant-accounts/dynamic").mock(
        return_value=httpx.Response(200, json={
            "requestSuccessful": True,
            "responseBody": {
                "accountNumber": "1234567890",
                "bankName": "Test Bank",
                "accountName": "Test Meditrust"
            }
        })
    )
    yield respx_mock
