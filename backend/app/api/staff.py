from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.db.models import Staff, StaffRole
from app.api.dependencies import get_db_session, require_role
from app.api.auth import StaffResponse

router = APIRouter()

@router.get("/", response_model=List[StaffResponse])
async def get_all_staff(
    db: AsyncSession = Depends(get_db_session),
    current_admin: Staff = Depends(require_role([StaffRole.ADMIN]))
):
    result = await db.execute(select(Staff))
    staff_members = result.scalars().all()
    # Filter out inactive or format as needed. Since we use soft delete, let's return all.
    return staff_members

@router.delete("/{staff_id}")
async def deactivate_staff(
    staff_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_admin: Staff = Depends(require_role([StaffRole.ADMIN]))
):
    try:
        user_uuid = uuid.UUID(staff_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid staff ID")
        
    if current_admin.id == user_uuid:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    result = await db.execute(select(Staff).where(Staff.id == user_uuid))
    staff = result.scalar_one_or_none()
    
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
        
    staff.is_active = False
    await db.commit()
    return {"status": "success", "message": f"Staff {staff.username} deactivated."}
