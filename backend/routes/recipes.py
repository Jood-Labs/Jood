from fastapi import APIRouter, Depends, HTTPException

from models.recipe import RecipeGenerationRequest
from services.llm_service import generate_recipes
from services.supabase_client import supabase_admin
from services.recipe_matching import analyze_recipe_match
from dependencies.auth import get_current_user


router = APIRouter(
    prefix="/recipes",
    tags=["Recipes"]
)


@router.post("/generate")
async def generate_recipe_suggestions(
    request: RecipeGenerationRequest,
    current_user=Depends(get_current_user)
):
    try:
        # 1. Get the logged-in user's saved preferences
        response = (
            supabase_admin
            .table("profiles")
            .select(
                "diet, preferred_cuisines, allergies, dislikes"
            )
            .eq("id", str(current_user.id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )

        preferences = response.data[0]

        # 2. Generate recipes
        generated_recipes = await generate_recipes(
            ingredients=request.ingredients,
            preferences=preferences,
            servings=request.servings,
            max_time_minutes=request.max_time_minutes
        )

        # 3. Analyze each recipe against the user's available ingredients
        for recipe in generated_recipes:
            match = analyze_recipe_match(
                available_ingredients=request.ingredients,
                recipe_ingredients=recipe["ingredients"]
            )

            recipe["you_have"] = match["you_have"]
            recipe["you_need"] = match["you_need"]
            recipe["used_count"] = match["used_count"]
            recipe["missing_count"] = match["missing_count"]
            recipe["ingredient_utilization"] = match[
                "ingredient_utilization"
            ]

        # 4. Save the generated recipes in Supabase
        recipes_to_save = []

        for recipe in generated_recipes:
            recipes_to_save.append({
           "user_id": str(current_user.id),
           "name": recipe["name"],
           "servings": request.servings,
           "time_minutes": recipe["time_minutes"],
           "ingredients": recipe["ingredients"],
           "instructions": recipe["instructions"],
           "you_have": recipe["you_have"],
           "you_need": recipe["you_need"]
})

        saved_response = (
            supabase_admin
            .table("recipes")
            .insert(recipes_to_save)
            .execute()
        )

        # 5. Combine saved recipe data with matching results
        final_recipes = []

        for saved_recipe, generated_recipe in zip(
            saved_response.data,
            generated_recipes
        ):
            final_recipes.append({
                **saved_recipe,
                "you_have": generated_recipe["you_have"],
                "you_need": generated_recipe["you_need"],
                "used_count": generated_recipe["used_count"],
                "missing_count": generated_recipe["missing_count"],
                "ingredient_utilization": generated_recipe[
                    "ingredient_utilization"
                ]
            })

        # 6. Rank recipes by ingredient utilization and missing ingredients
            final_recipes.sort(
            key=lambda recipe: (
            -recipe["ingredient_utilization"],
            recipe["missing_count"]
        )
    )

        # 7. Mark the first recipe as the best match
        for index, recipe in enumerate(final_recipes):
         recipe["is_best_match"] = index == 0

        # 8. Return final recipes
        return {
            "recipes": final_recipes
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )