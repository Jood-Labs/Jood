def analyze_recipe_match(
    available_ingredients: list[str],
    recipe_ingredients: list[dict],
) -> dict:
    """
    Calculate recipe matching metrics using the grounded
    availability information from llm_service.
    """

    you_have = []
    you_need = []
    used_count = 0

    for ingredient in recipe_ingredients:
        item = {
            "name": ingredient["name"],
            "reference": ingredient["reference"],
            "quantity": ingredient["quantity"],
        }

        if ingredient["available"]:
            you_have.append(item)

            # Staples are available, but they are not counted
            # as user-provided fridge ingredients.
            if not ingredient["staple"]:
                used_count += 1
        else:
            you_need.append(item)

    missing_count = len(you_need)

    total_available = len({
        ingredient.lower().strip()
        for ingredient in available_ingredients
    })

    if total_available > 0:
        ingredient_utilization = round(
            (used_count / total_available) * 100
        )
    else:
        ingredient_utilization = 0

    return {
        "you_have": you_have,
        "you_need": you_need,
        "used_count": used_count,
        "missing_count": missing_count,
        "ingredient_utilization": ingredient_utilization,
    }