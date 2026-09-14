async def generate_recipes(ingredients, preferences, number_of_people):
    # Mock recipes for now.
    # Later, this will be replaced with the real LLM integration.

    return [
        {
            "name": "Cheese Omelette",
            "ingredients": [
                {"name": "egg", "quantity": "2"},
                {"name": "cheese", "quantity": "50 g"},
                {"name": "tomato", "quantity": "1"}
            ],
            "time_minutes": 15,
            "instructions": [
                "Beat the eggs.",
                "Chop the tomato.",
                "Cook the eggs in a pan.",
                "Add the tomato and cheese."
            ]
        },
        {
            "name": "Tomato Egg Toast",
            "ingredients": [
                {"name": "egg", "quantity": "2"},
                {"name": "tomato", "quantity": "1"},
                {"name": "bread", "quantity": "2 slices"}
            ],
            "time_minutes": 10,
            "instructions": [
                "Toast the bread.",
                "Cook the eggs.",
                "Slice the tomato.",
                "Assemble and serve."
            ]
        }
    ]