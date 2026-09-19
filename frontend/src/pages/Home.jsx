import { useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    UserRound,
    ChevronDown,
    SlidersHorizontal,
    Plus,
    X,
    ArrowRight,
    CalendarDays,
} from 'lucide-react'
import { detectIngredients } from '../services/ingredientApi'
import IngredientUpload from '../components/home/IngredientUpload'
import logo from '../assets/images/jood3.svg'

const inputClassName =
    'min-h-12 min-w-0 w-full rounded-xl border border-jood-green/20 bg-white px-3 py-3 text-base text-jood-green placeholder:text-jood-green/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green sm:px-4'

const expiryOptions = [
    { value: 'today', label: 'اليوم' },
    { value: 'two-days', label: 'خلال يومين' },
    { value: 'week', label: 'خلال أسبوع' },
    { value: 'date', label: 'أعرف التاريخ' },
]

function emptyExpiry() {
    return {
        expiringSoon: false,
        expiryMode: '',
        expiryDate: '',
        expiryEstimateRecordedOn: '',
    }
}

function getLocalDate() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function IngredientExpiry({ ingredient, onChange }) {
    const id = useId()
    const triggerRef = useRef(null)

    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState('')
    const [date, setDate] = useState('')
    const [expiryError, setExpiryError] = useState('')

    const savedMode =
        ingredient.expiryMode || (ingredient.expiryDate ? 'date' : '')

    const hasExpiry =
        ingredient.expiringSoon ?? Boolean(savedMode)

    function openEditor() {
        setMode(hasExpiry ? savedMode : '')
        setDate(hasExpiry ? ingredient.expiryDate || '' : '')
        setExpiryError('')
        setIsOpen(true)
    }

    function closeEditor() {
        setIsOpen(false)
        triggerRef.current?.focus()
    }

    function saveExpiry() {
        if (!mode) {
            setExpiryError('اختَر المدة أو حدّد التاريخ')
            return
        }

        if (mode === 'date' && !date) {
            setExpiryError('حدّد تاريخ الانتهاء')
            return
        }

        onChange({
            expiringSoon: true,
            expiryMode: mode,
            expiryDate: mode === 'date' ? date : '',
            expiryEstimateRecordedOn:
                mode === 'date' ? '' : getLocalDate(),
        })

        closeEditor()
    }

    function clearExpiry() {
        onChange(emptyExpiry())
        closeEditor()
    }

    const selectedLabel =
        expiryOptions.find((option) => option.value === savedMode)?.label

    return (
        <div className="relative mt-3">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2">
                <input
                    ref={triggerRef}
                    type="checkbox"
                    checked={hasExpiry || isOpen}
                    onChange={(event) => {
                        if (event.target.checked) {
                            openEditor()
                        } else if (hasExpiry) {
                            clearExpiry()
                        } else {
                            closeEditor()
                        }
                    }}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-editor`}
                    className="size-5 shrink-0 accent-jood-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                />

                <span className="text-sm font-medium text-jood-green">
                    قرب ينتهي
                </span>

                <span className="text-xs text-jood-green/45">
                    اختياري
                </span>
            </label>

            {isOpen && (
                <div
                    id={`${id}-expiry-options`}
                    className="absolute right-0 top-full z-30 mt-1 w-[min(18rem,calc(100vw_-_4rem))] rounded-2xl border border-jood-green/15 bg-white/90 p-4 shadow-xl backdrop-blur-sm"                              >
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">
                            قد إيش باقي تقريبًا؟
                        </p>

                        <button
                            type="button"
                            onClick={closeEditor}
                            aria-label="إغلاق"
                            className="flex size-9 items-center justify-center rounded-full hover:bg-jood-background"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </div>

                    <fieldset className="mt-4 border-0 p-0">
                        <legend className="sr-only">
                            مدة صلاحية المكوّن
                        </legend>

                        <div className="grid grid-cols-2 gap-2">
                            {expiryOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className="cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name={`${id}-expiry`}
                                        value={option.value}
                                        checked={mode === option.value}
                                        onChange={() => {
                                            setMode(option.value)
                                            setExpiryError('')

                                            if (option.value !== 'date') {
                                                setDate('')
                                            }
                                        }}
                                        className="peer sr-only"
                                    />

                                    <span className="jood-button flex min-h-11 items-center justify-center rounded-xl border border-jood-green/20 px-2 py-2 text-center text-sm transition-colors peer-checked:border-jood-green peer-checked:bg-jood-lime">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {mode === 'date' && (
                        <div className="mt-3">
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
                                value={date}
                                onChange={(event) => {
                                    setDate(event.target.value)
                                    setExpiryError('')
                                }}
                                data-filled={Boolean(date)}
                                className={`${inputClassName} ingredient-date`}
                            />
                        </div>
                    )}

                    {expiryError && (
                        <p className="mt-3 text-sm text-red-700">
                            {expiryError}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={saveExpiry}
                        className="jood-button mt-4 min-h-11 w-full rounded-full bg-jood-green px-4 py-2 font-medium text-white hover:bg-jood-lime hover:text-jood-green"
                    >
                        حفظ
                    </button>

                    {hasExpiry && (
                        <button
                            type="button"
                            onClick={clearExpiry}
                            className="mt-2 min-h-10 w-full rounded-full text-sm text-jood-green/60 hover:bg-jood-background"
                        >
                            إزالة تحديد الصلاحية
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default function Home({ userName = '' }) {
    const navigate = useNavigate()
    const nameInputRef = useRef(null)

    const [ingredient, setIngredient] = useState('')
    const [draftExpiry, setDraftExpiry] = useState(emptyExpiry)
    const [error, setError] = useState('')
    const [announcement, setAnnouncement] = useState('')
    const [isDetecting, setIsDetecting] = useState(false)

    const [imageFile, setImageFile] = useState(null)
const [ingredients, setIngredients] = useState([])

    const nextIdRef = useRef(
        Math.max(
            0,
            ...ingredients.map((item) => Number(item.id) || 0)
        ) + 1
    )

    const canContinue = ingredients.length > 0 || Boolean(imageFile)

    function updateDraftExpiry(changes) {
        setDraftExpiry((current) => ({
            ...current,
            ...changes,
        }))
        setError('')
    }

    function addIngredient(event) {
        event.preventDefault()

        const name = ingredient.trim().replace(/\s+/g, ' ')

        if (!name) {
            setError('اكتب اسم المكوّن أول')
            nameInputRef.current?.focus()
            return
        }

        const alreadyExists = ingredients.some((item) => {
            const itemMode =
                item.expiryMode || (item.expiryDate ? 'date' : '')

            const itemEnabled =
                item.expiringSoon ?? Boolean(itemMode)

            return (
                item.name.trim().toLocaleLowerCase() ===
                name.toLocaleLowerCase() &&
                itemEnabled === draftExpiry.expiringSoon &&
                itemMode === draftExpiry.expiryMode &&
                (item.expiryDate || '') === draftExpiry.expiryDate &&
                (item.expiryEstimateRecordedOn || '') ===
                draftExpiry.expiryEstimateRecordedOn
            )
        })

        if (alreadyExists) {
            setError('هذا المكوّن موجود بنفس بيانات الانتهاء')
            nameInputRef.current?.focus()
            return
        }

        const newIngredient = {
    id: nextIdRef.current++,
    name,
    source: 'home-manual',
    ...draftExpiry,
}

        setIngredients((current) => [...current, newIngredient])
        setIngredient('')
        setDraftExpiry(emptyExpiry())
        setError('')
        setAnnouncement(`تمت إضافة ${name}`)
        nameInputRef.current?.focus()
    }

    function removeIngredient(id) {
        const removed = ingredients.find((item) => item.id === id)

        setIngredients((current) =>
            current.filter((item) => item.id !== id)
        )

        setError('')

        if (removed) {
            setAnnouncement(`تم حذف ${removed.name}`)
        }

        nameInputRef.current?.focus()
    }

    function updateIngredientExpiry(id, changes) {
        setIngredients((current) =>
            current.map((item) =>
                item.id === id ? { ...item, ...changes } : item
            )
        )
        setError('')
    }

    async function handleContinue() {
    if (!canContinue) {
        setError('أضف صورة أو مكوّن للمتابعة')
        nameInputRef.current?.focus()
        return
    }

    if (ingredient.trim()) {
        setError('اضغط إضافة المكوّن أو امسح اسمه قبل المتابعة')
        nameInputRef.current?.focus()
        return
    }

    if (draftExpiry.expiringSoon) {
        setError('اكتب اسم المكوّن وأضفه أو ألغِ خيار قرب ينتهي')
        nameInputRef.current?.focus()
        return
    }

    setError('')
    setIsDetecting(true)

    try {
        let detectedIngredients = []

        if (imageFile) {
            const response = await detectIngredients(imageFile)

            detectedIngredients = (response.ingredients || []).map((item) => ({
    id: nextIdRef.current++,
    name: item.name,
    name_ar: item.name_ar || item.name,
    confidence: item.confidence,
    detectedByAI: true,
    source: 'image',
    ...emptyExpiry(),
}))
        }

        const allIngredients = [
            ...ingredients.map((item) => ({ ...item })),
            ...detectedIngredients,
        ]

        navigate('/ingredients/review', {
            state: {
                ingredients: allIngredients,
                imageFile,
            },
        })
    } catch (err) {
        setError(
            err instanceof Error
                ? err.message
                : 'تعذّر تحليل الصورة. حاول مرة ثانية.'
        )
    } finally {
        setIsDetecting(false)
    }
}

    return (
        <div
            dir="rtl"
            className="flex min-h-dvh flex-col bg-white text-jood-green"
        >
            <header className="bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
                    <Link to="/app" aria-label="جُود الرئيسية">
                        <img
                            src={logo}
                            alt="جُود"
                            className="h-auto w-28 sm:w-32"
                        />
                    </Link>

                    <details className="group relative">
                        <summary className="jood-button flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full bg-jood-background px-4 py-2 text-sm font-medium transition-colors hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
                            <UserRound size={20} aria-hidden="true" />
                            <span>حسابي</span>

                            <ChevronDown
                                size={16}
                                aria-hidden="true"
                                className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
                            />
                        </summary>

                        <nav
                            aria-label="قائمة حسابي"
                            className="absolute left-0 top-full z-20 mt-2 w-48 rounded-2xl bg-white p-2 shadow-lg"
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
                                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-jood-background focus-visible:outline-2 focus-visible:outline-jood-green motion-reduce:transition-none"
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

            <main className="jood-fixed-watermark relative isolate mx-3 my-3 min-h-[90svh] flex-1 overflow-hidden rounded-3xl bg-jood-background px-3 py-6 sm:mx-5 sm:px-8 lg:py-14">

                <div className="mx-auto min-w-0 max-w-5xl">
                    <div className="mb-8 lg:mb-10">
                        {userName.trim() && (
                            <p className="mb-3 text-base text-jood-green/75">
                                هلا {userName.trim()}!
                            </p>
                        )}

                        <h1 className="stylistic-text text-3xl font-bold leading-relaxed sm:text-4xl">
                            وش بنطبخ اليوم؟
                        </h1>

                        <p className="mt-3 text-base leading-8 text-jood-green/75">
                            صوّر الموجود عندك، اكتب مكوناتك، أو استخدم الاثنين
                        </p>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
                        <section
                            aria-labelledby="photo-ingredients-title"
                            className="h-full min-w-0 rounded-3xl bg-white p-4 sm:p-7"
                        >
                            <h2
                                id="photo-ingredients-title"
                                className="stylistic-text text-xl font-bold leading-relaxed sm:text-2xl"
                            >
                                أضف مكوناتك بصورة
                            </h2>

                            <p className="mt-2 text-sm leading-7 text-jood-green/75">
                                خلّ المكونات واضحة والإضاءة جيدة
                            </p>

                            <IngredientUpload
                                file={imageFile}
                                onFileChange={(file) => {
                                    setImageFile(file)
                                    setError('')
                                }}
                            />
                        </section>

                        <section
                            aria-labelledby="manual-ingredients-title"
                            className="h-full min-w-0 rounded-3xl bg-white p-4 sm:p-7"
                        >
                            <h2
                                id="manual-ingredients-title"
                                className="stylistic-text text-xl font-bold leading-relaxed sm:text-2xl"
                            >
                                أو اكتب المكونات بنفسك
                            </h2>

                            <p className="mt-2 text-sm leading-7 text-jood-green/75">
                                أضف مكوناتك، وحدّد اللي قرب ينتهي إذا تعرف
                            </p>

                            <form onSubmit={addIngredient} className="mt-5">
                                <label
                                    htmlFor="ingredient-name"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    اسم المكوّن
                                </label>

                                <input
                                    ref={nameInputRef}
                                    id="ingredient-name"
                                    name="ingredient"
                                    type="text"
                                    value={ingredient}
                                    onChange={(event) => {
                                        setIngredient(event.target.value)
                                        setError('')
                                    }}
                                    placeholder="مثل: طماطم"
                                    maxLength={60}
                                    aria-describedby={
                                        error ? 'ingredient-error' : undefined
                                    }
                                    className={inputClassName}
                                />

                                <IngredientExpiry
                                    ingredient={draftExpiry}
                                    onChange={updateDraftExpiry}
                                />

                                {error && (
                                    <p
                                        id="ingredient-error"
                                        role="alert"
                                        className="mt-3 text-sm leading-7 text-red-700"
                                    >
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="jood-button mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-jood-green px-5 py-3 text-base font-medium text-white transition-colors hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none"
                                >
                                    <Plus size={20} aria-hidden="true" />
                                    إضافة المكوّن
                                </button>
                            </form>
                        </section>
                    </div>

                    <p role="status" aria-atomic="true" className="sr-only">
                        {announcement}
                    </p>

                    {ingredients.length > 0 && (
                        <section
                            aria-labelledby="ingredients-list-title"
                            className="mt-6 min-w-0 rounded-3xl bg-white p-4 sm:p-7"
                        >
                            <h2
                                id="ingredients-list-title"
                                className="stylistic-text text-xl font-bold sm:text-2xl"
                            >
                                مكوناتك
                                <span className="ms-2 text-base font-normal text-jood-green/65">
                                    ({ingredients.length})
                                </span>
                            </h2>

                            <ul className="mt-4 grid min-w-0 grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {ingredients.map((item) => (
                                    <li
                                        key={item.id}
                                        className="min-w-0 rounded-2xl border border-jood-green/10 bg-jood-background p-3"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <h3 className="min-w-0 break-words text-base font-medium">
                                                {item.name}
                                            </h3>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeIngredient(item.id)
                                                }
                                                aria-label={`حذف ${item.name}`}
                                                className="jood-button ms-auto flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-jood-green transition-colors hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green motion-reduce:transition-none"
                                            >
                                                <X
                                                    size={18}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>

                                        <IngredientExpiry
                                            ingredient={item}
                                            onChange={(changes) =>
                                                updateIngredientExpiry(
                                                    item.id,
                                                    changes
                                                )
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {isDetecting && (
    <div
        role="status"
        className="mt-6 flex flex-col items-center justify-center rounded-3xl bg-white p-6 text-center"
    >
        <span
            aria-hidden="true"
            className="block size-8 animate-spin rounded-full border-2 border-jood-green/20 border-t-jood-green"
        />

        <p className="mt-4 font-medium text-jood-green">
            جاري تحليل الصورة...
        </p>

        <p className="mt-2 text-sm text-jood-green/60">
            قاعدين نتعرّف على المكونات الموجودة
        </p>
    </div>
)}

                    {canContinue && (
                        <div className="mt-6 flex justify-start">
                            <button
    type="button"
    onClick={handleContinue}
    disabled={isDetecting}
    className="jood-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-jood-green px-8 py-3 text-base font-medium text-white transition-colors hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:px-10"
>
    <ArrowRight size={20} aria-hidden="true" />

    {isDetecting
        ? 'جاري تحليل الصورة...'
        : imageFile
          ? 'تحليل الصورة'
          : 'التالي'}
</button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="px-5 py-5 text-center">
                <p className="text-sm text-jood-green/65">
                    © {new Date().getFullYear()} جُود، جميع الحقوق محفوظة
                </p>
            </footer>
        </div>
    )
}