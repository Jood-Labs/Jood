import { useEffect, useState } from 'react'

const storageKey = 'jood-saved-recipes'

function readSaved() {
    // BACKEND: Replace localStorage with the authenticated user's saved-recipes endpoint.
    try {
        const stored = JSON.parse(
            localStorage.getItem(storageKey) || '[]'
        )

        return Array.isArray(stored)
            ? [...new Set(stored.filter((id) => typeof id === 'string'))]
            : []
    } catch {
        return []
    }
}

export default function useSavedRecipes() {
    const [savedIds, setSavedIds] = useState(readSaved)
    const [saveMessage, setSaveMessage] = useState('')

    useEffect(() => {
        function sync() {
            setSavedIds(readSaved())
        }

        window.addEventListener('storage', sync)
        window.addEventListener('jood-saved-updated', sync)

        return () => {
            window.removeEventListener('storage', sync)
            window.removeEventListener('jood-saved-updated', sync)
        }
    }, [])

    function toggleSaved(recipe) {
        // BACKEND: Save/remove recipe.id through the saved-recipes API and update savedIds from the server response.
        const current = readSaved()
        const exists = current.includes(recipe.id)

        const next = exists
            ? current.filter((id) => id !== recipe.id)
            : [...current, recipe.id]

        try {
            localStorage.setItem(storageKey, JSON.stringify(next))
            setSavedIds(next)

            window.dispatchEvent(new Event('jood-saved-updated'))

            setSaveMessage(
                exists
                    ? `تمت إزالة ${recipe.name} من المحفوظات`
                    : `تم حفظ ${recipe.name}`
            )
        } catch {
            setSaveMessage('تعذّر حفظ التغيير على المتصفح')
        }
    }

    return { savedIds, toggleSaved, saveMessage }
}