from pydantic import BaseModel


class DetectedIngredient(BaseModel):
    name: str
    name_ar: str = ""
    confidence: float


class IngredientDetectionResponse(BaseModel):
    ingredients: list[DetectedIngredient]