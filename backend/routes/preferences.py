from fastapi import APIRouter, HTTPException, Depends

from models.preference import UserPreferences
from services.supabase_client import supabase_admin
from dependencies.auth import get_current_user


router = APIRouter(
    prefix="/preferences",
    tags=["Preferences"]
)


@router.put("/")
def save_preferences(
    preferences: UserPreferences,
    current_user=Depends(get_current_user)
):
    try:
        profile_data = {
            "diet": preferences.diet,
            "preferred_cuisines": preferences.preferred_cuisines,
            "allergies": preferences.allergies,
            "dislikes": preferences.dislikes
        }

        response = (
            supabase_admin
            .table("profiles")
            .update(profile_data)
            .eq("id", str(current_user.id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )

        return {
            "message": "Preferences saved successfully",
            "profile": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
@router.get("/")
def get_preferences(
    current_user=Depends(get_current_user)
):
    try:
        response = (
            supabase_admin
            .table("profiles")
            .select(
                "diet, preferred_cuisines, allergies, dislikes"
            )
            .eq("id", str(current_user.id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )

        return {
            "preferences": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )