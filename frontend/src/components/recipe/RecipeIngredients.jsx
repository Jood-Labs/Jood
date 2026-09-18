import { Link } from 'react-router-dom'
import { Check, Plus, ShoppingBasket } from 'lucide-react'
import useShoppingList from '../../hooks/useShoppingList'

export default function RecipeIngredients({
    recipe,
    navigationState,
}) {
    const {
        message,
        contains,
        addIngredients,
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

    const actionClass =
        'inline-flex min-h-11 items-center gap-2 text-sm font-medium text-jood-green transition-colors hover:text-jood-green/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green'

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <p className="text-sm text-jood-green/70">
                    {missing.length > 0
    ? `${missing.length} مكونات ناقصة`
    : 'ما تحتاج مكونات إضافية'}
                </p>

                {pending.length > 0 ? (
                    <button
                        type="button"
                        onClick={() =>
                            addIngredients(recipe, pending)
                        }
                        className={actionClass}
                    >
                        <ShoppingBasket
                            size={18}
                            aria-hidden="true"
                        />
                        أضف الناقص للتسوق
                    </button>
                ) : (
                    <Link
                        to="/shopping-list"
                        state={shoppingState}
                        className={actionClass}
                    >
                        <ShoppingBasket
                            size={18}
                            aria-hidden="true"
                        />
                        عرض قائمة التسوق
                    </Link>
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
                                        item.available
                                            ? 'bg-jood-lime/70'
                                            : 'bg-white text-jood-green/60'
                                    }`}
                                >
                                    {item.staple
    ? 'من الأساسيات المنزلية'
    : item.available
      ? 'موجود ضمن مكوناتك'
      : 'مكوّن ناقص'}
                                </span>
                            </div>

                            {!item.available && (
    <button
        type="button"
        disabled={added}
        onClick={() =>
            addIngredients(recipe, [item])
        }
        aria-label={
            added
                ? `${item.name} مضاف لقائمة التسوق`
                : `إضافة ${item.name} لقائمة التسوق`
        }
        title={
            added
                ? 'مضاف لقائمة التسوق'
                : 'إضافة لقائمة التسوق'
        }
        className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green ${
            added
                ? 'cursor-default bg-jood-lime/60'
                : 'bg-white hover:bg-jood-lime'
        }`}
    >
        {added ? (
            <Check
                size={19}
                aria-hidden="true"
            />
        ) : (
            <Plus
                size={19}
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