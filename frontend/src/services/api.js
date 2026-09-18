const API_URL =
    import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'


export function getAccessToken() {
    return (
        localStorage.getItem('access_token') ||
        sessionStorage.getItem('access_token')
    )
}


export function saveSession(
    accessToken,
    refreshToken = null,
    rememberMe = false
) {
    // Remove any old session first
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')

    // Remember me = localStorage
    // Otherwise = sessionStorage
    const storage = rememberMe
        ? localStorage
        : sessionStorage

    storage.setItem('access_token', accessToken)

    if (refreshToken) {
        storage.setItem('refresh_token', refreshToken)
    }
}


export function clearSession() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
}


export async function apiFetch(
    path,
    options = {}
) {
    const token = getAccessToken()

    const headers = {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        let message = 'حدث خطأ أثناء الاتصال بالخادم'

        try {
            const data = await response.json()

            if (typeof data?.detail === 'string') {
                message = data.detail
            }
        } catch {
            // Keep the default message.
        }

        throw new Error(message)
    }

    if (response.status === 204) {
        return null
    }

    return response.json()
}