import { useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    Camera,
    Plus,
    Minus,
    X,
    Clock3,
    UsersRound,
    UserRound,
    ChevronDown,
    SlidersHorizontal,
} from 'lucide-react'

import logo from '../assets/images/jood3.svg'

const fieldClass =
    'min-h-12 w-full min-w-0 rounded-xl border border-jood-green/20 bg-white px-3 py-3 text-base text-jood-green placeholder:text-jood-green/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green'

const expiryOptions = [
    { value: 'today', label: 'اليوم' },
    { value: 'two-days', label: 'خلال يومين' },
    { value: 'week', label: 'خلال أسبوع' },
    { value: 'date', label: 'أعرف التاريخ' },
]

const timeOptions = [
    { value: '15', label: '١٥ دقيقة' },
    { value: '30', label: '٣٠ دقيقة' },
    { value: '60', label: 'ساعة' },
    { value: 'any', label: 'بدون تحديد' },
]


function getLocalDate() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function IngredientExpiry({ ingredient, onChange }) {
    const id = useId()

    const mode =
        ingredient.expiryMode || (ingredient.expiryDate ? 'date' : '')

    const enabled =
        ingredient.expiringSoon ?? Boolean(mode)

    function toggleEnabled(event) {
        onChange({
            expiringSoon: event.target.checked,
            expiryMode: '',
            expiryDate: '',
            expiryEstimateRecordedOn: '',
        })
    }

    function selectMode(value) {
        onChange({
            expiringSoon: true,
            expiryMode: value,
            expiryDate: '',
            expiryEstimateRecordedOn:
                value === 'date' ? '' : getLocalDate(),
        })
    }

    return (
        <div className="mt-3 min-w-0">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={toggleEnabled}
                    aria-controls={`${id}-options`}
                    className="size-4 shrink-0 accent-jood-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                />

                <span className="text-sm font-medium">
                    قرب ينتهي
                </span>

                <span className="text-xs text-jood-green/45">
                    اختياري
                </span>
            </label>

            {enabled && (
                <div id={`${id}-options`} className="mt-2 min-w-0">
                    <fieldset className="m-0 min-w-0 border-0 p-0">
                        <legend className="mb-3 text-sm text-jood-green/75">
                            قد إيش باقي تقريبًا؟
                        </legend>

                        <div className="grid grid-cols-2 gap-2">
                            {expiryOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className="min-w-0 cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name={`${id}-expiry`}
                                        value={option.value}
                                        checked={mode === option.value}
                                        onChange={() =>
                                            selectMode(option.value)
                                        }
                                        className="peer sr-only"
                                    />

                                    <span className="flex min-h-11 items-center justify-center rounded-xl border border-jood-green/20 bg-white px-2 py-2 text-center text-sm transition-colors peer-checked:border-jood-green peer-checked:bg-jood-lime peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-jood-green">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {mode === 'date' && (
                        <div className="mt-3 w-full min-w-0 max-w-[220px]">
                            <label
                                htmlFor={`${id}-date`}
                                className="mb-2 block text-sm text-jood-green/75"
                            >
                                التاريخ المكتوب على العبوة
                            </label>

                            <input
                                id={`${id}-date`}
                                type="date"
                                dir="ltr"
                                value={ingredient.expiryDate || ''}
                                data-filled={Boolean(ingredient.expiryDate)}
                                onChange={(event) =>
                                    onChange({
                                        expiringSoon: true,
                                        expiryMode: 'date',
                                        expiryDate: event.target.value,
                                        expiryEstimateRecordedOn: '',
                                    })
                                }
                                className={`${fieldClass} ingredient-date`}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function IngredientReview() {
    const location = useLocation()
    const nameInputRef = useRef(null)
    const imageInputRef = useRef(null)
    const navigate = useNavigate()

    const [ingredients, setIngredients] = useState(() =>
        Array.isArray(location.state?.ingredients)
            ? location.state.ingredients.map((item) => ({ ...item }))
            : []
    )

    const nextIdRef = useRef(
        Math.max(
            0,
            ...ingredients.map((item) => Number(item.id) || 0)
        ) + 1
    )

    const [imageFile, setImageFile] = useState(
        () => location.state?.imageFile ?? null
    )

    const [newIngredient, setNewIngredient] = useState('')
    const [preparationTime, setPreparationTime] = useState(
        () => location.state?.preparationTime ?? '30'
    )

    const [servings, setServings] = useState(
        () => location.state?.servings ?? 2
    )
    const [error, setError] = useState('')
    const [imageError, setImageError] = useState('')
    const [announcement, setAnnouncement] = useState('')
    const [requestMessage, setRequestMessage] = useState('')

    const canSuggest =
        ingredients.some((item) => item.name?.trim()) ||
        Boolean(imageFile)

    function updateIngredient(id, changes) {
        setIngredients((current) =>
            current.map((item) =>
                item.id === id ? { ...item, ...changes } : item
            )
        )

        setError('')
        setRequestMessage('')
    }

    function removeIngredient(id) {
        const removed = ingredients.find((item) => item.id === id)

        setIngredients((current) =>
            current.filter((item) => item.id !== id)
        )

        setError('')
        setRequestMessage('')
        setAnnouncement(`تم حذف ${removed?.name || 'المكوّن'}`)
        nameInputRef.current?.focus()
    }

    function addIngredient(event) {
        event.preventDefault()

        const name = newIngredient.trim().replace(/\s+/g, ' ')

        if (!name) {
            setError('اكتب اسم المكوّن أول')
            nameInputRef.current?.focus()
            return
        }

        const exists = ingredients.some(
            (item) =>
                item.name.trim().toLocaleLowerCase() ===
                name.toLocaleLowerCase()
        )

        if (exists) {
            setError('المكوّن موجود في قائمتك')
            nameInputRef.current?.focus()
            return
        }

        const item = {
            id: nextIdRef.current++,
            name,
            expiringSoon: false,
            expiryMode: '',
            expiryDate: '',
            expiryEstimateRecordedOn: '',
        }

        setIngredients((current) => [...current, item])
        setNewIngredient('')
        setError('')
        setRequestMessage('')
        setAnnouncement(`تمت إضافة ${name}`)
        nameInputRef.current?.focus()
    }

    function handleImageSelection(event) {
        const file = event.target.files?.[0]
        event.target.value = ''

        if (!file) return

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ]

        if (!allowedTypes.includes(file.type)) {
            setImageError('اختَر صورة بصيغة JPG أو PNG أو WEBP')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            setImageError('حجم الصورة لازم يكون أقل من ١٠ ميجابايت')
            return
        }

        setImageFile(file)
        setImageError('')
        setRequestMessage('')
        setAnnouncement('تمت إضافة الصورة')
    }

    function removeImage() {
        setImageFile(null)
        setImageError('')
        setRequestMessage('')
        setAnnouncement('تم حذف الصورة')
    }

    function handleSuggest() {
        // BACKEND: Recipe generation is requested on the next screen through recipeApi.js; ensure ingredients, preparationTime, servings, user preferences, and any image-analysis result are available to that request.
        if (!canSuggest) return

        if (newIngredient.trim()) {
            setError('اضغط علامة الإضافة عشان نضيف المكوّن لقائمتك')
            nameInputRef.current?.focus()
            return
        }

        const unnamed = ingredients.find((item) => !item.name?.trim())

        if (unnamed) {
            setError('اكتب اسم المكوّن الفاضي أو احذفه')
            document
                .getElementById(`review-name-${unnamed.id}`)
                ?.focus()
            return
        }

        setError('')

        navigate('/recipes', {
            state: {
                ingredients,
                imageFile,
                preparationTime,
                servings,
            },
        })
    }

    return (
        <div
            dir="rtl"
            className="flex min-h-dvh flex-col bg-white text-jood-green"
        >
            <header>
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
                    <Link
                        to="/app"
                        state={{ ingredients, imageFile }}
                        aria-label="جود الرئيسية"
                    >
                        <img
                            src={logo}
                            alt="جُود"
                            className="h-10 w-auto sm:h-12"
                        />
                    </Link>

                    <details className="group relative">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full bg-jood-background px-4 py-2 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                            <UserRound size={19} aria-hidden="true" />
                            <span>حسابي</span>
                            <ChevronDown
                                size={16}
                                aria-hidden="true"
                                className="transition-transform group-open:rotate-180"
                            />
                        </summary>

                        <nav
                            aria-label="حسابي"
                            className="absolute left-0 top-full z-20 mt-2 w-44 rounded-2xl border border-jood-green/10 bg-white p-2 shadow-lg"
                        >
                            <Link
                                to="/account"
                                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-jood-background"
                            >
                                <UserRound size={18} aria-hidden="true" />
                                بيانات حسابي
                            </Link>
                            <Link
                                to="/preferences"
                                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-jood-lime"
                            >
                                <SlidersHorizontal
                                    size={18}
                                    aria-hidden="true"
                                />
                                تفضيلاتي
                            </Link>
                        </nav>
                    </details>
                </div>
            </header>

            <main className="jood-fixed-watermark relative isolate mx-3 my-3 flex-1 overflow-hidden rounded-3xl bg-jood-background px-3 py-6 sm:mx-5 sm:px-8 lg:py-12">

                <div className="mx-auto w-full min-w-0 max-w-5xl">
                    <h1 className="stylistic-text text-3xl font-bold leading-relaxed sm:text-4xl">
                        خلّنا نراجع الموجود
                    </h1>

                    <p className="mt-3 text-base leading-8 text-jood-green/75">
                        تأكّد من مكوناتك، وحدّد وقتك وعدد الحصص
                    </p>

                    <section
                        aria-labelledby="ingredients-title"
                        className="mt-6 min-w-0 rounded-3xl bg-white p-4 sm:p-7"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <h2
                                id="ingredients-title"
                                className="stylistic-text text-xl font-bold sm:text-2xl"
                            >
                                مكوناتك
                                <span className="ms-2 text-sm font-normal text-jood-green/55">
                                    ({ingredients.length})
                                </span>
                            </h2>

                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageSelection}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    imageInputRef.current?.click()
                                }
                                aria-label={
                                    imageFile ? 'تغيير الصورة' : 'إضافة صورة'
                                }
                                title={
                                    imageFile ? 'تغيير الصورة' : 'إضافة صورة'
                                }
                                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-jood-background transition-colors hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                            >
                                <Camera size={21} aria-hidden="true" />
                            </button>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-jood-green/70">
                            عدّل مكوناتك أو احذفها، وحدّد اللي قرب ينتهي
                            عشان نعطيه أولوية
                        </p>

                        {imageFile && (
                            <div className="mt-4 flex min-w-0 items-center gap-3 rounded-xl bg-jood-background px-3 py-2">
                                <Camera
                                    size={19}
                                    aria-hidden="true"
                                    className="shrink-0"
                                />

                                <span className="min-w-0 flex-1 break-words text-sm">
                                    {imageFile.name}
                                </span>

                                <button
                                    type="button"
                                    onClick={removeImage}
                                    aria-label="حذف الصورة"
                                    className="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-jood-green/10"
                                >
                                    <X size={18} aria-hidden="true" />
                                </button>
                            </div>
                        )}

                        {imageError && (
                            <p
                                role="alert"
                                className="mt-3 text-sm text-red-700"
                            >
                                {imageError}
                            </p>
                        )}

                        {ingredients.length > 0 ? (
                            <ul className="mt-4 grid min-w-0 grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {ingredients.map((item) => (
                                    <li
                                        key={item.id}
                                        className="min-w-0 rounded-2xl border border-jood-green/10 bg-jood-background p-3"
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <label
                                                htmlFor={`review-name-${item.id}`}
                                                className="text-sm font-medium"
                                            >
                                                اسم المكوّن
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeIngredient(item.id)
                                                }
                                                aria-label={`حذف ${item.name || 'المكوّن'}`}
                                                className="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-jood-green/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                                            >
                                                <X
                                                    size={18}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>

                                        <input
                                            id={`review-name-${item.id}`}
                                            type="text"
                                            value={item.name}
                                            maxLength={60}
                                            onChange={(event) =>
                                                updateIngredient(item.id, {
                                                    name: event.target.value,
                                                })
                                            }
                                            className={fieldClass}
                                        />

                                        <IngredientExpiry
                                            ingredient={item}
                                            onChange={(changes) =>
                                                updateIngredient(
                                                    item.id,
                                                    changes
                                                )
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-5 rounded-xl bg-jood-background p-4 text-sm leading-7 text-jood-green/70">
                                {imageFile
                                    ? 'الصورة مضافة، ولم تُستخرج منها مكونات بعد'
                                    : 'أضف صورة أو اكتب المكونات الموجودة عندك'}
                            </p>
                        )}

                        <form onSubmit={addIngredient} className="mt-5">
                            <label
                                htmlFor="new-ingredient"
                                className="mb-2 block text-sm font-medium"
                            >
                                إضافة مكوّن
                            </label>

                            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
                                <input
                                    ref={nameInputRef}
                                    id="new-ingredient"
                                    type="text"
                                    value={newIngredient}
                                    maxLength={60}
                                    onChange={(event) => {
                                        setNewIngredient(event.target.value)
                                        setError('')
                                    }}
                                    placeholder="مثل: طماطم"
                                    className={fieldClass}
                                />

                                <button
                                    type="submit"
                                    aria-label="إضافة المكوّن"
                                    className="flex size-12 items-center justify-center rounded-xl bg-jood-green text-white transition-colors hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                                >
                                    <Plus size={22} aria-hidden="true" />
                                </button>
                            </div>
                        </form>

                        {error && (
                            <p
                                role="alert"
                                className="mt-3 text-sm leading-7 text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        <p role="status" className="sr-only">
                            {announcement}
                        </p>
                    </section>

                    <div className="mt-5 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
                        <section
                            aria-labelledby="time-title"
                            className="min-w-0 rounded-3xl bg-white p-4 sm:p-7"
                        >
                            <h2
                                id="time-title"
                                className="flex items-center gap-2 text-lg font-bold"
                            >
                                <Clock3 size={21} aria-hidden="true" />
                                كم عندك وقت؟
                            </h2>

                            <fieldset className="mt-5 min-w-0 border-0 p-0">
                                <legend className="sr-only">
                                    وقت التحضير
                                </legend>

                                <div className="grid grid-cols-2 gap-3">
                                    {timeOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className="min-w-0 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="preparation-time"
                                                value={option.value}
                                                checked={
                                                    preparationTime ===
                                                    option.value
                                                }
                                                onChange={() => {
                                                    setPreparationTime(
                                                        option.value
                                                    )
                                                    setRequestMessage('')
                                                }}
                                                className="peer sr-only"
                                            />

                                            <span className="flex min-h-12 items-center justify-center rounded-xl border border-jood-green/20 px-3 py-2 text-sm transition-colors peer-checked:border-jood-green peer-checked:bg-jood-lime peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-jood-green">
                                                {option.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        </section>

                        <section
                            aria-labelledby="servings-title"
                            className="min-w-0 rounded-3xl bg-white p-4 sm:p-7"
                        >
                            <h2
                                id="servings-title"
                                className="flex items-center gap-2 text-lg font-bold"
                            >
                                <UsersRound size={21} aria-hidden="true" />
                                كم حصة نجهّز؟
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-jood-green/70">
                                حدّد عدد الحصص المطلوبة للوصفة
                            </p>

                            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-jood-background p-3">
                                <button
                                    type="button"
                                    disabled={servings <= 1}
                                    onClick={() => {
                                        setServings((value) =>
                                            Math.max(1, value - 1)
                                        )
                                        setRequestMessage('')
                                    }}
                                    aria-label="تقليل عدد الحصص"
                                    className="flex size-11 items-center justify-center rounded-full bg-white transition-colors enabled:hover:bg-jood-lime disabled:opacity-35"
                                >
                                    <Minus size={20} aria-hidden="true" />
                                </button>

                                <output
                                    aria-live="polite"
                                    aria-label="عدد الحصص"
                                    className="text-xl font-bold"
                                >
                                    {servings}
                                </output>

                                <button
                                    type="button"
                                    disabled={servings >= 20}
                                    onClick={() => {
                                        setServings((value) =>
                                            Math.min(20, value + 1)
                                        )
                                        setRequestMessage('')
                                    }}
                                    aria-label="زيادة عدد الحصص"
                                    className="flex size-11 items-center justify-center rounded-full bg-white transition-colors enabled:hover:bg-jood-lime disabled:opacity-35"
                                >
                                    <Plus size={20} aria-hidden="true" />
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="mt-6 flex justify-start">
                        <button
                            type="button"
                            onClick={handleSuggest}
                            disabled={!canSuggest}
                            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-jood-green px-7 py-3 font-medium text-white transition-colors enabled:hover:bg-jood-lime enabled:hover:text-jood-green disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green sm:w-auto"
                        >
                            اقترح لي وصفات
                        </button>
                    </div>

                    {requestMessage && (
                        <p
                            role="status"
                            className="mt-4 text-sm leading-7 text-jood-green/75"
                        >
                            {requestMessage}
                        </p>
                    )}
                </div>
            </main>

            <footer className="px-4 py-6 text-center text-sm text-jood-green/60">
                © {new Date().getFullYear()} جُود، جميع الحقوق محفوظة
            </footer>
        </div>
    )
}