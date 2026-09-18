import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    Check,
    ShoppingBasket,
    Trash2,
    X,
} from 'lucide-react'

import RecipeLayout from '../components/recipe/RecipeLayout'
import {
    primaryButton,
    secondaryButton,
} from '../components/recipe/recipeStyles'
import useShoppingList from '../hooks/useShoppingList'
import { createCartFromShoppingList } from '../services/cartApi'


function ShoppingItem({
    item,
    updateCartQuantity,
    toggleChecked,
    removeItem,
}) {
    return (
        <li
            className={`min-w-0 rounded-2xl border p-4 ${
                item.checked
                    ? 'border-jood-green/10 bg-jood-lime/20'
                    : 'border-jood-green/10 bg-jood-background'
            }`}
        >
            <div className="flex items-center gap-3">
                <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecked(item.id)}
                        aria-label={`توفّر ${item.name}`}
                        className="size-5 shrink-0 accent-jood-green"
                    />

                    <span
                        className={`min-w-0 break-words font-medium ${
                            item.checked
                                ? 'text-jood-green/55 line-through'
                                : ''
                        }`}
                    >
                        {item.name}
                    </span>
                </label>

                <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`حذف ${item.name}`}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-jood-green/10 focus-visible:outline-2 focus-visible:outline-jood-green"
                >
                    <X size={19} aria-hidden="true" />
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-jood-green/70">
                    الكمية
                </span>

                <div className="flex items-center gap-3 rounded-full bg-white px-2 py-1">
                    <button
                        type="button"
                        disabled={(item.cart_quantity || 1) <= 1}
                        onClick={() =>
                            updateCartQuantity(
                                item.id,
                                (item.cart_quantity || 1) - 1
                            )
                        }
                        className="flex size-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-jood-lime disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`تقليل كمية ${item.name}`}
                    >
                        −
                    </button>

                    <span className="min-w-6 text-center font-medium">
                        {item.cart_quantity || 1}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            updateCartQuantity(
                                item.id,
                                (item.cart_quantity || 1) + 1
                            )
                        }
                        className="flex size-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-jood-lime"
                        aria-label={`زيادة كمية ${item.name}`}
                    >
                        +
                    </button>
                </div>
            </div>

            {item.checked && (
                <p className="mt-3 inline-flex items-center gap-1 text-xs text-jood-green/70">
                    <Check size={15} aria-hidden="true" />
                    توفّر عندك
                </p>
            )}
        </li>
    )
}


export default function ShoppingList() {
    const location = useLocation()
    const navigate = useNavigate()
    const navigationState = location.state

    const {
        items,
        message,
        updateCartQuantity,
        toggleChecked,
        removeItem,
        clearChecked,
    } = useShoppingList()

    const checkedCount = items.filter((item) => item.checked).length
    const remainingCount = items.length - checkedCount

    const returningToAccount =
        navigationState?.returnTo === '/account'

    const backPath = returningToAccount
        ? '/account'
        : navigationState?.fromRecipeId
            ? `/recipes/${encodeURIComponent(
                navigationState.fromRecipeId
            )}`
            : '/recipes'

    async function handleCreateCart() {
        try {
            const cart = await createCartFromShoppingList()

            navigate('/cart', {
                state: {
                    ...navigationState,
                    cart,
                },
            })
        } catch (error) {
            console.error(
                'Failed to create cart:',
                error
            )
        }
    }

    return (
        <RecipeLayout navigationState={navigationState}>
            <div className="flex justify-end">
                <Link
                    to={backPath}
                    state={navigationState}
                    className={secondaryButton}
                >
                    {returningToAccount
                        ? 'العودة لحسابي'
                        : navigationState?.fromRecipeId
                            ? 'العودة للوصفة'
                            : 'العودة للوصفات'}

                    <ArrowLeft
                        size={18}
                        aria-hidden="true"
                    />
                </Link>
            </div>

            <div className="mt-7">
                <h1 className="stylistic-text text-3xl font-bold leading-relaxed sm:text-4xl">
                    قائمة التسوق
                </h1>

                <p className="mt-3 leading-8 text-jood-green/75">
                    كل اللي ناقصك هنا، وعلّم على المكونات اللي توفّرت عندك
                </p>
            </div>

            <p
                role="status"
                aria-atomic="true"
                className="mt-3 text-sm"
            >
                {message}
            </p>

            {items.length === 0 ? (
                <section className="mt-6 rounded-3xl bg-white px-5 py-12 text-center">
                    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-jood-lime/60">
                        <ShoppingBasket
                            size={35}
                            aria-hidden="true"
                        />
                    </div>

                    <h2 className="stylistic-text mt-5 text-2xl font-bold">
                        قائمتك فاضية
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-jood-green/70">
                        افتح وصفة وأضف المكونات الناقصة عشان تلقاها هنا
                    </p>

                    <Link
                        to="/recipes"
                        state={navigationState}
                        className={`${primaryButton} mt-6 hover:bg-jood-lime hover:text-jood-green`}
                    >
                        شوف الوصفات
                    </Link>
                </section>
            ) : (
                <section className="mt-6 rounded-3xl bg-white p-4 sm:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="stylistic-text text-xl font-bold">
                                باقي لك {remainingCount} مكوّن
                            </h2>

                            <p className="mt-2 text-sm text-jood-green/65">
                                توفّر {checkedCount} من {items.length}
                            </p>
                        </div>

                        {checkedCount > 0 && (
                            <button
                                type="button"
                                onClick={clearChecked}
                                className={secondaryButton}
                            >
                                <Trash2
                                    size={17}
                                    aria-hidden="true"
                                />
                                حذف اللي توفّر
                            </button>
                        )}
                    </div>

                    <ul className="mt-5 grid min-w-0 grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <ShoppingItem
                                key={item.id}
                                item={item}
                                updateCartQuantity={
                                    updateCartQuantity
                                }
                                toggleChecked={
                                    toggleChecked
                                }
                                removeItem={
                                    removeItem
                                }
                            />
                        ))}
                    </ul>

                    {remainingCount > 0 && (
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleCreateCart}
                                className={primaryButton}
                            >
                                <ShoppingBasket
                                    size={18}
                                    aria-hidden="true"
                                />
                                أضف المنتجات للسلة
                            </button>
                        </div>
                    )}
                </section>
            )}
        </RecipeLayout>
    )
}