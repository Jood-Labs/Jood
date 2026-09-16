from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase_admin
from dependencies.auth import get_current_user


router = APIRouter(
    prefix="/shopping-list",
    tags=["Shopping List"]
)

class ShoppingListItemUpdate(BaseModel):
    quantity: str | None = None
    is_selected: bool | None = None

@router.post("/from-recipe/{recipe_id}")
def add_missing_ingredients_from_recipe(
    recipe_id: str,
    current_user=Depends(get_current_user)
):
    try:
        # 1. Get the recipe and make sure it belongs to the logged-in user
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

        # 2. If the recipe has no missing ingredients
        if not missing_ingredients:
            return {
                "message": "This recipe has no missing ingredients",
                "items": []
            }

        # 3. Prepare missing ingredients for the shopping list
        items_to_add = []

        for ingredient in missing_ingredients:
            items_to_add.append({
                "user_id": str(current_user.id),
                "recipe_id": recipe_id,
                "name": ingredient["name"],
                "quantity": ingredient["quantity"],
                "is_selected": True
            })

        # 4. Save them in Supabase
        insert_response = (
            supabase_admin
            .table("shopping_list_items")
            .insert(items_to_add)
            .execute()
        )

        # 5. Return the added items
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

@router.delete("/{item_id}")
def delete_shopping_list_item(
    item_id: str,
    current_user=Depends(get_current_user)
):
    try:
        # Check that the item belongs to the logged-in user
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

        # Delete the item
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