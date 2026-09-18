import { Link, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import logo from '../../assets/images/jood.svg'
import { signup, login } from '../../services/authApi'

export default function SignUp() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const [message, setMessage] = useState('')
    const [submitStatus, setSubmitStatus] = useState('idle')
    const submittingRef = useRef(false)
    const navigate = useNavigate()

    const inputClassName =
        'min-h-12 w-full rounded-xl border border-jood-green/20 bg-jood-background/50 px-4 py-3 text-base text-jood-green placeholder:text-right placeholder:text-jood-green/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green'

    const eyeButtonClassName =
        'absolute inset-y-0 right-1 my-auto flex size-11 items-center justify-center rounded-lg text-jood-green/70 hover:text-jood-green focus-visible:outline-2 focus-visible:outline-jood-green'

    async function handleSubmit(event) {
    event.preventDefault()

    if (submittingRef.current) return

    setMessage('')

    if (!name.trim()) {
        setMessage('اكتب اسمك قبل المتابعة.')
        return
    }

    if (password !== confirmPassword) {
        setPasswordError('كلمتا المرور غير متطابقتين.')
        return
    }

    setPasswordError('')
    submittingRef.current = true
    setSubmitStatus('loading')

    try {
        await signup(
            name.trim(),
            email.trim(),
            password
        )

        await login(
            email.trim(),
            password
        )

        setSubmitStatus('success')

        navigate('/preferences/setup', {
            replace: true,
        })
    } catch (error) {
        setMessage(
            error.message || 'تعذّر إنشاء الحساب'
        )

        setSubmitStatus('idle')
        submittingRef.current = false
    }
}

    return (
        <div className="min-h-dvh bg-white p-3 sm:p-5">
            <main className="jood-fixed-watermark relative isolate flex min-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-3xl bg-jood-background px-5 py-6 sm:min-h-[calc(100dvh-2.5rem)] sm:px-8">

                <Link
                    to="/"
                    aria-label="الرجوع للرئيسية"
                    className="jood-button group ms-auto inline-flex min-h-12 w-fit items-center rounded-full border border-jood-green/15 bg-white px-3 text-jood-green shadow-sm transition-colors duration-200 hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none"
                >
                    <ArrowLeft
                        size={22}
                        aria-hidden="true"
                        className="shrink-0"
                    />

                    <span
                        aria-hidden="true"
                        className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:max-w-24 group-hover:pr-2 group-hover:opacity-100 group-focus-visible:max-w-24 group-focus-visible:pr-2 group-focus-visible:opacity-100 motion-reduce:transition-none"
                    >
                        الرئيسية
                    </span>
                </Link>

                <div className="mx-auto flex w-full max-w-md flex-col pt-4 pb-6">
                    <Link
                        to="/"
                        aria-label="جُود، الصفحة الرئيسية"
                        className="mx-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green"
                    >
                        <img
                            src={logo}
                            alt="جُود"
                            width={162}
                            height={140}
                            className="h-auto w-20 sm:w-24"
                        />
                    </Link>

                    <h1 className="stylistic-text mt-4 text-center text-3xl font-bold leading-relaxed text-jood-green">
                        أنشئ حسابك في جُـــــود
                    </h1>

                    <p className="mt-2 text-center text-base leading-7 text-jood-green/75">
                        طبخات تناسبك، تبدأ من الموجود عندك
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-5 rounded-3xl bg-white p-5 sm:p-6"
                    >
                        <div>
                            <label
                                htmlFor="signup-name"
                                className="mb-2 block text-sm font-medium text-jood-green"
                            >
                                الاسم
                            </label>

                            <input
                                id="signup-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value)
                                    setMessage('')
                                }}
                                placeholder="اكتب اسمك"
                                className={inputClassName}
                            />
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="signup-email"
                                className="mb-2 block text-sm font-medium text-jood-green"
                            >
                                البريد الإلكتروني
                            </label>

                            <input
                                id="signup-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                spellCheck={false}
                                dir="ltr"
                                required
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value)
                                    setMessage('')
                                }}
                                placeholder="name@example.com"
                                className={inputClassName}
                            />
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="signup-password"
                                className="mb-2 block text-sm font-medium text-jood-green"
                            >
                                كلمة المرور
                            </label>

                            <div className="relative">
                                <input
                                    id="signup-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    dir="ltr"
                                    required
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value)
                                        setPasswordError('')
                                        setMessage('')
                                    }}
                                    className={`${inputClassName} pr-14`}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    aria-label={
                                        showPassword
                                            ? 'إخفاء كلمة المرور'
                                            : 'إظهار كلمة المرور'
                                    }
                                    aria-controls="signup-password"
                                    className={eyeButtonClassName}
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} aria-hidden="true" />
                                    ) : (
                                        <Eye size={20} aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="signup-confirm-password"
                                className="mb-2 block text-sm font-medium text-jood-green"
                            >
                                تأكيد كلمة المرور
                            </label>

                            <div className="relative">
                                <input
                                    id="signup-confirm-password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    dir="ltr"
                                    required
                                    value={confirmPassword}
                                    onChange={(event) => {
                                        setConfirmPassword(event.target.value)
                                        setPasswordError('')
                                        setMessage('')
                                    }}
                                    aria-invalid={Boolean(passwordError)}
                                    aria-describedby={
                                        passwordError ? 'confirm-password-error' : undefined
                                    }
                                    className={`${inputClassName} pr-14 aria-invalid:border-red-600`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword((visible) => !visible)
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? 'إخفاء تأكيد كلمة المرور'
                                            : 'إظهار تأكيد كلمة المرور'
                                    }
                                    aria-controls="signup-confirm-password"
                                    className={eyeButtonClassName}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} aria-hidden="true" />
                                    ) : (
                                        <Eye size={20} aria-hidden="true" />
                                    )}
                                </button>
                            </div>

                            {passwordError && (
                                <p
                                    id="confirm-password-error"
                                    role="alert"
                                    className="mt-2 text-sm leading-6 text-red-700"
                                >
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitStatus !== 'idle'}
                            aria-busy={submitStatus === 'loading'}
                            className="jood-button mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-jood-green px-6 py-3 text-base font-medium text-white transition-colors duration-200 enabled:hover:bg-jood-lime enabled:hover:text-jood-green disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none"
                        >
                            {submitStatus === 'idle' && 'إنشاء الحساب'}

                            {submitStatus === 'loading' && (
                                <>
                                    <LoaderCircle
                                        size={20}
                                        aria-hidden="true"
                                        className="animate-spin motion-reduce:animate-none"
                                    />
                                    <span>جاري إنشاء الحساب</span>
                                </>
                            )}

                            {submitStatus === 'success' && (
                                <>
                                    <span>تم إنشاء الحساب</span>
                                </>
                            )}

                        </button>


                        <p role="status" className="sr-only">
                            {submitStatus === 'loading' && 'جاري إنشاء الحساب'}
                            {submitStatus === 'success' && 'تم إنشاء الحساب'}
                        </p>


                        <p
                            role="status"
                            className="mt-3 text-center text-sm leading-6 text-jood-green"
                        >
                            {message}
                        </p>

                        <p className="mt-4 text-center text-sm leading-7 text-jood-green/75">
                            عندك حساب؟{' '}
                            <Link
                                to="/login"
                                className="inline-flex min-h-11 items-center px-2 font-bold text-jood-green no-underline transition-colors duration-200 hover:text-[#4D7C0F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green motion-reduce:transition-none"
                            >
                                سجّل دخولك
                            </Link>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    )
}