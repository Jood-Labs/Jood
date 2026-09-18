import { apiFetch, saveSession } from './api'

export async function login(email, password, rememberMe = false) {
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password,
        }),
    })

    if (!data.access_token) {
        throw new Error('لم يتم استلام رمز تسجيل الدخول')
    }

    saveSession(
        data.access_token,
        data.refresh_token,
        rememberMe
    )

    return data
}


export async function signup(name, email, password) {
    const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
            name,
            email,
            password,
        }),
    })

    return data
}

export async function forgotPassword(email) {
    return apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    })
}

export async function resetPassword(accessToken, password) {
    return apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
            access_token: accessToken,
            password,
        }),
    })
}

export async function changePassword(currentPassword, newPassword) {
    return apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
        }),
    })
}