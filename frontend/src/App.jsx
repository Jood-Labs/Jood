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
import Cart from './pages/Cart'
import Account from './pages/Account'
import ChangePassword from './pages/ChangePassword'
import ProtectedRoute from './components/ProtectedRoute'


function AppRoutes() {
    const location = useLocation()

    return (
        <PageTransition key={location.key}>
            <Routes location={location}>
                {/* Public routes */}
                <Route
                    path="/"
                    element={<Landing />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<SignUp />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

                {/* Protected routes */}
                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/preferences/setup"
                    element={
                        <ProtectedRoute>
                            <PreferenceSetup />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/preferences"
                    element={
                        <ProtectedRoute>
                            <Preferences />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/ingredients/review"
                    element={
                        <ProtectedRoute>
                            <IngredientReview />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recipes"
                    element={
                        <ProtectedRoute>
                            <Recipes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recipes/:recipeId"
                    element={
                        <ProtectedRoute>
                            <RecipeDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/shopping-list"
                    element={
                        <ProtectedRoute>
                            <ShoppingList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/account"
                    element={
                        <ProtectedRoute>
                            <Account />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/account/password"
                    element={
                        <ProtectedRoute>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
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