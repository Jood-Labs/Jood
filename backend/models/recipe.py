from pydantic import BaseModel
from models.preference import UserPreferences


class RecipeGenerationRequest(BaseModel):
    ingredients: list[str]
    preferences: UserPreferences
    number_of_people: int