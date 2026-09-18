import { useCallback, useEffect, useState } from 'react'

import {
    addRecipeMissingIngredients,
    addSingleRecipeIngredient,
    getShoppingList,
} from '../services/shoppingListApi'


export default function useShoppingList() {
    const [items, setItems] = useState([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)

    const loadShoppingList = useCallback(async () => {
        try {
            const data = await getShoppingList()

            const list = Array.isArray(data)
                ? data
                : data.items || []

            setItems(list)
        } catch (error) {
            setMessage(
                error.message ||
                'تعذّر تحميل بيانات السلة'
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadShoppingList()
    }, [loadShoppingList])

    function contains(ingredientKey) {
        if (!ingredientKey) return false

        const normalizedKey =
            ingredientKey.toLowerCase().trim()

        return items.some(
            (item) =>
                item.ingredient_key
                    ?.toLowerCase()
                    .trim() === normalizedKey
        )
    }

    async function addIngredients(recipe) {
        try {
            await addRecipeMissingIngredients(recipe.id)

            await loadShoppingList()

            setMessage(
                'تمت إضافة المكونات الناقصة للسلة'
            )

            return true
        } catch (error) {
            setMessage(
                error.message ||
                'تعذّر إضافة المكونات'
            )

            return false
        }
    }

    async function addSingleIngredient(recipeId, ingredientKey) {
    try {
        await addSingleRecipeIngredient(
            recipeId,
            ingredientKey
        )

        await loadShoppingList()

        setMessage('تمت إضافة المكوّن للسلة')
        return true
    } catch (error) {
        setMessage(
            error.message || 'تعذّر إضافة المكوّن'
        )
        return false
    }
}

    return {
    items,
    message,
    loading,
    contains,
    addIngredients,
    addSingleIngredient,
}
}