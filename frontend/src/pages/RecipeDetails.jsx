import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    Bookmark,
    ChefHat,
    Check,
    Clock3,
    Pause,
    Play,
    RotateCcw,
    UsersRound,
} from 'lucide-react'

import RecipeLayout from '../components/recipe/RecipeLayout'
import RecipeIngredients from '../components/recipe/RecipeIngredients'
import {
    primaryButton,
    secondaryButton,
} from '../components/recipe/recipeStyles'
import useSavedRecipes from '../hooks/useSavedRecipes'
import { getRecipeById } from '../services/recipeApi'

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainder = seconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function StepTimer({ initialSeconds }) {
    const [remaining, setRemaining] = useState(initialSeconds)
    const [running, setRunning] = useState(false)
    const deadlineRef = useRef(null)

    useEffect(() => {
        if (!running) return

        function tick() {
            const next = Math.max(
                0,
                Math.ceil((deadlineRef.current - Date.now()) / 1000)
            )

            setRemaining(next)

            if (next === 0) {
                setRunning(false)
            }
        }

        tick()
        const interval = window.setInterval(tick, 250)

        return () => window.clearInterval(interval)
    }, [running])

    function toggleTimer() {
        if (running) {
            setRemaining(
                Math.max(
                    0,
                    Math.ceil(
                        (deadlineRef.current - Date.now()) / 1000
                    )
                )
            )

            setRunning(false)
            return
        }

        if (remaining === 0) return

        deadlineRef.current = Date.now() + remaining * 1000
        setRunning(true)
    }

    function resetTimer() {
        setRunning(false)
        deadlineRef.current = null
        setRemaining(initialSeconds)
    }

    function addMinute() {
        if (running) {
            deadlineRef.current += 60000
        }

        setRemaining((value) => value + 60)
    }

    return (
        <div className="mt-7 rounded-3xl bg-jood-background p-5 text-center sm:p-7">
            <p className="text-sm text-jood-green/70">
                مؤقّت الخطوة
            </p>

            <div
                role="timer"
                aria-label="الوقت المتبقي"
                dir="ltr"
                className="mt-4 text-5xl font-bold tabular-nums sm:text-6xl"
            >
                {formatTime(remaining)}
            </div>

            <p role="status" className="mt-4 min-h-6 text-sm">
                {remaining === 0
                    ? 'انتهى الوقت، شيّك على الطبخة قبل ما تكمل'
                    : running
                      ? 'المؤقّت شغّال'
                      : 'شغّل المؤقّت لما تبدأ الخطوة'}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                    type="button"
                    onClick={toggleTimer}
                    disabled={remaining === 0}
                    className={primaryButton}
                >
                    {running ? (
                        <Pause size={18} aria-hidden="true" />
                    ) : (
                        <Play size={18} aria-hidden="true" />
                    )}

                    {running ? 'إيقاف مؤقت' : 'تشغيل'}
                </button>

                <button
                    type="button"
                    onClick={resetTimer}
                    className={secondaryButton}
                >
                    <RotateCcw size={18} aria-hidden="true" />
                    إعادة
                </button>

                <button
                    type="button"
                    onClick={addMinute}
                    className={secondaryButton}
                >
                    + دقيقة
                </button>
            </div>

            <p className="mt-4 text-xs leading-6 text-jood-green/60">
                المؤقّت يتوقف عند تغيير الخطوة أو مغادرة الصفحة
            </p>
        </div>
    )
}

function CookingSteps({ recipe, onExit }) {
    const [stepIndex, setStepIndex] = useState(0)
    const [finished, setFinished] = useState(false)
    const titleRef = useRef(null)

    const step = recipe.steps[stepIndex]

    useEffect(() => {
        titleRef.current?.focus()
    }, [stepIndex, finished])

    if (finished) {
        return (
            <section className="rounded-3xl bg-white px-5 py-12 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-jood-lime">
                    <Check size={38} aria-hidden="true" />
                </div>

                <h2
                    ref={titleRef}
                    tabIndex={-1}
                    className="stylistic-text mt-5 text-3xl font-bold outline-none"
                >
                    بالعافية عليك!
                </h2>

                <p className="mt-3 leading-8 text-jood-green/75">
                    خلّصت خطوات {recipe.name}
                </p>

                <button
                    type="button"
                    onClick={onExit}
                    className={`${primaryButton} mt-6`}
                >
                    العودة لتفاصيل الوصفة
                </button>
            </section>
        )
    }

    return (
        <section className="rounded-3xl bg-white p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="font-medium">
                    خلّنا نطبخ
                </span>

                <span className="text-jood-green/65">
                    الخطوة {stepIndex + 1} من {recipe.steps.length}
                </span>
            </div>

            <progress
                value={stepIndex + 1}
                max={recipe.steps.length}
                aria-label="تقدم خطوات الطبخ"
                className="mt-4 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-jood-green/10 [&::-webkit-progress-value]:bg-jood-green [&::-moz-progress-bar]:bg-jood-green"
            />

            <h2
                ref={titleRef}
                tabIndex={-1}
                className="stylistic-text mt-8 text-2xl font-bold outline-none sm:text-3xl"
            >
                {step.title}
            </h2>

            <p className="mt-4 text-base leading-9 text-jood-green/80">
                {step.text}
            </p>

            {step.seconds > 0 && (
                <StepTimer
                    key={`${recipe.id}-${stepIndex}`}
                    initialSeconds={step.seconds}
                />
            )}

            <div className="mt-7 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => {
                        if (stepIndex === recipe.steps.length - 1) {
                            setFinished(true)
                        } else {
                            setStepIndex((value) => value + 1)
                        }
                    }}
                    className={primaryButton}
                >
                    {stepIndex === recipe.steps.length - 1
                        ? 'خلصت الطبخة'
                        : '  التالي'}
                </button>

                <button
                    type="button"
                    disabled={stepIndex === 0}
                    onClick={() =>
                        setStepIndex((value) => Math.max(0, value - 1))
                    }
                    className={secondaryButton}
                >
                    السابق
                </button>
            </div>

            <button
                type="button"
                onClick={onExit}
                className="mt-5 min-h-11 text-sm text-jood-green/65 transition-colors hover:text-jood-green"
            >
                إنهاء وضع الطبخ والعودة للتفاصيل
            </button>
        </section>
    )
}

function DetailsContent({ recipe, navigationState }) {
    const [activeTab, setActiveTab] = useState('ingredients')
    const [cooking, setCooking] = useState(false)
    const startButtonRef = useRef(null)

    const { savedIds, toggleSaved, saveMessage } = useSavedRecipes()
    const isSaved = savedIds.includes(recipe.id)

    const tabs = [
        { id: 'ingredients', label: 'المقادير' },
        { id: 'steps', label: 'طريقة التحضير' },
        { id: 'nutrition', label: 'المعلومات الغذائية' },
    ]

    function exitCooking() {
        setCooking(false)

        window.requestAnimationFrame(() => {
            startButtonRef.current?.focus()
        })
    }

    function handleTabKey(event, index) {
        let nextIndex

        if (event.key === 'ArrowLeft') {
            nextIndex = (index + 1) % tabs.length
        } else if (event.key === 'ArrowRight') {
            nextIndex = (index - 1 + tabs.length) % tabs.length
        } else if (event.key === 'Home') {
            nextIndex = 0
        } else if (event.key === 'End') {
            nextIndex = tabs.length - 1
        } else {
            return
        }

        event.preventDefault()
        setActiveTab(tabs[nextIndex].id)

        document
            .getElementById(`recipe-tab-${tabs[nextIndex].id}`)
            ?.focus()
    }

    return (
        <RecipeLayout navigationState={navigationState}>
            <div className="flex justify-end">
                <Link
                    to="/recipes"
                    state={navigationState}
                    className={secondaryButton}
                >
                    العودة للوصفات
                    <ArrowLeft size={18} aria-hidden="true" />
                </Link>
            </div>

            <div className="mx-auto mt-7 max-w-3xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="stylistic-text text-3xl font-bold leading-relaxed sm:text-4xl">
                            {recipe.name}
                        </h1>

                        <p className="mt-3 leading-8 text-jood-green/75">
                            {recipe.description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => toggleSaved(recipe)}
                        aria-label={`حفظ وصفة ${recipe.name}`}
                        aria-pressed={isSaved}
                        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                    >
                        <Bookmark
                            size={22}
                            aria-hidden="true"
                            fill={isSaved ? 'currentColor' : 'none'}
                        />
                    </button>
                </div>

                <p role="status" className="mt-2 text-sm">
                    {saveMessage}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-jood-green/75">
                    <span className="inline-flex items-center gap-2">
                        <Clock3 size={18} aria-hidden="true" />
                        {recipe.minutes} دقيقة
                    </span>

                    <span className="inline-flex items-center gap-2">
                        <UsersRound size={18} aria-hidden="true" />
                        المقادير لـ {recipe.servings} حصص
                    </span>
                </div>

                {recipe.priorityNames.length > 0 && (
                    <p className="mt-5 rounded-2xl bg-jood-lime/60 px-4 py-3 text-sm leading-7">
                        لها أولوية لأنها تستخدم{' '}
                        {recipe.priorityNames.join('، ')} اللي حدّدتها قرب تنتهي
                    </p>
                )}

                <div className="mt-6">
                    {cooking ? (
                        <CookingSteps
                            recipe={recipe}
                            onExit={exitCooking}
                        />
                    ) : (
                        <section className="rounded-3xl bg-white p-4 sm:p-7">
                            <div
                                role="tablist"
                                aria-label="تفاصيل الوصفة"
                                className="flex gap-1 overflow-x-auto rounded-2xl bg-jood-background p-1"
                            >
                                {tabs.map((tab, index) => (
                                    <button
                                        key={tab.id}
                                        id={`recipe-tab-${tab.id}`}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === tab.id}
                                        aria-controls={`recipe-panel-${tab.id}`}
                                        tabIndex={
                                            activeTab === tab.id ? 0 : -1
                                        }
                                        onClick={() => setActiveTab(tab.id)}
                                        onKeyDown={(event) =>
                                            handleTabKey(event, index)
                                        }
                                        className={`min-h-11 flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-jood-green ${
                                            activeTab === tab.id
                                                ? 'bg-jood-green text-white'
                                                : 'hover:bg-jood-green/5'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    id={`recipe-panel-${tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`recipe-tab-${tab.id}`}
                                    hidden={activeTab !== tab.id}
                                    tabIndex={0}
                                    className="mt-6 focus-visible:outline-2 focus-visible:outline-jood-green"
                                >
                                    {tab.id === 'ingredients' && (
                                        <RecipeIngredients
                                            recipe={recipe}
                                            navigationState={navigationState}
                                        />
                                    )}

                                    {tab.id === 'steps' && (
                                        <ol className="space-y-5">
                                            {recipe.steps.map((step, index) => (
                                                <li
                                                    key={step.title}
                                                    className="flex gap-3"
                                                >
                                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-jood-lime text-sm font-bold">
                                                        {index + 1}
                                                    </span>

                                                    <div>
                                                        <h2 className="font-medium">
                                                            {step.title}
                                                        </h2>

                                                        <p className="mt-1 text-sm leading-8 text-jood-green/75">
                                                            {step.text}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    )}

                                    {tab.id === 'nutrition' && (
                                        <>
                                            <p className="mb-4 text-sm text-jood-green/70">
                                                قيم توضيحية للحصة الواحدة
                                            </p>

                                            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                {[
                                                    [
                                                        'السعرات',
                                                        `${recipe.nutrition.calories} سعرة`,
                                                    ],
                                                    [
                                                        'البروتين',
                                                        `${recipe.nutrition.protein} غ`,
                                                    ],
                                                    [
                                                        'الكربوهيدرات',
                                                        `${recipe.nutrition.carbs} غ`,
                                                    ],
                                                    [
                                                        'الدهون',
                                                        `${recipe.nutrition.fat} غ`,
                                                    ],
                                                    [
                                                        'الألياف',
                                                        `${recipe.nutrition.fiber} غ`,
                                                    ],
                                                ].map(([label, value]) => (
                                                    <div
                                                        key={label}
                                                        className="rounded-2xl bg-jood-background p-4"
                                                    >
                                                        <dt className="text-xs text-jood-green/65">
                                                            {label}
                                                        </dt>

                                                        <dd className="mt-2 text-lg font-bold">
                                                            {value}
                                                        </dd>
                                                    </div>
                                                ))}
                                            </dl>

                                            <p className="mt-4 text-xs leading-6 text-jood-green/60">
                                                أرقام تجريبية للتصميم وليست
                                                حسابًا غذائيًا لهذه الوصفة
                                            </p>
                                        </>
                                    )}
                                </div>
                            ))}

                            <button
                                ref={startButtonRef}
                                type="button"
                                onClick={() => setCooking(true)}
                                className={`${primaryButton} mt-7 w-full`}
                            >
                                <ChefHat size={20} aria-hidden="true" />
                                ابدأ الطبخ
                            </button>
                        </section>
                    )}
                </div>
            </div>
        </RecipeLayout>
    )
}

export default function RecipeDetails() {
    const { recipeId } = useParams()
    const location = useLocation()
    const navigationState = location.state

    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [retry, setRetry] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        let active = true

        async function loadRecipe() {
            setLoading(true)
            setError('')
            setRecipe(null)
            window.scrollTo(0, 0)

            try {
                const result = await getRecipeById(
                    recipeId,
                    navigationState ?? {},
                    { signal: controller.signal }
                )

                if (active) setRecipe(result)
            } catch (error) {
                if (active && error.name !== 'AbortError') {
                    setError('تعذّر تحميل الوصفة')
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        loadRecipe()

        return () => {
            active = false
            controller.abort()
        }
    }, [recipeId, navigationState, retry])

    if (loading) {
        return (
            <RecipeLayout navigationState={navigationState}>
                <div
                    role="status"
                    className="rounded-3xl bg-white px-5 py-12 text-center"
                >
                    <span
                        aria-hidden="true"
                        className="mx-auto block size-8 animate-spin rounded-full border-2 border-jood-green/20 border-t-jood-green motion-reduce:animate-none"
                    />

                    <p className="mt-4 text-sm">
                        جاري تحميل الوصفة
                    </p>
                </div>
            </RecipeLayout>
        )
    }

    if (error || !recipe) {
        return (
            <RecipeLayout navigationState={navigationState}>
                <div className="rounded-3xl bg-white px-5 py-12 text-center">
                    <p role="alert">
                        {error || 'الوصفة غير موجودة'}
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setRetry((value) => value + 1)
                            }
                            className={primaryButton}
                        >
                            حاول مرة ثانية
                        </button>

                        <Link
                            to="/recipes"
                            state={navigationState}
                            className={secondaryButton}
                        >
                            العودة للوصفات
                        </Link>
                    </div>
                </div>
            </RecipeLayout>
        )
    }

    return (
        <DetailsContent
            key={recipe.id}
            recipe={recipe}
            navigationState={navigationState}
        />
    )
}