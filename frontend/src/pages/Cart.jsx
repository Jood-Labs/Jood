import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
    X,
} from 'lucide-react'

import RecipeLayout from '../components/recipe/RecipeLayout'
import {
    primaryButton,
    secondaryButton,
} from '../components/recipe/recipeStyles'
import { getCart } from '../services/cartApi'
import {
    clearShoppingList,
    deleteShoppingListItem,
    updateShoppingListItem,
} from '../services/shoppingListApi'


function CartProduct({
    product,
    updating,
    onQuantityChange,
    onDelete,
}) {
    return (
        <li className="flex flex-col gap-4 rounded-2xl border border-jood-green/10 bg-jood-background p-4 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <ShoppingCart
                        size={28}
                        className="text-jood-green/40"
                        aria-hidden="true"
                    />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <h2 className="font-bold">
                    {product.name}
                </h2>

                <p className="mt-1 text-sm text-jood-green/65">
                    {product.category}
                </p>

                <p className="mt-2 text-sm">
                    {product.unit_price.toFixed(2)} ر.س
                    {' × '}
                    {product.cart_quantity}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-full border border-jood-green/15 bg-white">
                        <button
                            type="button"
                            disabled={
                                updating ||
                                product.cart_quantity <= 1
                            }
                            onClick={() =>
                                onQuantityChange(
                                    product,
                                    product.cart_quantity - 1
                                )
                            }
                            aria-label={`تقليل كمية ${product.name}`}
                            className="flex size-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Minus size={16} aria-hidden="true" />
                        </button>

                        <span className="min-w-8 text-center text-sm font-bold">
                            {product.cart_quantity}
                        </span>

                        <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                                onQuantityChange(
                                    product,
                                    product.cart_quantity + 1
                                )
                            }
                            aria-label={`زيادة كمية ${product.name}`}
                            className="flex size-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Plus size={16} aria-hidden="true" />
                        </button>
                    </div>

                    <button
                        type="button"
                        disabled={updating}
                        onClick={() => onDelete(product)}
                        aria-label={`حذف ${product.name} من السلة`}
                        className="flex size-9 items-center justify-center rounded-full text-jood-green/60 transition-colors hover:bg-white hover:text-jood-green disabled:opacity-40"
                    >
                        <Trash2
                            size={17}
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>

            <div className="shrink-0 text-left">
                <p className="text-sm text-jood-green/60">
                    الإجمالي
                </p>

                <p className="mt-1 text-lg font-bold">
                    {product.line_total.toFixed(2)} ر.س
                </p>
            </div>
        </li>
    )
}


export default function Cart() {
    const location = useLocation()
    const navigationState = location.state

    const [cart, setCart] = useState(
        navigationState?.cart || null
    )

    const [loading, setLoading] = useState(
        !navigationState?.cart
    )

    const [updatingItemId, setUpdatingItemId] =
        useState(null)

    const [isStoreDialogOpen, setIsStoreDialogOpen] =
        useState(false)

    const [isClearDialogOpen, setIsClearDialogOpen] =
        useState(false)

    const [isClearing, setIsClearing] =
        useState(false)


    async function loadCart() {
        try {
            const data = await getCart()
            setCart(data)
        } catch (error) {
            console.error('Failed to load cart:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleQuantityChange(product, newQuantity) {
        if (newQuantity < 1) return

        try {
            setUpdatingItemId(product.shopping_list_item_id)

            await updateShoppingListItem(
                product.shopping_list_item_id,
                {
                    cart_quantity: newQuantity,
                }
            )

            await loadCart()
        } catch (error) {
            console.error(
                'Failed to update cart quantity:',
                error
            )
        } finally {
            setUpdatingItemId(null)
        }
    }


    async function handleDelete(product) {
        try {
            setUpdatingItemId(product.shopping_list_item_id)

            await deleteShoppingListItem(
                product.shopping_list_item_id
            )

            await loadCart()
        } catch (error) {
            console.error(
                'Failed to delete cart item:',
                error
            )
        } finally {
            setUpdatingItemId(null)
        }
    }

    async function handleClearCart() {
        try {
            setIsClearing(true)

            await clearShoppingList()
            await loadCart()

            setIsClearDialogOpen(false)
        } catch (error) {
            console.error(
                'Failed to clear cart:',
                error
            )
        } finally {
            setIsClearing(false)
        }
    }


    useEffect(() => {
        loadCart()
    }, [])

    if (loading) {
        return (
            <RecipeLayout navigationState={navigationState}>
                <section className="mt-8 rounded-3xl bg-white px-5 py-12 text-center">
                    <p className="text-jood-green/70">
                        جاري تحميل السلة...
                    </p>
                </section>
            </RecipeLayout>
        )
    }

    if (!cart) {
        return (
            <RecipeLayout navigationState={navigationState}>
                <section className="mt-8 rounded-3xl bg-white px-5 py-12 text-center">
                    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-jood-lime/60">
                        <ShoppingCart
                            size={34}
                            aria-hidden="true"
                        />
                    </div>

                    <h1 className="stylistic-text mt-5 text-2xl font-bold">
                        السلة غير متوفرة
                    </h1>

                    <p className="mt-3 text-sm text-jood-green/70">
                        تعذّر تحميل السلة حاليًا.
                    </p>

                    <Link
                        to="/recipes"
                        className={`${primaryButton} mt-6`}
                    >
                        العودة للوصفات
                    </Link>
                </section>
            </RecipeLayout>
        )
    }

    return (
        <RecipeLayout navigationState={navigationState}>
            <div className="flex justify-end">
                <Link
                    to={
                        navigationState?.fromRecipeId
                            ? `/recipes/${navigationState.fromRecipeId}`
                            : '/recipes'
                    }
                    state={navigationState}
                    className={secondaryButton}
                >
                    العودة للوصفة
                    <ArrowLeft
                        size={18}
                        aria-hidden="true"
                    />
                </Link>
            </div>

            <div className="mt-7">
                <h1 className="stylistic-text text-3xl font-bold sm:text-4xl">
                    سلة المنتجات
                </h1>

                <p className="mt-3 text-jood-green/70">
                    المنتجات المطابقة للمكونات الناقصة
                </p>
            </div>
            {cart.unmatched_ingredients.length > 0 && (
                <section
                    className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <AlertTriangle
                                size={20}
                                aria-hidden="true"
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="font-bold text-amber-900">
                                بعض المنتجات غير متوفرة حاليًا
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-amber-800/80">
                                لم تتم إضافة المكونات التالية إلى السلة
                                لعدم توفر منتجات مناسبة لها حاليًا:
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {cart.unmatched_ingredients.map(
                                    (item, index) => (
                                        <span
                                            key={`${item.ingredient_key}-${index}`}
                                            className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm font-medium text-amber-900"
                                        >
                                            {item.name}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="mt-6 rounded-3xl bg-white p-4 sm:p-7">
                {(cart.products.length > 0 ||
                    cart.unmatched_ingredients.length > 0) && (
                        <div className="mb-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsClearDialogOpen(true)}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 text-sm font-bold text-red-600 transition-all hover:border-red-300 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                            >
                                <Trash2
                                    size={17}
                                    aria-hidden="true"
                                />
                                مسح السلة
                            </button>
                        </div>
                    )}
                {cart.products.length > 0 ? (
                    <ul className="space-y-3">
                        {cart.products.map((product) => (
                            <CartProduct
                                key={product.shopping_list_item_id}
                                product={product}
                                updating={
                                    updatingItemId ===
                                    product.shopping_list_item_id
                                }
                                onQuantityChange={handleQuantityChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-jood-green/70">
                            ما فيه منتجات متاحة حاليًا.
                        </p>

                        <Link
                            to="/app"
                            className={`${primaryButton} mt-6`}
                        >
                            العودة للرئيسية
                        </Link>
                    </div>
                )}

                <div className="mt-6 border-t border-jood-green/10 pt-5">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-lg font-bold">
                            الإجمالي
                        </span>

                        <span className="text-2xl font-bold">
                            {cart.total_price.toFixed(2)} ر.س
                        </span>
                    </div>

                    {cart.products.length > 0 && (
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setIsStoreDialogOpen(true)}
                                className={`${primaryButton} w-full`}
                            >
                                <ShoppingCart
                                    size={19}
                                    aria-hidden="true"
                                />
                                متابعة للمتجر
                            </button>

                            <p className="mt-3 text-center text-xs leading-6 text-jood-green/60">
                                تم اختيار المنتجات بناءً على المكونات
                                الناقصة في الوصفة
                            </p>
                        </div>
                    )}
                </div>
            </section>
            {isStoreDialogOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="store-dialog-title"
                    onClick={() => setIsStoreDialogOpen(false)}
                >
                    <div
                        className="relative w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl sm:p-8"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsStoreDialogOpen(false)}
                            aria-label="إغلاق"
                            className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full text-jood-green/60 transition hover:bg-jood-background hover:text-jood-green"
                        >
                            <X size={20} aria-hidden="true" />
                        </button>

                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-jood-lime/60">
                            <CheckCircle2
                                size={30}
                                aria-hidden="true"
                            />
                        </div>

                        <h2
                            id="store-dialog-title"
                            className="stylistic-text mt-5 text-2xl font-bold"
                        >
                            سلتك جاهزة
                        </h2>

                        <p className="mt-3 leading-8 text-jood-green/70">
                            تم تجهيز المنتجات المطابقة للمكونات
                            الناقصة في الوصفة.
                        </p>

                        <p className="mt-2 text-sm leading-7 text-jood-green/60">
                            عند ربط جود بمتجر أو منصة توصيل، يمكن
                            تحويل السلة مباشرة لإتمام الطلب.
                        </p>

                        <button
                            type="button"
                            onClick={() => setIsStoreDialogOpen(false)}
                            className={`${primaryButton} mt-6 w-full`}
                        >
                            تم
                        </button>
                    </div>
                </div>
            )}
            {isClearDialogOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="clear-cart-title"
                    onClick={() => {
                        if (!isClearing) {
                            setIsClearDialogOpen(false)
                        }
                    }}
                >
                    <div
                        className="relative w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl sm:p-8"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            disabled={isClearing}
                            onClick={() => setIsClearDialogOpen(false)}
                            aria-label="إغلاق"
                            className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full text-jood-green/60 transition hover:bg-jood-background hover:text-jood-green disabled:opacity-40"
                        >
                            <X size={20} aria-hidden="true" />
                        </button>

                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <Trash2
                                size={28}
                                aria-hidden="true"
                            />
                        </div>

                        <h2
                            id="clear-cart-title"
                            className="stylistic-text mt-5 text-2xl font-bold"
                        >
                            مسح السلة؟
                        </h2>

                        <p className="mt-3 leading-7 text-jood-green/70">
                            سيتم حذف جميع المنتجات والمكونات
                            الموجودة في السلة.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                disabled={isClearing}
                                onClick={() => setIsClearDialogOpen(false)}
                                className={`${secondaryButton} flex-1`}
                            >
                                إلغاء
                            </button>

                            <button
                                type="button"
                                disabled={isClearing}
                                onClick={handleClearCart}
                                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-red-600 px-5 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isClearing
                                    ? 'جاري المسح...'
                                    : 'مسح السلة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </RecipeLayout>
    )
}