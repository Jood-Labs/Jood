import { useCallback, useEffect, useState } from 'react'

import {
    addBookmark,
    getBookmarks,
    removeBookmark,
} from '../services/bookmarkApi'

export default function useBookmarks() {
    const [savedIds, setSavedIds] = useState([])
    const [savedRecipes, setSavedRecipes] = useState([])
    const [saveMessage, setSaveMessage] = useState('')
    const [loading, setLoading] = useState(true)

    const loadBookmarks = useCallback(async () => {
        try {
            setLoading(true)

            const data = await getBookmarks()

            const bookmarks = Array.isArray(data)
                ? data
                : data.bookmarks || []

            // IDs of saved recipes
            setSavedIds(
                bookmarks
                    .map((bookmark) => bookmark.recipe_id)
                    .filter(Boolean)
            )

            // Full saved recipe data returned from Supabase
            setSavedRecipes(
                bookmarks
                    .map((bookmark) => bookmark.recipes)
                    .filter(Boolean)
            )
        } catch (error) {
            setSaveMessage(
                error.message || 'تعذّر تحميل المحفوظات'
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadBookmarks()
    }, [loadBookmarks])

    async function toggleSaved(recipe) {
        const exists = savedIds.includes(recipe.id)

        try {
            if (exists) {
                await removeBookmark(recipe.id)

                setSaveMessage(
                    `تمت إزالة ${recipe.name} من المحفوظات`
                )
            } else {
                await addBookmark(recipe.id)

                setSaveMessage(
                    `تم حفظ ${recipe.name}`
                )
            }

            // Reload bookmarks from backend
            // so IDs and recipe data stay synchronized
            await loadBookmarks()
        } catch (error) {
            setSaveMessage(
                error.message || 'تعذّر تحديث المحفوظات'
            )
        }
    }

    return {
        savedIds,
        savedRecipes,
        toggleSaved,
        saveMessage,
        loading,
    }
}