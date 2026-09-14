from pydantic import BaseModel

class DetectedIngredient(BaseModel):
    name: str
    confidence: float

class IngredientDetectionResponse(BaseModel):
    ingredients: list[DetectedIngredient]