from services.supabase_client import supabase_admin


def normalize_ingredient_key(ingredient_key: str) -> str:
    """
    Normalize an ingredient key before matching it
    with the store catalog.
    """
    return " ".join(
        ingredient_key.lower().strip().split()
    )


def get_available_product(ingredient_key: str):
    """
    Find an available product using its canonical ingredient key.
    """
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


def get_canonical_ingredient_key(alias: str):
    """
    Resolve an ingredient alias to the canonical ingredient key
    stored in the products catalog.
    """
    response = (
        supabase_admin
        .table("ingredient_aliases")
        .select("ingredient_key")
        .eq("alias", alias)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]["ingredient_key"]


def find_product_by_ingredient_key(ingredient_key: str):
    """
    Match a recipe ingredient with an available store product.

    Matching strategy:
    1. Normalize the ingredient key.
    2. Try an exact product match.
    3. If no product is found, resolve the ingredient through aliases.
    4. Search again using the canonical ingredient key.
    """

    normalized_key = normalize_ingredient_key(ingredient_key)

    # 1. Try direct match with the store catalog
    product = get_available_product(normalized_key)

    if product:
        return product

    # 2. Try resolving a known alias
    canonical_key = get_canonical_ingredient_key(normalized_key)

    if not canonical_key:
        return None

    # 3. Search the store using the canonical key
    return get_available_product(canonical_key)