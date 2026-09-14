from fastapi import APIRouter
from models.preference import UserPreferences

router = APIRouter(
    prefix="/preferences",
    tags=["Preferences"]
)


@router.post("/")
async def save_preferences(preferences: UserPreferences):
    return {
        "message": "Preferences received successfully",
        "preferences": preferences
    }