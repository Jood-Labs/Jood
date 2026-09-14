from fastapi import APIRouter
from models.recipe import RecipeGenerationRequest
from services.llm_service import generate_recipes

router = APIRouter(
    prefix="/recipes",
    tags=["Recipes"]
)


@router.post("/generate")
async def generate_recipe_suggestions(request: RecipeGenerationRequest):

    recipes = await generate_recipes(
        ingredients=request.ingredients,
        preferences=request.preferences,
        number_of_people=request.number_of_people
    )

    return {
        "recipes": recipes
    }