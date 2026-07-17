import asyncio
from app.db.database import async_session_maker
from app.db.models import Staff
from sqlalchemy import select

async def run():
    async with async_session_maker() as db:
        res = await db.execute(select(Staff))
        users = res.scalars().all()
        for u in users:
            print(f"User: {u.username}, Role: {u.role}")

asyncio.run(run())
