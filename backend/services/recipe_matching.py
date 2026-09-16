def analyze_recipe_match(
    available_ingredients,
    recipe_ingredients
):
    available = {
        ingredient.lower().strip()
        for ingredient in available_ingredients
    }

    you_have = []
    you_need = []

    for ingredient in recipe_ingredients:
        ingredient_name = ingredient["name"].lower().strip()

        if ingredient_name in available:
            you_have.append(ingredient)
        else:
            you_need.append(ingredient)

    used_count = len(you_have)
    missing_count = len(you_need)

    if len(available) > 0:
        utilization = round(
            (used_count / len(available)) * 100
        )
    else:
        utilization = 0

    return {
        "you_have": you_have,
        "you_need": you_need,
        "used_count": used_count,
        "missing_count": missing_count,
        "ingredient_utilization": utilization
    }