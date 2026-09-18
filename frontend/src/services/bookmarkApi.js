import { apiFetch } from './api'

export async function getBookmarks() {
    return apiFetch('/bookmarks/', {
        method: 'GET',
    })
}

export async function addBookmark(recipeId) {
    return apiFetch(`/bookmarks/${recipeId}`, {
        method: 'POST',
    })
}

export async function removeBookmark(recipeId) {
    return apiFetch(`/bookmarks/${recipeId}`, {
        method: 'DELETE',
    })
}