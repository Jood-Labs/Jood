from pydantic import BaseModel, Field


class RecipeGenerationRequest(BaseModel):
    ingredients: list[str]
    servings: int = Field(gt=0)
    max_time_minutes: int | None = Field(default=None, gt=0)