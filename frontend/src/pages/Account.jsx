import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft,
    Bookmark,
    Check,
    LockKeyhole,
    LogOut,
    ShoppingBasket,
    SlidersHorizontal,
    UserRound,
} from 'lucide-react'

import RecipeLayout from '../components/recipe/RecipeLayout'
import {
    primaryButton,
    secondaryButton,
} from '../components/recipe/recipeStyles'

const profileKey = 'jood-profile-draft'

const inputClass =
    'min-h-12 w-full min-w-0 rounded-xl border border-jood-green/20 bg-jood-background/50 px-4 py-3 text-base text-jood-green placeholder:text-jood-green/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green'

function readProfile() {
    // BACKEND: Replace this local profile read with the authenticated current-user/profile endpoint.
    try {
        const stored = JSON.parse(
            localStorage.getItem(profileKey) || '{}'
        )

        return {
            name: typeof stored?.name === 'string' ? stored.name : '',
            email: typeof stored?.email === 'string' ? stored.email : '',
        }
    } catch {
        return { name: '', email: '' }
    }
}

const shortcuts = [
    {
        to: '/preferences',
        title: 'تفضيلاتي الغذائية',
        description: 'نظامك الغذائي والحساسية والمطابخ اللي تحبها',
        icon: SlidersHorizontal,
    },
    {
        to: '/recipes?view=saved',
        title: 'وصفاتي المحفوظة',
        description: 'الوصفات اللي عجبتك وتبغى ترجع لها',
        icon: Bookmark,
    },
    {
        to: '/shopping-list',
        title: 'قائمة التسوق',
        description: 'المكونات اللي تحتاجها لطبختك الجاية',
        icon: ShoppingBasket,
    },
    {
        to: '/account/password',
        title: 'تغيير كلمة المرور',
        description: 'تحديث كلمة المرور الخاصة بحسابك',
        icon: LockKeyhole,
    },
]

export default function Account() {
    const [savedProfile, setSavedProfile] = useState(readProfile)
    const [name, setName] = useState(savedProfile.name)
    const [email, setEmail] = useState(savedProfile.email)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [saved, setSaved] = useState(false)

    const timerRef = useRef(null)

    useEffect(() => {
        return () => window.clearTimeout(timerRef.current)
    }, [])

    const changed =
        name.trim() !== savedProfile.name ||
        email.trim() !== savedProfile.email

    function clearFeedback() {
        setMessage('')
        setError('')
        setSaved(false)
        window.clearTimeout(timerRef.current)
    }

    function handleSave(event) {
        event.preventDefault()

        const nextProfile = {
            name: name.trim().replace(/\s+/g, ' '),
            email: email.trim(),
        }

        if (!nextProfile.name) {
            setError('اكتب اسمك أول')
            return
        }

        try {
            // BACKEND: Replace localStorage with the authenticated profile update endpoint.
            localStorage.setItem(
                profileKey,
                JSON.stringify(nextProfile)
            )

            setSavedProfile(nextProfile)
            setName(nextProfile.name)
            setEmail(nextProfile.email)
            setError('')
            setMessage('تم حفظ البيانات على هذا المتصفح')
            setSaved(true)

            window.clearTimeout(timerRef.current)
            timerRef.current = window.setTimeout(() => {
                setSaved(false)
            }, 2000)
        } catch {
            setError('تعذّر حفظ البيانات، جرّب مرة ثانية')
        }
    }

    return (
        <RecipeLayout>
            <div className="flex justify-end">
                <Link to="/app" className={secondaryButton}>
                    العودة للرئيسية
                    <ArrowLeft size={18} aria-hidden="true" />
                </Link>
            </div>

            <div className="mt-7 flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-jood-lime sm:size-20">
                    <UserRound
                        size={32}
                        strokeWidth={1.6}
                        aria-hidden="true"
                    />
                </div>

                <div className="min-w-0">
                    <h1 className="stylistic-text text-3xl font-bold sm:text-4xl">
                        حسابي
                    </h1>

                    <p className="mt-2 break-words text-sm leading-7 text-jood-green/70">
                        {savedProfile.name
                            ? `هلا ${savedProfile.name}، هنا كل اللي يخصّك`
                            : 'بياناتك وتفضيلاتك ووصفاتك في مكان واحد'}
                    </p>
                </div>
            </div>

            <div className="mt-7 grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-2">
                <section
                    aria-labelledby="profile-title"
                    className="min-w-0 rounded-3xl bg-white p-5 sm:p-7"
                >
                    <h2
                        id="profile-title"
                        className="stylistic-text text-2xl font-bold"
                    >
                        بياناتي الشخصية
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-jood-green/65">
                        حدّث اسمك وبريدك من هنا
                    </p>

                    <form onSubmit={handleSave} className="mt-5">
                        <label
                            htmlFor="account-name"
                            className="mb-2 block text-sm font-medium"
                        >
                            الاسم
                        </label>

                        <input
                            id="account-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            maxLength={80}
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value)
                                clearFeedback()
                            }}
                            placeholder="اكتب اسمك"
                            className={inputClass}
                        />

                        <label
                            htmlFor="account-email"
                            className="mb-2 mt-5 block text-sm font-medium"
                        >
                            البريد الإلكتروني
                        </label>

                        <input
                            id="account-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            required
                            maxLength={254}
                            dir="ltr"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value)
                                clearFeedback()
                            }}
                            placeholder="name@example.com"
                            className={`${inputClass} text-right`}
                        />

                        {error && (
                            <p
                                role="alert"
                                className="mt-4 text-sm text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!changed || saved}
                            className={`${primaryButton} mt-6 w-full`}
                        >
                            {saved && (
                                <Check size={19} aria-hidden="true" />
                            )}

                            {saved ? 'تم الحفظ' : 'حفظ التعديلات'}
                        </button>

                        <p
                            role="status"
                            aria-atomic="true"
                            className="mt-3 text-sm text-jood-green/70"
                        >
                            {message}
                        </p>
                    </form>
                </section>

                <section
                    aria-labelledby="account-links-title"
                    className="min-w-0 rounded-3xl bg-white p-5 sm:p-7"
                >
                    <h2
                        id="account-links-title"
                        className="stylistic-text text-2xl font-bold"
                    >
                        اختياراتي
                    </h2>

                    <div className="mt-5 space-y-3">
                        {shortcuts.map((item) => {
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    state={{ returnTo: '/account' }}
                                    className="flex items-center gap-3 rounded-2xl bg-jood-background p-4 transition-colors hover:bg-jood-lime/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white">
                                        <Icon
                                            size={20}
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium">
                                            {item.title}
                                        </span>

                                        <span className="mt-1 block text-xs leading-6 text-jood-green/65">
                                            {item.description}
                                        </span>
                                    </span>

                                    <ArrowLeft
                                        size={18}
                                        aria-hidden="true"
                                        className="shrink-0"
                                    />
                                </Link>
                            )
                        })}
                    </div>

                    <div className="mt-5 border-t border-jood-green/10 pt-5">
                        {/* BACKEND: Replace the direct login link with a logout request/session clear, then navigate to /login. */}
                        <Link
                            to="/login"
                            replace
                            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                        >
                            <LogOut size={18} aria-hidden="true" />
                            تسجيل الخروج
                        </Link>
                    </div>
                </section>
            </div>
        </RecipeLayout>
    )
}