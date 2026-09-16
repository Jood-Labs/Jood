from fastapi import APIRouter, Depends, HTTPException

from services.supabase_client import supabase_admin
from dependencies.auth import get_current_user

router = APIRouter(
    prefix="/bookmarks",
    tags=["Bookmarks"]
)


@router.post("/{recipe_id}")
def add_bookmark(
    recipe_id: str,
    current_user=Depends(get_current_user)
):
    try:
        # Make sure the recipe exists and belongs to this user
        recipe_response = (
            supabase_admin
            .table("recipes")
            .select("id")
            .eq("id", recipe_id)
            .eq("user_id", str(current_user.id))
            .execute()
        )

        if not recipe_response.data:
            raise HTTPException(
                status_code=404,
                detail="Recipe not found"
            )

        # Check if the recipe is already bookmarked
        existing_bookmark = (
            supabase_admin
            .table("bookmarks")
            .select("id")
            .eq("user_id", str(current_user.id))
            .eq("recipe_id", recipe_id)
            .execute()
        )

        if existing_bookmark.data:
            raise HTTPException(
                status_code=409,
                detail="Recipe already bookmarked"
            )

        # Save bookmark
        bookmark_response = (
            supabase_admin
            .table("bookmarks")
            .insert({
                "user_id": str(current_user.id),
                "recipe_id": recipe_id
            })
            .execute()
        )

        return {
            "message": "Recipe bookmarked successfully",
            "bookmark": bookmark_response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.get("/")
def get_bookmarks(
    current_user=Depends(get_current_user)
):
    try:
        response = (
            supabase_admin
            .table("bookmarks")
            .select(
                "id, created_at, recipe_id, recipes(*)"
            )
            .eq("user_id", str(current_user.id))
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "bookmarks": response.data
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.delete("/{recipe_id}")
def delete_bookmark(
    recipe_id: str,
    current_user=Depends(get_current_user)
):
    try:
        # Check that this bookmark belongs to the current user
        existing_bookmark = (
            supabase_admin
            .table("bookmarks")
            .select("id")
            .eq("user_id", str(current_user.id))
            .eq("recipe_id", recipe_id)
            .execute()
        )

        if not existing_bookmark.data:
            raise HTTPException(
                status_code=404,
                detail="Bookmark not found"
            )

        # Delete the bookmark
        (
            supabase_admin
            .table("bookmarks")
            .delete()
            .eq("user_id", str(current_user.id))
            .eq("recipe_id", recipe_id)
            .execute()
        )

        return {
            "message": "Bookmark removed successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )