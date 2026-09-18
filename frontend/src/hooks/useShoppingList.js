import { useCallback, useEffect, useState } from 'react'

import {
    addRecipeMissingIngredients,
    clearShoppingList,
    deleteShoppingListItem,
    getShoppingList,
    updateShoppingListItem,
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

            setItems(
                list.map((item) => ({
                    ...item,
                    checked: !item.is_selected,
                }))
            )
        } catch (error) {
            setMessage(
                error.message ||
                'تعذّر تحميل قائمة التسوق'
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

    return items.some(
        (item) =>
            item.ingredient_key
                ?.toLowerCase()
                .trim() ===
            ingredientKey
                .toLowerCase()
                .trim()
    )
}

    async function addIngredients(recipe) {
        try {
            await addRecipeMissingIngredients(recipe.id)

            await loadShoppingList()

            setMessage(
                'تمت إضافة المكونات الناقصة لقائمة التسوق'
            )
        } catch (error) {
            setMessage(
                error.message ||
                'تعذّر إضافة المكونات'
            )
        }
    }

    async function updateCartQuantity(id, cartQuantity) {
    if (cartQuantity < 1) return

    try {
        await updateShoppingListItem(id, {
            cart_quantity: cartQuantity,
        })

        await loadShoppingList()
    } catch (error) {
        setMessage(
            error.message ||
            'تعذّر تحديث عدد المنتجات'
        )
    }
}

    async function toggleChecked(id) {
        const item = items.find(
            (currentItem) => currentItem.id === id
        )

        if (!item) return

        try {
            await updateShoppingListItem(id, {
                is_selected: item.checked,
            })

            await loadShoppingList()
        } catch (error) {
            setMessage(
                error.message ||
                'تعذّر تحديث المكوّن'
            )
        }
    }

    async function removeItem(id) {
        try {
            await deleteShoppingListItem(id)

            await loadShoppingList()

            setMessage('تم حذف المكوّن')
        } catch (error) {
            setMessage(
                error.message ||
                'تعذّر حذف المكوّن'
            )
        }
    }

    async function clearChecked() {
        const checkedItems = items.filter(
            (item) => item.checked
        )

        try {
            await Promise.all(
                checkedItems.map((item) =>
                    deleteShoppingListItem(item.id)
                )
            )

            await loadShoppingList()

            setMessage(
                'تم حذف المكونات اللي توفّرت'
            )
        } catch (error) {
            setMessage(
                error.message ||
                'تعذّر حذف المكونات'
            )
        }
    }

    async function clearAll() {
        try {
            await clearShoppingList()

            await loadShoppingList()

            setMessage('تم مسح قائمة التسوق')
        } catch (error) {
            setMessage(
                error.message ||
                'تعذّر مسح قائمة التسوق'
            )
        }
    }

    return {
        items,
        message,
        loading,
        contains,
        addIngredients,
        updateCartQuantity,
        toggleChecked,
        removeItem,
        clearChecked,
        clearAll,
    }
}