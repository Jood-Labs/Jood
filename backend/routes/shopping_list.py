from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from services.supabase_client import supabase_admin
from dependencies.auth import get_current_user
from services.store_service import find_product_by_ingredient_key
from models.cart import CartResponse


router = APIRouter(
    prefix="/shopping-list",
    tags=["Shopping List"]
)

class ShoppingListItemUpdate(BaseModel):
    cart_quantity: int | None = Field(default=None, ge=1)

class SingleIngredientRequest(BaseModel):
    ingredient_key: str

# Add missing ingredients from a recipe to the shopping list
@router.post("/from-recipe/{recipe_id}")
def add_missing_ingredients_from_recipe(
    recipe_id: str,
    current_user=Depends(get_current_user)
):
    try:
        recipe_response = (
            supabase_admin
            .table("recipes")
            .select("id, you_need")
            .eq("id", recipe_id)
            .eq("user_id", str(current_user.id))
            .execute()
        )

        if not recipe_response.data:
            raise HTTPException(
                status_code=404,
                detail="Recipe not found"
            )

        recipe = recipe_response.data[0]
        missing_ingredients = recipe["you_need"] or []

        if not missing_ingredients:
            return {
                "message": "This recipe has no missing ingredients",
                "items": []
            }

        existing_response = (
            supabase_admin
            .table("shopping_list_items")
            .select("ingredient_key")
            .eq("user_id", str(current_user.id))
            .execute()
        )

        existing_keys = {
            item["ingredient_key"]
            for item in existing_response.data
            if item.get("ingredient_key")
        }

        items_to_add = []

        for ingredient in missing_ingredients:
            ingredient_key = ingredient["reference"]

            if ingredient_key in existing_keys:
                continue

            items_to_add.append({
                "user_id": str(current_user.id),
                "recipe_id": recipe_id,
                "name": ingredient["name"],
                "ingredient_key": ingredient_key,
                "quantity": ingredient["quantity"],
            })

        if not items_to_add:
            return {
                "message": "Missing ingredients are already in the shopping list",
                "items": []
            }

        insert_response = (
            supabase_admin
            .table("shopping_list_items")
            .insert(items_to_add)
            .execute()
        )

        return {
            "message": "Missing ingredients added to shopping list",
            "items": insert_response.data
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.post("/from-recipe/{recipe_id}/item")
def add_single_ingredient_from_recipe(
    recipe_id: str,
    request: SingleIngredientRequest,
    current_user=Depends(get_current_user)
):
    try:
        # Get the recipe and make sure it belongs to the user
        recipe_response = (
            supabase_admin
            .table("recipes")
            .select("id, you_need")
            .eq("id", recipe_id)
            .eq("user_id", str(current_user.id))
            .execute()
        )

        if not recipe_response.data:
            raise HTTPException(
                status_code=404,
                detail="Recipe not found"
            )

        recipe = recipe_response.data[0]
        missing_ingredients = recipe["you_need"] or []

        # Find the requested ingredient inside the recipe's
        # actual missing ingredients
        ingredient = next(
            (
                item
                for item in missing_ingredients
                if item.get("reference") == request.ingredient_key
            ),
            None
        )

        if not ingredient:
            raise HTTPException(
                status_code=404,
                detail="Missing ingredient not found in this recipe"
            )

        # Check if this ingredient is already in the user's cart
        existing_response = (
            supabase_admin
            .table("shopping_list_items")
            .select("id")
            .eq("user_id", str(current_user.id))
            .eq("ingredient_key", request.ingredient_key)
            .execute()
        )

        if existing_response.data:
            return {
                "message": "Ingredient is already in the shopping list",
                "item": existing_response.data[0]
            }

        # Add only this ingredient
        insert_response = (
            supabase_admin
            .table("shopping_list_items")
            .insert({
                "user_id": str(current_user.id),
                "recipe_id": recipe_id,
                "name": ingredient["name"],
                "ingredient_key": ingredient["reference"],
                "quantity": ingredient["quantity"],
            })
            .execute()
        )

        return {
            "message": "Ingredient added to shopping list",
            "item": insert_response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

# Get the logged-in user's shopping list
@router.get("/")
def get_shopping_list(
    current_user=Depends(get_current_user)
):
    try:
        response = (
            supabase_admin
            .table("shopping_list_items")
            .select("*")
            .eq("user_id", str(current_user.id))
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "items": response.data
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.get("/cart", response_model=CartResponse)
def get_cart(
    current_user=Depends(get_current_user)
):
    try:
        shopping_response = (
            supabase_admin
            .table("shopping_list_items")
            .select("id, name, ingredient_key, cart_quantity")
            .eq("user_id", str(current_user.id))
            .execute()
        )

        products = []
        unmatched_ingredients = []
        total_price = 0.0

        for item in shopping_response.data:
            ingredient_key = item.get("ingredient_key")
            cart_quantity = item.get("cart_quantity") or 1

            if not ingredient_key:
                unmatched_ingredients.append({
                    "shopping_list_item_id": item["id"],
                    "name": item["name"],
                    "ingredient_key": "",
                    "cart_quantity": cart_quantity
                })
                continue

            product = find_product_by_ingredient_key(
                ingredient_key
            )

            if not product:
                unmatched_ingredients.append({
                    "shopping_list_item_id": item["id"],
                    "name": item["name"],
                    "ingredient_key": ingredient_key,
                    "cart_quantity": cart_quantity
                })
                continue

            unit_price = float(product["price"])

            line_total = round(
                unit_price * cart_quantity,
                2
            )

            products.append({
                "shopping_list_item_id": item["id"],
                "product_id": product["id"],
                "name": product["name"],
                "ingredient_key": product["ingredient_key"],
                "category": product["category"],
                "unit_price": unit_price,
                "cart_quantity": cart_quantity,
                "line_total": line_total,
                "image_url": product.get("image_url")
            })

            total_price += line_total

        return {
            "products": products,
            "unmatched_ingredients": unmatched_ingredients,
            "total_price": round(total_price, 2)
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# Update quantity or selection status
@router.put("/{item_id}")
def update_shopping_list_item(
    item_id: str,
    update: ShoppingListItemUpdate,
    current_user=Depends(get_current_user)
):
    try:
        update_data = {}

        if update.cart_quantity is not None:
            update_data["cart_quantity"] = update.cart_quantity

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No fields to update"
            )

        response = (
            supabase_admin
            .table("shopping_list_items")
            .update(update_data)
            .eq("id", item_id)
            .eq("user_id", str(current_user.id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Shopping list item not found"
            )

        return {
            "message": "Shopping list item updated successfully",
            "item": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# Clear the entire shopping list
# IMPORTANT: This route must stay before /{item_id}
@router.delete("/clear")
def clear_shopping_list(
    current_user=Depends(get_current_user)
):
    try:
        (
            supabase_admin
            .table("shopping_list_items")
            .delete()
            .eq("user_id", str(current_user.id))
            .execute()
        )

        return {
            "message": "Shopping list cleared successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# Delete one shopping list item
@router.delete("/{item_id}")
def delete_shopping_list_item(
    item_id: str,
    current_user=Depends(get_current_user)
):
    try:
        existing_item = (
            supabase_admin
            .table("shopping_list_items")
            .select("id")
            .eq("id", item_id)
            .eq("user_id", str(current_user.id))
            .execute()
        )

        if not existing_item.data:
            raise HTTPException(
                status_code=404,
                detail="Shopping list item not found"
            )

        (
            supabase_admin
            .table("shopping_list_items")
            .delete()
            .eq("id", item_id)
            .eq("user_id", str(current_user.id))
            .execute()
        )

        return {
            "message": "Shopping list item deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )