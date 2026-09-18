import { apiFetch } from './api'


export async function getCart() {
    return apiFetch('/shopping-list/cart', {
        method: 'GET',
    })
}