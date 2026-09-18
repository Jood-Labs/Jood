import { useNavigate } from 'react-router-dom'
import { getCart } from '../../services/cartApi'
import {
    Check,
    Plus,
    ShoppingBasket,
    ShoppingCart,
} from 'lucide-react'
import useShoppingList from '../../hooks/useShoppingList'

export default function RecipeIngredients({
    recipe,
    navigationState,
}) {
    const navigate = useNavigate()
    const {
    message,
    contains,
    addIngredients,
    addSingleIngredient,
} = useShoppingList()

    const missing = recipe.ingredients.filter(
        (item) => !item.available
    )

    const pending = missing.filter(
    (item) => !contains(item.reference)
)

    const shoppingState = {
        ...navigationState,
        fromRecipeId: recipe.id,
    }

    async function handleAddToCart() {
    await addIngredients(recipe)
}

async function handleAddSingleIngredient(item) {
    await addSingleIngredient(
        recipe.id,
        item.reference
    )
}

async function handleViewCart() {
    try {
        const cart = await getCart()

        navigate('/cart', {
            state: {
                ...shoppingState,
                cart,
            },
        })
    } catch (error) {
        console.error('Failed to load cart:', error)
    }
}

    const actionClass =
        'inline-flex min-h-11 items-center gap-2 text-sm font-medium text-jood-green transition-colors hover:text-jood-green/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green'

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
    <p className="text-sm text-jood-green/70">
        المكونات
    </p>

    {missing.length > 0 && (
        <button
    type="button"
    onClick={
        pending.length > 0
            ? handleAddToCart
            : handleViewCart
    }
    className={
        pending.length > 0
            ? actionClass
            : 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-jood-green px-4 text-sm font-bold text-white transition-colors hover:bg-jood-green/90'
    }
>
    {pending.length > 0 ? (
        <>
            <ShoppingBasket
                size={18}
                aria-hidden="true"
            />
            أضف الناقص للسلة
        </>
    ) : (
        <>
            <Check
                size={17}
                strokeWidth={2.5}
                aria-hidden="true"
            />
            <ShoppingCart
                size={17}
                aria-hidden="true"
            />
            عرض السلة
        </>
    )}
</button>
    )}
</div>

            <ul className="space-y-3">
                {recipe.ingredients.map((item) => {
                    const added = contains(item.reference)

                    return (
                        <li
                            key={item.name}
                            className="flex items-center gap-3 rounded-2xl bg-jood-background p-4"
                        >
                            <div className="min-w-0 flex-1">
                                <h3 className="break-words text-sm font-medium">
                                    {item.name}
                                </h3>

                                <p className="mt-1 text-sm text-jood-green/65">
                                    {item.quantity}
                                </p>

                                <span
                                    className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${
    item.available || added
        ? 'bg-jood-lime/70'
        : 'bg-white text-jood-green/60'
}`}
                                >
                                    {item.staple
    ? 'من الأساسيات المنزلية'
    : item.available
      ? 'موجود ضمن مكوناتك'
      : added
        ? 'مضاف للسلة'
        : 'مكوّن ناقص'}
                                </span>
                            </div>

                           {!item.available && !item.staple && (
    <button
        type="button"
        onClick={
    added
        ? undefined
        : () => handleAddSingleIngredient(item)
}
        disabled={added}
        aria-label={
            added
                ? `${item.name} مضاف للسلة`
                : 'إضافة المكونات الناقصة للسلة'
        }
        className={`flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
            added
                ? 'border-jood-lime bg-jood-lime/70 text-jood-green'
                : 'border-jood-green/15 bg-white text-jood-green hover:bg-jood-lime/50'
        }`}
    >
        {added ? (
            <Check
                size={18}
                strokeWidth={2.5}
                aria-hidden="true"
            />
        ) : (
            <Plus
                size={18}
                aria-hidden="true"
            />
        )}
    </button>
)}

                        </li>
                    )
                })}
            </ul>

            <p className="mt-4 text-xs leading-6 text-jood-green/60">
                التوفر حسب أسماء المكونات اللي أضفتها، تأكّد إن الكمية تكفي
            </p>

            <p
                role="status"
                aria-atomic="true"
                className="mt-2 text-sm text-jood-green/75"
            >
                {message}
            </p>
        </div>
    )
}