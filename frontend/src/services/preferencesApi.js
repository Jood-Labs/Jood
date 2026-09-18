import { apiFetch } from './api'

export async function getPreferences() {
    return apiFetch('/preferences/', {
        method: 'GET',
    })
}

export async function savePreferences(preferences) {
    return apiFetch('/preferences/', {
        method: 'PUT',
        body: JSON.stringify({
            diet:
                preferences.diet === 'none'
                    ? 'regular'
                    : preferences.diet,

            allergies:
                preferences.allergies || [],

            dislikes:
                preferences.dislikedIngredients || [],

            preferred_cuisines:
                preferences.cuisines || [],
        }),
    })
}