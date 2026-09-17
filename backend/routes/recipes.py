from fastapi import APIRouter, Depends, HTTPException

from models.recipe import (
    RecipeGenerationRequest,
    RecipeGenerationResponse,
)
from services.llm_service import generate_recipes
from services.supabase_client import supabase_admin
from services.recipe_matching import analyze_recipe_match
from dependencies.auth import get_current_user


router = APIRouter(
    prefix="/recipes",
    tags=["Recipes"],
)


@router.post(
    "/generate",
    response_model=RecipeGenerationResponse,
)
async def generate_recipe_suggestions(
    request: RecipeGenerationRequest,
    current_user=Depends(get_current_user),
):
    try:
        response = (
            supabase_admin
            .table("profiles")
            .select(
                "diet, preferred_cuisines, allergies, dislikes"
            )
            .eq(
                "id",
                str(current_user.id),
            )
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found",
            )

        profile = response.data[0]

        preferences = {
            "diet": profile.get("diet") or "regular",
            "preferred_cuisines": (
                profile.get("preferred_cuisines")
                or []
            ),
            "allergies": (
                profile.get("allergies")
                or []
            ),
            "dislikes": (
                profile.get("dislikes")
                or []
            ),
        }

        generated_recipes = await generate_recipes(
            ingredients=request.ingredients,
            priority_ingredients=request.priority_ingredients,
            preferences=preferences,
            servings=request.servings,
            max_time_minutes=request.max_time_minutes,
        )

        for recipe in generated_recipes:
            match = analyze_recipe_match(
                available_ingredients=request.ingredients,
                recipe_ingredients=recipe["ingredients"],
            )

            recipe["you_have"] = match["you_have"]
            recipe["you_need"] = match["you_need"]
            recipe["used_count"] = match["used_count"]
            recipe["missing_count"] = match["missing_count"]
            recipe["ingredient_utilization"] = match[
                "ingredient_utilization"
            ]

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
                "you_need": recipe["you_need"],
            })

        saved_response = (
            supabase_admin
            .table("recipes")
            .insert(recipes_to_save)
            .execute()
        )

        final_recipes = []

        for saved_recipe, generated_recipe in zip(
            saved_response.data,
            generated_recipes,
        ):
            final_recipes.append({
                **saved_recipe,
                "you_have": generated_recipe["you_have"],
                "you_need": generated_recipe["you_need"],
                "used_count": generated_recipe["used_count"],
                "missing_count": generated_recipe["missing_count"],
                "ingredient_utilization": generated_recipe[
                    "ingredient_utilization"
                ],
                "priority_used_count": generated_recipe[
                    "priority_used_count"
                ],
            })

        final_recipes.sort(
            key=lambda recipe: (
                -recipe["priority_used_count"],
                -recipe["ingredient_utilization"],
                recipe["missing_count"],
            )
        )

        for index, recipe in enumerate(final_recipes):
            recipe["is_best_match"] = index == 0

        return {
            "recipes": final_recipes
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        ) from error
