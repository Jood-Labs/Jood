import { getAccessToken } from './api'

const API_URL =
    import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function detectIngredients(imageFile) {
    const formData = new FormData()

    formData.append('image', imageFile)

    const token = getAccessToken()

    const response = await fetch(`${API_URL}/ingredients/detect`, {
        method: 'POST',
        headers: token
            ? {
                  Authorization: `Bearer ${token}`,
              }
            : {},
        body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            typeof data?.detail === 'string'
                ? data.detail
                : 'تعذّر تحليل الصورة'
        )
    }

    return data
}