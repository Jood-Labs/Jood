import { apiFetch } from './api'

export async function getProfile() {
  return apiFetch('/profile/', {
    method: 'GET',
  })
}

export async function updateProfile(name) {
  return apiFetch('/profile/', {
    method: 'PUT',
    body: JSON.stringify({
      name,
    }),
  })
}