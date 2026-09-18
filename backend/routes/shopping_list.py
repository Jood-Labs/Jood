from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from services.supabase_client import supabase_admin
from dependencies.auth import get_current_user


router = APIRouter(
    prefix="/shopping-list",
    tags=["Shopping List"]
)


class ShoppingListItemUpdate(BaseModel):
    quantity: str | None = None
    cart_quantity: int | None = Field(default=None, ge=1)
    is_selected: bool | None = None

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
                "is_selected": True
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


# Update quantity or selection status
@router.put("/{item_id}")
def update_shopping_list_item(
    item_id: str,
    update: ShoppingListItemUpdate,
    current_user=Depends(get_current_user)
):
    try:
        update_data = {}

        if update.quantity is not None:
            update_data["quantity"] = update.quantity

        if update.cart_quantity is not None:
            update_data["cart_quantity"] = update.cart_quantity

        if update.is_selected is not None:
            update_data["is_selected"] = update.is_selected

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