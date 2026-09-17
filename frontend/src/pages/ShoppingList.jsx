import { Link, useLocation } from 'react-router-dom'
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

function ShoppingItem({
    item,
    updateQuantity,
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

            <p className="mt-1 text-xs leading-6 text-jood-green/60">
                لوصفة {item.recipeName}
            </p>

            <label className="mt-4 block">
                <span className="mb-2 block text-sm text-jood-green/75">
                    الكمية المطلوبة
                </span>

                <input
                    type="text"
                    value={item.quantity}
                    maxLength={80}
                    onChange={(event) =>
                        updateQuantity(item.id, event.target.value)
                    }
                    placeholder="مثل: ٣ حبات"
                    className="min-h-12 w-full min-w-0 rounded-xl border border-jood-green/20 bg-white px-3 py-3 text-base text-jood-green placeholder:text-jood-green/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                />
            </label>

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
    const navigationState = location.state

    const {
        items,
        message,
        updateQuantity,
        toggleChecked,
        removeItem,
        clearChecked,
    } = useShoppingList()

    const checkedCount = items.filter((item) => item.checked).length
    const remainingCount = items.length - checkedCount

    const returningToAccount = navigationState?.returnTo === '/account'

    const backPath = returningToAccount
        ? '/account'
        : navigationState?.fromRecipeId
            ? `/recipes/${encodeURIComponent(navigationState.fromRecipeId)}`
            : '/recipes'

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

                    <ArrowLeft size={18} aria-hidden="true" />
                </Link>
            </div>

            <div className="mt-7">
                <h1 className="stylistic-text text-3xl font-bold leading-relaxed sm:text-4xl">
                    قائمة التسوق
                </h1>

                <p className="mt-3 leading-8 text-jood-green/75">
                    كل اللي ناقصك هنا، عدّل الكميات وعلّم على اللي توفّر
                </p>
            </div>

            <p role="status" aria-atomic="true" className="mt-3 text-sm">
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
                                updateQuantity={updateQuantity}
                                toggleChecked={toggleChecked}
                                removeItem={removeItem}
                            />
                        ))}
                    </ul>

                    <p className="mt-5 text-xs leading-6 text-jood-green/60">
                        لو تكرر مكوّن في أكثر من وصفة، تظهر كمية كل وصفة
                        لحالها عشان تراجع إجمالي احتياجك
                    </p>
                </section>
            )}
        </RecipeLayout>
    )
}