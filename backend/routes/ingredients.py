from fastapi import APIRouter, UploadFile, File
from services.cv_service import detect_ingredients_from_image
from models.ingredient import IngredientDetectionResponse

router = APIRouter(
    prefix="/ingredients",
    tags=["Ingredients"]
)


@router.post("/detect", response_model=IngredientDetectionResponse)
async def detect_ingredients(image: UploadFile = File(...)):

    ingredients = await detect_ingredients_from_image(image)

    return {
        "ingredients": ingredients
    }