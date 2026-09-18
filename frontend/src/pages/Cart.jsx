import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    ArrowLeft,
    CheckCircle2,
    ShoppingCart,
    X,
} from 'lucide-react'

import RecipeLayout from '../components/recipe/RecipeLayout'
import {
    primaryButton,
    secondaryButton,
} from '../components/recipe/recipeStyles'


function CartProduct({ product }) {
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

    const cart = navigationState?.cart
    const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false)

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
                        ارجعي لقائمة التسوق وأضيفي المنتجات للسلة.
                    </p>

                    <Link
                        to="/shopping-list"
                        className={`${primaryButton} mt-6`}
                    >
                        العودة لقائمة التسوق
                    </Link>
                </section>
            </RecipeLayout>
        )
    }

    return (
        <RecipeLayout navigationState={navigationState}>
            <div className="flex justify-end">
                <Link
                    to="/shopping-list"
                    state={navigationState}
                    className={secondaryButton}
                >
                    العودة لقائمة التسوق
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

            <section className="mt-6 rounded-3xl bg-white p-4 sm:p-7">
                {cart.products.length > 0 ? (
                    <ul className="space-y-3">
                        {cart.products.map((product) => (
                            <CartProduct
                                key={product.product_id}
                                product={product}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="py-8 text-center text-jood-green/70">
                        ما فيه منتجات متاحة حاليًا.
                    </p>
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
                الناقصة في قائمة التسوق
            </p>
        </div>
    )}
</div>
            </section>

            {cart.unmatched_ingredients.length > 0 && (
                <section className="mt-5 rounded-3xl bg-white p-5">
                    <h2 className="font-bold">
                        مكونات لم نجد لها منتجًا
                    </h2>

                    <ul className="mt-3 space-y-2 text-sm text-jood-green/70">
                        {cart.unmatched_ingredients.map(
                            (item, index) => (
                                <li
                                    key={`${item.ingredient_key}-${index}`}
                                >
                                    {item.name}
                                </li>
                            )
                        )}
                    </ul>
                </section>
            )}
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
                الناقصة في قائمتك.
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
        </RecipeLayout>
    )
}