import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import PageTransition from './components/common/PageTransition'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'
import ResetPassword from './pages/auth/ResetPassword'
import PreferenceSetup from './pages/PreferenceSetup'
import Preferences from './pages/Preferences'
import IngredientReview from './pages/IngredientReview'
import Recipes from './pages/Recipes'
import RecipeDetails from './pages/RecipeDetails'
import ShoppingList from './pages/ShoppingList'
import Account from './pages/Account'
import ChangePassword from './pages/ChangePassword'

function AppRoutes() {
    // BACKEND: After authentication is connected, protect app/account routes using the server-backed auth/session state.
    const location = useLocation()

    return (
        <PageTransition key={location.key}>
            <Routes location={location}>
                <Route path="/" element={<Landing />} />
                <Route path="/app" element={<Home />} />

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

                <Route
                    path="/preferences/setup"
                    element={<PreferenceSetup />}
                />

                <Route
                    path="/preferences"
                    element={<Preferences />}
                />

                <Route
                    path="/ingredients/review"
                    element={<IngredientReview />}
                />

                <Route
                    path="/recipes"
                    element={<Recipes />}
                />

                <Route
                    path="/recipes/:recipeId"
                    element={<RecipeDetails />}
                />

                <Route
                    path="/shopping-list"
                    element={<ShoppingList />}
                />

                <Route
                    path="/account"
                    element={<Account />}
                />

                <Route
                    path="/account/password"
                    element={<ChangePassword />}
                />
            </Routes>
        </PageTransition>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    )
}
