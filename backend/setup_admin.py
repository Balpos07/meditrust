import asyncio
from app.db.database import async_session_maker
from app.db.models import Staff, StaffRole
from app.core.security import get_password_hash

async def create_admin():
    async with async_session_maker() as db:
        admin = Staff(
            username="admin",
            hashed_password=get_password_hash("admin"),
            role=StaffRole.ADMIN
        )
        db.add(admin)
        await db.commit()
        print("Admin user created successfully in PostgreSQL!")

if __name__ == "__main__":
    asyncio.run(create_admin())
