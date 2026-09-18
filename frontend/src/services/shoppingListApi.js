import { apiFetch } from './api'

export async function getShoppingList() {
    return apiFetch('/shopping-list/', {
        method: 'GET',
    })
}

export async function addRecipeMissingIngredients(recipeId) {
    return apiFetch(`/shopping-list/from-recipe/${recipeId}`, {
        method: 'POST',
    })
}

export async function updateShoppingListItem(
    itemId,
    updates
) {
    return apiFetch(`/shopping-list/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    })
}

export async function deleteShoppingListItem(itemId) {
    return apiFetch(`/shopping-list/${itemId}`, {
        method: 'DELETE',
    })
}

export async function clearShoppingList() {
    return apiFetch('/shopping-list/clear', {
        method: 'DELETE',
    })
}