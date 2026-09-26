# Jood Frontend

Arabic, RTL React app for Jood (جُود). Users add ingredients by photo, camera, or manual entry, review them, and get personalized recipes, saved recipes, and a shopping cart. All data comes from the FastAPI backend in [`../backend`](../backend).

**Live:** https://jood-ai.vercel.app

## At a glance

| | |
|---|---|
| Framework | React 19, Vite 8, React Router 7 |
| Styling | Tailwind CSS 4, Thmanyah Sans, Lucide icons |
| Language | Arabic, RTL (`<html lang="ar" dir="rtl">`) |
| Backend | FastAPI, set with `VITE_API_URL` |
| Hosting | Vercel |

## Running it yourself

Requirements: Node.js and npm, plus the backend running locally (see the [root README](../README.md#08--quick-start)).

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Optional `frontend/.env`:

```text
VITE_API_URL=http://127.0.0.1:8000
```

If `VITE_API_URL` is not set, the app uses `http://127.0.0.1:8000`. In production (Vercel) it points to the Render backend. Any `VITE_` variable is visible in browser code, so never put secrets here.

Other commands:

```bash
npm run build        # production build in dist/
npm run preview      # serve the build locally
npm run lint
```

## Project structure

```text
frontend/
├── public/                  Favicons, app icons, web manifest, link preview image
├── index.html               Page title, meta description, Open Graph tags
└── src/
    ├── assets/
    │   ├── fonts/              Thmanyah Sans
    │   └── images/             Logos and recipe images
    ├── components/
    │   ├── auth/               Forgot password dialog
    │   ├── common/             Page transitions
    │   ├── home/               Photo upload and in-browser camera
    │   ├── landing/            Landing page sections
    │   ├── preferences/        Preference option lists
    │   ├── recipe/             Recipe layout and ingredient list
    │   └── ProtectedRoute.jsx  Redirects to /login without a session
    ├── hooks/
    │   ├── useBookmarks.js     Saved recipes state
    │   └── useShoppingList.js  Shopping list state
    ├── pages/                  One file per route (see below)
    ├── services/               One API client per backend route group
    ├── App.jsx                 Routes
    ├── index.css               Theme colors, fonts, global styles
    └── main.jsx
```

## Routes

| Route | Page | Auth |
|---|---|---|
| `/` | Landing | |
| `/login` | Login | |
| `/signup` | Create account | |
| `/reset-password` | Set a new password from the email link | |
| `/preferences/setup` | First-time preferences after signup | Yes |
| `/app` | Home: upload a photo, use the camera, or type ingredients | Yes |
| `/ingredients/review` | Review ingredients, use-first items, time, servings | Yes |
| `/recipes` | Recipe suggestions (`?view=saved` for saved recipes) | Yes |
| `/recipes/:recipeId` | Recipe details and steps | Yes |
| `/cart` | Shopping list matched to store products | Yes |
| `/preferences` | Edit diet, allergies, dislikes, cuisines | Yes |
| `/account` | Profile and logout | Yes |
| `/account/password` | Change password | Yes |

## User flow

```text
Landing → Sign up → Preference setup → Home
  → photo / camera / manual ingredients
  → Ingredient review
  → Recipe suggestions → Recipe details
  → Save recipe  |  Add missing items → Cart
```

## Services and backend endpoints

| Service | Endpoints |
|---|---|
| `api.js` | Shared `apiFetch` helper, session token storage |
| `authApi.js` | `POST /auth/signup`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/change-password` |
| `profileApi.js` | `GET /profile/`, `PUT /profile/` |
| `preferencesApi.js` | `GET /preferences/`, `PUT /preferences/` |
| `ingredientApi.js` | `POST /ingredients/detect` (multipart image) |
| `recipeApi.js` | `POST /recipes/generate`, `GET /recipes/{id}` |
| `bookmarkApi.js` | `GET /bookmarks/`, `POST /bookmarks/{id}`, `DELETE /bookmarks/{id}` |
| `shoppingListApi.js` | `GET /shopping-list/`, `POST /shopping-list/from-recipe/{id}` (and `/item`), `PUT` / `DELETE /shopping-list/{id}`, `DELETE /shopping-list/clear` |
| `cartApi.js` | `GET /shopping-list/cart` |

Protected requests send `Authorization: Bearer <access_token>`.

## Key behaviors

- **Session:** login stores the access token in `localStorage` when "remember me" is checked, otherwise in `sessionStorage`. Logout clears both.
- **Image upload:** accepts JPEG, PNG, and WebP up to 10 MB. Camera captures are sent as JPEG. The backend also handles HEIC.
- **Navigation state:** reviewed ingredients, time, and servings are passed to `/recipes` through React Router `location.state`. Opening or refreshing `/recipes` directly has no ingredients to send, so recipe generation fails and the page shows an error.
- **Errors:** API errors show the backend `detail` message when available, otherwise a default Arabic message.

## Notes

- Theme colors are defined as CSS variables in `src/index.css` (`--color-jood-green`, `--color-jood-lime`, `--color-jood-background`).
- Recipe card images are picked from `src/assets/images/recipes/` by keywords in the recipe name (chicken, pasta, rice, soup, salad, sandwich).
- The Jood watermark background is fixed so it does not shift when page height changes.