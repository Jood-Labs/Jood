from services.supabase_client import supabase_admin


def find_product_by_ingredient_key(ingredient_key: str):
    response = (
        supabase_admin
        .table("products")
        .select("*")
        .eq("ingredient_key", ingredient_key)
        .eq("is_available", True)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]