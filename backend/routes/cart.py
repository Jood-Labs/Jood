from fastapi import APIRouter, Depends, HTTPException

from dependencies.auth import get_current_user
from models.cart import CartResponse
from services.store_service import find_product_by_ingredient_key
from services.supabase_client import supabase_admin


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


@router.post("/from-shopping-list", response_model=CartResponse)
def create_cart_from_shopping_list(
    current_user=Depends(get_current_user)
):
    try:
        shopping_response = (
            supabase_admin
            .table("shopping_list_items")
            .select("name, ingredient_key, cart_quantity")
            .eq("user_id", str(current_user.id))
            .eq("is_selected", True)
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