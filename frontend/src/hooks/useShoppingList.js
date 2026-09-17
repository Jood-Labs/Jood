import { useEffect, useState } from 'react'

const storageKey = 'jood-shopping-list'
const updateEvent = 'jood-shopping-updated'

function readList() {
    // BACKEND: Replace localStorage with the authenticated user's shopping-list endpoint if the list should persist across devices.
    try {
        const value = JSON.parse(
            localStorage.getItem(storageKey) || '[]'
        )

        return Array.isArray(value)
            ? value.filter(
                  (item) =>
                      item &&
                      typeof item.id === 'string' &&
                      typeof item.name === 'string'
              )
            : []
    } catch {
        return []
    }
}

function itemId(recipeId, ingredientName) {
    return JSON.stringify([String(recipeId), ingredientName])
}

export default function useShoppingList() {
    const [items, setItems] = useState(readList)
    const [message, setMessage] = useState('')

    useEffect(() => {
        function sync() {
            setItems(readList())
        }

        window.addEventListener('storage', sync)
        window.addEventListener(updateEvent, sync)

        return () => {
            window.removeEventListener('storage', sync)
            window.removeEventListener(updateEvent, sync)
        }
    }, [])

    function save(next, successMessage = '') {
        // BACKEND: Persist shopping-list mutations through the API and update local state from the server response.
        try {
            localStorage.setItem(storageKey, JSON.stringify(next))
            setItems(next)
            setMessage(successMessage)
            window.dispatchEvent(new Event(updateEvent))
            return true
        } catch {
            setMessage('تعذّر حفظ التغيير على المتصفح')
            return false
        }
    }

    function contains(recipeId, ingredientName) {
        return items.some(
            (item) => item.id === itemId(recipeId, ingredientName)
        )
    }

    function addIngredients(recipe, ingredients) {
        const current = readList()

        const additions = ingredients
            .filter(
                (ingredient) =>
                    !current.some(
                        (item) =>
                            item.id ===
                            itemId(recipe.id, ingredient.name)
                    )
            )
            .map((ingredient) => ({
                id: itemId(recipe.id, ingredient.name),
                name: ingredient.name,
                quantity: ingredient.quantity || '',
                recipeId: String(recipe.id),
                recipeName: recipe.name,
                checked: false,
            }))

        if (additions.length === 0) {
            setMessage('المكونات موجودة في قائمة التسوق')
            return
        }

        save(
            [...current, ...additions],
            'تمت إضافة المكونات لقائمة التسوق'
        )
    }

    function updateQuantity(id, quantity) {
        save(
            readList().map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        )
    }

    function toggleChecked(id) {
        save(
            readList().map((item) =>
                item.id === id
                    ? { ...item, checked: !item.checked }
                    : item
            )
        )
    }

    function removeItem(id) {
        save(
            readList().filter((item) => item.id !== id),
            'تم حذف المكوّن'
        )
    }

    function clearChecked() {
        save(
            readList().filter((item) => !item.checked),
            'تم حذف المكونات اللي توفّرت'
        )
    }

    return {
        items,
        message,
        contains,
        addIngredients,
        updateQuantity,
        toggleChecked,
        removeItem,
        clearChecked,
    }
}