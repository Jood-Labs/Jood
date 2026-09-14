from pydantic import BaseModel, Field


class UserPreferences(BaseModel):
    diet: str = "regular"
    allergies: list[str] = Field(default_factory=list)
    dislikes: list[str] = Field(default_factory=list)