<div align="center">

# Jood | جُود

*"الجود من الموجود" - generosity from what you have*

</div>

An app that turns "what should I cook?" into a fast, confident decision, starting from a photo of what's already in the fridge.

## At a Glance

| | |
|---|---|
| **Input** | Photo of fridge contents |
| **Output** | Multiple recipe suggestions matched to available ingredients |
| **Core value** | Reduces food waste and daily meal-decision friction |
| **Personalization** | Dietary preferences, calories, protein, prep time, servings, budget |

## Key Features

- **Ingredient detection from a photo.** The user photographs their fridge, and the app identifies the ingredients present. Detected items can be manually corrected, and corrections improve future detection accuracy.
- **Recipe suggestions.** Multiple recipes are proposed based on the detected ingredients and the user's dietary preferences.
- **Missing ingredients to cart.** Any ingredients a recipe needs but the fridge lacks are flagged and can be added directly to a shopping cart.
- **Constraints-aware suggestions.** Recipes account for prep time, number of people being cooked for, and budget.
- **Nutrition-based filtering.** Options can be filtered by calorie count and protein content.
- **Expiry alerts.** The app flags ingredients nearing spoilage and suggests recipes that use them up before they go to waste.

## How It Works

1. User photographs the fridge.
2. App detects ingredients (user can correct any misdetections).
3. App suggests recipes matched to ingredients and dietary preferences.
4. Missing ingredients for a chosen recipe are listed and can be added to the shopping cart.
5. App continuously flags near-expiry items and suggests ways to use them.

## Data Quality and Caveats

- Ingredient detection accuracy depends on image quality and lighting, and improves over time as users correct misdetections.
- Nutrition and calorie estimates depend on the accuracy of the underlying recipe/ingredient database.
