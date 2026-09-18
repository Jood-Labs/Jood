import { getAccessToken } from './api'

const API_URL =
    import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'


function buildRecipeRequest(input = {}) {
    const ingredientItems = Array.isArray(input.ingredients)
        ? input.ingredients
        : []

    const ingredients = ingredientItems
        .map((item) => item.name?.trim())
        .filter(Boolean)

    const priorityIngredients = ingredientItems
        .filter((item) => item.expiringSoon)
        .map((item) => item.name?.trim())
        .filter(Boolean)

    return {
        ingredients,
        priority_ingredients: priorityIngredients,
        servings: Number(input.servings) || 2,
        max_time_minutes:
            input.preparationTime === 'any'
                ? null
                : Number(input.preparationTime) || null,
    }
}

function adaptRecipe(recipe, input = {}) {
    const priorityIngredients = Array.isArray(input.ingredients)
        ? input.ingredients
              .filter((item) => item.expiringSoon)
              .map((item) => item.name?.trim())
              .filter(Boolean)
        : []

    const usedReferences = new Set(
        (recipe.ingredients || [])
            .filter(
                (ingredient) =>
                    ingredient.available && !ingredient.staple
            )
            .map((ingredient) =>
                ingredient.reference?.toLocaleLowerCase()
            )
    )

    const priorityNames = priorityIngredients.filter((name) =>
        (recipe.ingredients || []).some(
            (ingredient) =>
                ingredient.available &&
                ingredient.name
                    ?.toLocaleLowerCase()
                    .includes(name.toLocaleLowerCase())
        )
    )

    return {
        ...recipe,

        minutes: recipe.time_minutes,

        description: `تستخدم ${recipe.used_count} من مكوناتك، ${
            recipe.missing_count === 0
                ? 'وكل المكونات الأساسية متوفرة عندك'
                : `وتحتاج ${recipe.missing_count} مكونات إضافية`
        }`,

        ingredients: recipe.ingredients || [],

        steps: (recipe.instructions || []).map(
            (instruction, index) => ({
                title: `الخطوة ${index + 1}`,
                text: instruction,
                seconds: 0,
            })
        ),

        priorityNames,

        usedReferences: [...usedReferences],
    }
}

export async function getRecipeSuggestions(
    input = {},
    { signal } = {}
) {
    const token = getAccessToken()

    if (!token) {
        throw new Error('يجب تسجيل الدخول أولاً')
    }

    const requestBody = buildRecipeRequest(input)

console.log('Recipe request:', requestBody)

const response = await fetch(`${API_URL}/recipes/generate`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
    signal,
})

    if (!response.ok) {
        let message = 'تعذّر تحميل الوصفات'

        try {
            const data = await response.json()

            if (typeof data?.detail === 'string') {
                message = data.detail
            }
        } catch {
            // Keep the default error message.
        }

        throw new Error(message)
    }

    const data = await response.json()

    return (data.recipes || []).map((recipe) =>
        adaptRecipe(recipe, input)
    )
}

export async function getRecipeById(
    id,
    input = {},
    { signal } = {}
) {
    const token = getAccessToken()

    if (!token) {
        throw new Error('يجب تسجيل الدخول أولاً')
    }

    const response = await fetch(
        `${API_URL}/recipes/${id}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            signal,
        }
    )

    if (!response.ok) {
        let message = 'تعذّر تحميل الوصفة'

        try {
            const data = await response.json()

            if (typeof data?.detail === 'string') {
                message = data.detail
            }
        } catch {
            // Keep the default error message.
        }

        throw new Error(message)
    }

    const data = await response.json()

    return adaptRecipe(data.recipe, input)
}