import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    ArrowLeft,
    Bookmark,
    ChefHat,
    Clock3,
    Leaf,
    UsersRound,
} from 'lucide-react'

import RecipeLayout from '../components/recipe/RecipeLayout'
import {
    primaryButton,
    secondaryButton,
} from '../components/recipe/recipeStyles'
import useBookmarks from '../hooks/useBookmarks'
import { getRecipeSuggestions } from '../services/recipeApi'

export default function Recipes() {
    const location = useLocation()
    const navigationState = location.state

    const {
        savedIds,
        savedRecipes,
        toggleSaved,
        saveMessage,
        loading: bookmarksLoading,
    } = useBookmarks()

    const showSavedOnly =
        new URLSearchParams(location.search).get('view') === 'saved'

    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [retry, setRetry] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        let active = true

        async function loadRecipes() {
            setLoading(true)
            setError('')
            setRecipes([])

            try {
                const result = await getRecipeSuggestions(
                    navigationState ?? {},
                    { signal: controller.signal }
                )

                if (active) {
                    setRecipes(result)
                }
            } catch (error) {
                if (active && error.name !== 'AbortError') {
                    setError('تعذّر تحميل الوصفات')
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadRecipes()

        return () => {
            active = false
            controller.abort()
        }
    }, [navigationState, retry])

    /*
     * الوصفات القادمة من GET /bookmarks/
     * تكون من جدول recipes مباشرة.
     *
     * هنا نوحّد شكلها مع الوصفات التي تستخدمها
     * واجهة Recipes.
     */
const normalizedSavedRecipes = (savedRecipes ?? []).map((recipe) => ({
        ...recipe,

        minutes:
            recipe.minutes ??
            recipe.time_minutes ??
            0,

        priorityNames:
            recipe.priorityNames ??
            [],

        ingredient_utilization:
            recipe.ingredient_utilization ??
            0,

        missing_count:
            recipe.missing_count ??
            (
                Array.isArray(recipe.you_need)
                    ? recipe.you_need.length
                    : 0
            ),

        is_best_match:
            recipe.is_best_match ??
            false,

        description:
            recipe.description ??
            '',
    }))

    /*
     * إذا المستخدم في صفحة المحفوظات:
     * نعرض الوصفات القادمة من Supabase.
     *
     * غير كذا:
     * نعرض الوصفات المقترحة الحالية.
     */
    const visible = showSavedOnly
        ? normalizedSavedRecipes
        : recipes

    const pageLoading = showSavedOnly
        ? bookmarksLoading
        : loading

    return (
        <RecipeLayout navigationState={navigationState}>
            <div className="flex justify-end">
                <Link
                    to={
                        showSavedOnly &&
                        navigationState?.returnTo === '/account'
                            ? '/account'
                            : '/ingredients/review'
                    }
                    state={navigationState}
                    className={secondaryButton}
                >
                    {showSavedOnly &&
                    navigationState?.returnTo === '/account'
                        ? 'العودة لحسابي'
                        : 'تعديل المكونات'}

                    <ArrowLeft
                        size={18}
                        aria-hidden="true"
                    />
                </Link>
            </div>

            <h1 className="stylistic-text mt-7 text-3xl font-bold leading-relaxed sm:text-4xl">
                وش تشتهي اليوم؟
            </h1>

            <p className="mt-3 leading-8 text-jood-green/75">
                اختَر وصفتك واحفظ اللي يعجبك وخلّنا نطبخ خطوة بخطوة
            </p>

            <p className="mt-3 text-xs leading-6 text-jood-green/60">
                اقتراحات مخصصة حسب مكوناتك ووقتك وتفضيلاتك الغذائية،
                مع إعطاء أولوية للمكونات اللي حدّدتها قرب تنتهي
            </p>

            <div
                role="group"
                aria-label="عرض الوصفات"
                className="mt-6 flex flex-wrap gap-2"
            >
                <Link
                    to="/recipes"
                    state={navigationState}
                    aria-current={
                        !showSavedOnly
                            ? 'page'
                            : undefined
                    }
                    className={
                        showSavedOnly
                            ? secondaryButton
                            : primaryButton
                    }
                >
                    كل الوصفات
                </Link>

                <Link
                    to="/recipes?view=saved"
                    state={navigationState}
                    aria-current={
                        showSavedOnly
                            ? 'page'
                            : undefined
                    }
                    className={
                        showSavedOnly
                            ? primaryButton
                            : secondaryButton
                    }
                >
                    <Bookmark
                        size={18}
                        aria-hidden="true"
                    />

                    المحفوظات ({savedIds.length})
                </Link>
            </div>

            <p
                role="status"
                aria-atomic="true"
                className="mt-3 text-sm"
            >
                {saveMessage}
            </p>

            {pageLoading && (
                <div
                    role="status"
                    className="mt-6 rounded-3xl bg-white p-8 text-center"
                >
                    <span
                        aria-hidden="true"
                        className="mx-auto block size-8 animate-spin rounded-full border-2 border-jood-green/20 border-t-jood-green motion-reduce:animate-none"
                    />

                    <p className="mt-4 text-sm">
                        جاري تحميل الوصفات
                    </p>
                </div>
            )}

            {error && !showSavedOnly && (
                <div
                    role="alert"
                    className="mt-6 rounded-3xl bg-white p-8 text-center"
                >
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() =>
                            setRetry((value) => value + 1)
                        }
                        className={`${primaryButton} mt-4`}
                    >
                        حاول مرة ثانية
                    </button>
                </div>
            )}

            {!pageLoading &&
                !(error && !showSavedOnly) &&
                visible.length === 0 && (
                    <div className="mt-6 rounded-3xl bg-white p-8 text-center">
                        <Bookmark
                            size={32}
                            aria-hidden="true"
                            className="mx-auto text-jood-green/50"
                        />

                        <h2 className="stylistic-text mt-4 text-xl font-bold">
                            {showSavedOnly
                                ? 'ما حفظت وصفات لسه'
                                : 'ما لقينا وصفات'}
                        </h2>

                        <p className="mt-2 text-sm leading-7 text-jood-green/70">
                            {showSavedOnly
                                ? 'اضغط علامة الحفظ على الوصفة عشان ترجع لها بسهولة'
                                : 'جرّب تعدّل المكونات وتطلب الوصفات مرة ثانية'}
                        </p>

                        {showSavedOnly ? (
                            <Link
                                to="/recipes"
                                state={navigationState}
                                className={`${primaryButton} mt-5`}
                            >
                                استكشف الوصفات
                            </Link>
                        ) : (
                            <Link
                                to="/ingredients/review"
                                state={navigationState}
                                className={`${secondaryButton} mt-5`}
                            >
                                تعديل المكونات
                            </Link>
                        )}
                    </div>
                )}

            <div className="mt-6 grid min-w-0 grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((recipe) => {
                    const isSaved =
                        savedIds.includes(recipe.id)

                    const priority =
                        Array.isArray(recipe.priorityNames) &&
                        recipe.priorityNames.length > 0

                    return (
                        <article
                            key={recipe.id}
                            className={`flex min-w-0 flex-col overflow-hidden rounded-3xl bg-white ${
                                priority
                                    ? 'ring-2 ring-jood-green/40'
                                    : ''
                            }`}
                        >
                            <div className="relative flex h-36 items-center justify-center bg-jood-lime/65">
                                <div className="flex size-20 items-center justify-center rounded-full bg-white/65">
                                    <ChefHat
                                        size={40}
                                        strokeWidth={1.5}
                                        aria-hidden="true"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleSaved(recipe)
                                    }
                                    aria-label={`حفظ وصفة ${recipe.name}`}
                                    aria-pressed={isSaved}
                                    className="absolute left-3 top-3 flex size-11 items-center justify-center rounded-full bg-white transition-colors hover:bg-jood-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                                >
                                    <Bookmark
                                        size={21}
                                        aria-hidden="true"
                                        fill={
                                            isSaved
                                                ? 'currentColor'
                                                : 'none'
                                        }
                                    />
                                </button>

                                {priority && (
                                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-jood-green px-3 py-2 text-xs font-medium text-white">
                                        <Leaf
                                            size={14}
                                            aria-hidden="true"
                                        />

                                        لها أولوية
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <h2 className="stylistic-text text-xl font-bold">
                                    {recipe.name}
                                </h2>

                                {recipe.description && (
                                    <p className="mt-2 text-sm leading-7 text-jood-green/70">
                                        {recipe.description}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3 text-sm text-jood-green/75">
                                    <span className="inline-flex items-center gap-1">
                                        <Clock3
                                            size={16}
                                            aria-hidden="true"
                                        />

                                        {recipe.minutes} دقيقة
                                    </span>

                                    <span className="inline-flex items-center gap-1">
                                        <UsersRound
                                            size={16}
                                            aria-hidden="true"
                                        />

                                        {recipe.servings} حصص
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    {recipe.is_best_match && (
                                        <span className="rounded-full bg-jood-green px-3 py-1.5 font-medium text-white">
                                            أفضل تطابق
                                        </span>
                                    )}

                                    <span className="rounded-full bg-jood-lime/60 px-3 py-1.5">
                                        استفادة من مكوناتك{' '}
                                        {recipe.ingredient_utilization}%
                                    </span>

                                    <span className="rounded-full bg-jood-background px-3 py-1.5">
                                        {recipe.missing_count === 0
                                            ? 'ما تحتاج مكونات إضافية'
                                            : `${recipe.missing_count} مكونات ناقصة`}
                                    </span>
                                </div>

                                <div className="mt-auto pt-5">
                                    <Link
                                        to={`/recipes/${recipe.id}`}
                                        state={navigationState}
                                        className={`${primaryButton} w-full hover:bg-jood-lime hover:text-jood-green`}
                                    >
                                        شوف الوصفة
                                    </Link>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>
        </RecipeLayout>
    )
}