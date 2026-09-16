from pydantic import BaseModel, Field


class UserPreferences(BaseModel):
    diet: str = "regular"
    preferred_cuisines: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    dislikes: list[str] = Field(default_factory=list)