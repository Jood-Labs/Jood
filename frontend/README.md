# Jood Frontend — Backend Handoff

Jood (جُود) is an Arabic RTL cooking assistant frontend. The user can add available ingredients manually or upload a fridge/pantry image, review the ingredients, specify preparation time and servings, receive recipe suggestions, open a recipe, save recipes, and build a shopping list.

This repository contains the **frontend only**. Backend, database, authentication, and AI/vision integration are not connected yet.

## Tech stack

- React 19
- Vite 8
- React Router
- Tailwind CSS 4
- Lucide React icons

## Run the project

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

`node_modules` and `dist` are intentionally not included in the handoff.

## Project structure

```text
src/
├── assets/
│   ├── fonts/
│   └── images/
├── components/
│   ├── auth/
│   ├── common/
│   ├── home/
│   ├── landing/
│   ├── preferences/
│   └── recipe/
├── hooks/
│   ├── useSavedRecipes.js
│   └── useShoppingList.js
├── pages/
│   ├── auth/
│   ├── Account.jsx
│   ├── ChangePassword.jsx
│   ├── Home.jsx
│   ├── IngredientReview.jsx
│   ├── Landing.jsx
│   ├── Preferences.jsx
│   ├── PreferenceSetup.jsx
│   ├── RecipeDetails.jsx
│   ├── Recipes.jsx
│   └── ShoppingList.jsx
├── services/
│   └── recipeApi.js
├── App.jsx
├── index.css
└── main.jsx
```

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login` | Login |
| `/signup` | Create account |
| `/reset-password` | Set a new password |
| `/preferences/setup` | Initial preference setup after signup |
| `/app` | Add/upload ingredients |
| `/ingredients/review` | Review ingredients, preparation time, and servings |
| `/recipes` | Recipe suggestions and saved recipes view |
| `/recipes/:recipeId` | Recipe details and cooking steps |
| `/shopping-list` | Shopping list |
| `/preferences` | Edit food preferences |
| `/account` | User profile and account shortcuts |
| `/account/password` | Change password |

## Current frontend flow

```text
Landing
  ↓
Login / Sign Up
  ↓
Preference Setup
  ↓
Home
  ↓
Add ingredients manually and/or select an image
  ↓
Ingredient Review
  ↓
Recipe Suggestions
  ↓
Recipe Details
  ↓
Cooking steps / Saved recipe / Shopping list
```

The UI and navigation are complete. Some actions currently use demo data, browser storage, or preview timers until backend APIs are connected.

## Finding every backend integration point

Search the source code for:

```text
BACKEND:
```

All normal implementation comments were removed. Comments remaining in the source are only backend handoff notes.

Example:

```bash
rg "BACKEND:" src
```

## Backend work required

### 1. Authentication

Current status:

- Login UI is complete but does not authenticate.
- Signup uses preview timers and then opens preference setup.
- Forgot password simulates an email request.
- Reset password simulates success.
- Logout currently navigates directly to `/login`.
- App routes are not protected.

Backend integration should provide login, signup, logout, forgot-password, reset-password, session/current-user, and change-password operations.

Recommended approach: use a server-managed session or secure `HttpOnly` cookie where possible. Do not store passwords in browser storage.

Suggested operations:

```text
POST /auth/login
POST /auth/signup
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/change-password
GET  /auth/me
```

Endpoint names are suggestions only and can be changed to match the backend architecture.

Login input currently available from the UI:

```json
{
  "email": "user@example.com",
  "password": "********",
  "rememberMe": true
}
```

Signup input:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "********"
}
```

After successful signup, keep the current navigation to `/preferences/setup`.

For password reset, the backend should provide a reset token/code in the reset link or reset flow. `ResetPassword.jsx` will need to read that value and send it with the new password.

### 2. User profile

Current file:

```text
src/pages/Account.jsx
```

Current implementation reads and writes this browser key:

```text
jood-profile-draft
```

Replace it with authenticated profile APIs.

Suggested operations:

```text
GET   /users/me
PATCH /users/me
```

Expected profile shape:

```json
{
  "name": "User Name",
  "email": "user@example.com"
}
```

### 3. User food preferences

Current files:

```text
src/pages/PreferenceSetup.jsx
src/pages/Preferences.jsx
```

Preferences are temporarily stored in `sessionStorage` under:

```text
jood-preferences
```

Expected shape:

```json
{
  "diet": "none",
  "allergies": ["nuts"],
  "dislikedIngredients": ["coriander"],
  "cuisines": ["saudi", "italian"]
}
```

Suggested operations:

```text
GET /users/me/preferences
PUT /users/me/preferences
```

These preferences should also be available when requesting recipe suggestions from the AI/backend.

### 4. Ingredient image analysis

Current files:

```text
src/components/home/IngredientUpload.jsx
src/pages/Home.jsx
src/pages/IngredientReview.jsx
```

The frontend currently validates the selected image and keeps the `File` object in React Router state. **No image is uploaded or analyzed yet.**

Supported frontend image types:

```text
image/jpeg
image/png
image/webp
```

Maximum frontend file size:

```text
10 MB
```

Recommended flow:

```text
User selects image
  ↓
Frontend sends multipart/form-data
  ↓
Backend sends image to the AI/vision agent
  ↓
Backend returns detected ingredients
  ↓
Frontend shows them in Ingredient Review
  ↓
User can add/edit/delete detected ingredients before requesting recipes
```

Suggested operation:

```text
POST /ingredients/analyze
Content-Type: multipart/form-data
```

Suggested response:

```json
{
  "ingredients": [
    {
      "id": "ingredient_1",
      "name": "طماطم"
    },
    {
      "id": "ingredient_2",
      "name": "بيض"
    }
  ]
}
```

The user may also manually provide expiry information. Ingredient objects can therefore contain:

```json
{
  "id": "ingredient_1",
  "name": "طماطم",
  "expiringSoon": true,
  "expiryMode": "two-days",
  "expiryDate": "",
  "expiryEstimateRecordedOn": "2026-09-17"
}
```

Possible `expiryMode` values currently used by the UI:

```text
today
two-days
week
date
```

### 5. Recipe suggestions and AI agent

Current service:

```text
src/services/recipeApi.js
```

This is the main recipe data boundary used by the UI. It currently contains demo recipes and local ranking logic.

The recipe pages already call:

```js
getRecipeSuggestions(input)
getRecipeById(id, input)
```

Keep those function interfaces or replace their internals with another service layer. The UI should not need visual changes when the API is connected.

Suggested recipe request:

```json
{
  "ingredients": [
    {
      "id": "ingredient_1",
      "name": "طماطم",
      "expiringSoon": true,
      "expiryMode": "two-days"
    }
  ],
  "preparationTime": "30",
  "servings": 2,
  "preferences": {
    "diet": "none",
    "allergies": [],
    "dislikedIngredients": [],
    "cuisines": ["saudi"]
  }
}
```

Suggested operation:

```text
POST /recipes/suggestions
```

Expected recipe response shape used by the current UI:

```json
{
  "id": "recipe_123",
  "name": "شكشوكة",
  "description": "شكشوكة سريعة بالطماطم والبيض",
  "minutes": 20,
  "servings": 2,
  "nutrition": {
    "calories": 320,
    "protein": 18,
    "carbs": 22,
    "fat": 16,
    "fiber": 5
  },
  "ingredients": [
    {
      "name": "بيض",
      "quantity": "3 حبات",
      "available": true
    },
    {
      "name": "بصل",
      "quantity": "نصف حبة",
      "available": false
    }
  ],
  "steps": [
    {
      "title": "حضّر المكونات",
      "text": "قطّع الطماطم والبصل",
      "seconds": 0
    },
    {
      "title": "اطبخ الخضار",
      "text": "ضع المكونات في المقلاة",
      "seconds": 300
    }
  ],
  "priorityNames": ["طماطم"],
  "priorityDays": 2
}
```

Important fields for the existing UI:

- `id`
- `name`
- `description`
- `minutes`
- `servings`
- `nutrition`
- `ingredients[].name`
- `ingredients[].quantity`
- `ingredients[].available`
- `steps[].title`
- `steps[].text`
- `steps[].seconds`
- `priorityNames`

`priorityNames` is used to show ingredients that should be prioritized because they are close to expiry.

Recipe detail can either reuse the recipe returned in suggestions or use an endpoint such as:

```text
GET /recipes/:recipeId
```

### 6. Saved recipes

Current hook:

```text
src/hooks/useSavedRecipes.js
```

Saved recipe IDs are temporarily stored in `localStorage` under:

```text
jood-saved-recipes
```

Suggested operations:

```text
GET    /users/me/saved-recipes
POST   /users/me/saved-recipes/:recipeId
DELETE /users/me/saved-recipes/:recipeId
```

The UI currently needs an array of saved recipe IDs to determine bookmark state.

Example:

```json
{
  "recipeIds": ["recipe_123", "recipe_456"]
}
```

### 7. Shopping list

Current hook:

```text
src/hooks/useShoppingList.js
```

The shopping list is temporarily stored in `localStorage` under:

```text
jood-shopping-list
```

If the list should sync across devices/accounts, replace the browser storage with API calls.

Current item shape:

```json
{
  "id": "generated-item-id",
  "name": "بصل",
  "quantity": "نصف حبة",
  "recipeId": "recipe_123",
  "recipeName": "شكشوكة",
  "checked": false
}
```

Suggested operations:

```text
GET    /users/me/shopping-list
POST   /users/me/shopping-list/items
PATCH  /users/me/shopping-list/items/:itemId
DELETE /users/me/shopping-list/items/:itemId
```

The shopping list can remain local-only if cross-device persistence is not required.

## Current temporary browser storage

| Key | Storage | Used for | Replace with backend? |
| --- | --- | --- | --- |
| `jood-profile-draft` | localStorage | Account name/email | Yes |
| `jood-preferences` | sessionStorage | Food preferences | Yes |
| `jood-saved-recipes` | localStorage | Saved recipe IDs | Yes |
| `jood-shopping-list` | localStorage | Shopping list | Recommended if account sync is required |

## Important note about navigation state

The current frontend passes ingredient/recipe request context between screens with React Router `location.state`, including the selected image `File`.

This works for the prototype, but route state is temporary and may be lost after a full refresh or direct URL visit.

For production, one of these approaches should be used:

1. Analyze/upload the image before navigating and pass only backend IDs/results between screens.
2. Store the active analysis/request on the backend and return an `analysisId` or `requestId`.
3. Add a frontend global state solution for temporary unsaved flow data while APIs handle persistent data.

A backend-owned `analysisId` is useful if the AI request can take time or if recipe generation needs to be retried.

Example:

```json
{
  "analysisId": "analysis_123",
  "ingredients": [
    { "id": "ingredient_1", "name": "طماطم" }
  ]
}
```

## Error/loading behavior expected by the UI

The frontend already has loading/error states in recipe and authentication screens. API integrations should:

- throw/return an error for non-success responses;
- preserve useful validation messages when possible;
- support request cancellation where `AbortSignal` is passed;
- return JSON with stable field names;
- avoid returning secrets or password values to the frontend.

`recipeApi.js` already receives an optional `AbortSignal`, so the recipe API implementation should pass it to `fetch` or the chosen HTTP client when possible.

## Environment configuration

When API integration starts, use an environment variable instead of hard-coding the server URL.

Example local `.env`:

```text
VITE_API_URL=http://localhost:3000/api
```

Example usage:

```js
const API_URL = import.meta.env.VITE_API_URL
```

Do not commit secrets to frontend environment variables. Any `VITE_` variable is exposed to browser code.

## UI notes

- The interface is Arabic and RTL.
- Page transitions are implemented in `src/components/common/PageTransition.jsx` and `src/index.css`.
- The Jood watermark background is fixed so it does not move when page content height changes.
- The frontend validates image type and size before backend upload.
- Keep the current returned recipe shape to avoid UI changes during backend integration.

## Handoff checklist

Before considering backend integration complete, verify:

- Authentication and session handling work.
- Protected routes reject unauthenticated users.
- Signup saves the user and then preferences.
- Forgot/reset/change password flows work with real APIs.
- User profile loads and updates from the database.
- Preferences load and save from the database.
- Ingredient images are uploaded and analyzed.
- Recipe suggestions use reviewed ingredients, time, servings, and preferences.
- Recipe detail can be loaded by recipe ID.
- Saved recipes persist per user.
- Shopping list persistence behavior is agreed on and implemented if required.
- Logout invalidates/clears the session before redirecting to login.
- Refreshing a protected screen does not lose required server-backed data.
- API errors are shown through the existing UI states.
