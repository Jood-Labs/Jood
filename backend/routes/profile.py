from fastapi import APIRouter, Depends, HTTPException

from services.supabase_client import supabase_admin
from dependencies.auth import get_current_user
from models.user import UserProfileUpdate

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get("/")
def get_profile(
    current_user=Depends(get_current_user)
):
    try:
        response = (
            supabase_admin
            .table("profiles")
            .select(
                "id, created_at, name, diet, preferred_cuisines, allergies, dislikes"
            )
            .eq("id", str(current_user.id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )

        profile = response.data[0]

        return {
            "profile": {
                **profile,
                "email": current_user.email
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.put("/")
def update_profile(
    profile_update: UserProfileUpdate,
    current_user=Depends(get_current_user)
):
    try:
        response = (
            supabase_admin
            .table("profiles")
            .update({
                "name": profile_update.name
            })
            .eq("id", str(current_user.id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )

        return {
            "message": "Profile updated successfully",
            "profile": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )