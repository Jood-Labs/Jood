import { apiFetch } from './api'


export async function createCartFromShoppingList() {
    return apiFetch('/cart/from-shopping-list', {
        method: 'POST',
    })
}