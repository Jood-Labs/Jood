from pydantic import BaseModel, Field, field_validator


# Input schema

class RecipeGenerationRequest(BaseModel):
    ingredients: list[str] = Field(min_length=1)
    priority_ingredients: list[str] = Field(default_factory=list)
    servings: int = Field(ge=1)
    max_time_minutes: int | None = Field(default=None, ge=1)

    @field_validator("servings", mode="before")
    @classmethod
    def reject_boolean_servings(cls, value):
        if isinstance(value, bool):
            raise ValueError(
                "servings must be a positive integer, not a boolean."
            )
        return value


# Output schema

class RecipeIngredientResponse(BaseModel):
    name: str
    quantity: str
    available: bool
    staple: bool


class GeneratedRecipeResponse(BaseModel):
    name: str
    servings: int
    time_minutes: int
    ingredients: list[RecipeIngredientResponse]
    instructions: list[str]
    

class RecipeGenerationResponse(BaseModel):
    recipes: list[GeneratedRecipeResponse]