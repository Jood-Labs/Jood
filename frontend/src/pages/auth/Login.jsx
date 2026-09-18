import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { login } from '../../services/authApi'
import logo from '../../assets/images/jood.svg'
import ForgotPasswordDialog from '../../components/auth/ForgotPasswordDialog'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [message, setMessage] = useState('')
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setLoading(true)

    try {
        await login(email, password, rememberMe)

        navigate('/app')
    } catch (error) {
        setMessage(
            error.message || 'تعذّر تسجيل الدخول'
        )
    } finally {
        setLoading(false)
    }
}

    function handleForgotPassword() {
        setMessage('')
        setIsForgotPasswordOpen(true)
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
                            className="h-auto w-24 sm:w-30"
                        />
                    </Link>

                    <h1 className="stylistic-text mt-6 text-center text-3xl font-bold leading-relaxed text-jood-green">
                        أهلًا بعودتك لجُـــــود
                    </h1>

                    <p className="mt-2 text-center text-base leading-7 text-jood-green/75">
                        سجّل دخولك، وخلّنا نشوف وش بنطبخ اليوم
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-5 rounded-3xl bg-white p-5 sm:p-6"
                    >
                        <div>
                            <label
                                htmlFor="login-email"
                                className="mb-2 block text-sm font-medium text-jood-green"
                            >
                                البريد الإلكتروني
                            </label>

                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="username"
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
                                className="min-h-12 w-full rounded-xl border border-jood-green/20 bg-jood-background/50 px-4 py-3 text-base text-jood-green placeholder:text-right placeholder:text-jood-green/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                            />
                        </div>

                        <div className="mt-5">
                            <label
                                htmlFor="login-password"
                                className="mb-2 block text-sm font-medium text-jood-green"
                            >
                                كلمة المرور
                            </label>

                            <div className="relative">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    dir="ltr"
                                    required
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value)
                                        setMessage('')
                                    }}
                                    className="min-h-12 w-full rounded-xl border border-jood-green/20 bg-jood-background/50 py-3 pl-4 pr-14 text-base text-jood-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    aria-label={
                                        showPassword
                                            ? 'إخفاء كلمة المرور'
                                            : 'إظهار كلمة المرور'
                                    }
                                    aria-controls="login-password"
                                    className="absolute inset-y-0 right-1 my-auto flex size-11 items-center justify-center rounded-lg text-jood-green/70 hover:text-jood-green focus-visible:outline-2 focus-visible:outline-jood-green"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} aria-hidden="true" />
                                    ) : (
                                        <Eye size={20} aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-jood-green">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={rememberMe}
                                    onChange={(event) =>
                                        setRememberMe(event.target.checked)
                                    }
                                    className="size-4 accent-jood-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                                />

                                تذكرني
                            </label>

                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="min-h-11 cursor-pointer px-2 text-sm font-medium text-jood-green transition-colors duration-200 hover:text-[#4D7C0F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green motion-reduce:transition-none"
                            >
                                نسيت كلمة المرور؟
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="jood-button mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-jood-green px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                           >              
                            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>

                        <p
                            role="status"
                            className="mt-3 text-center text-sm leading-6 text-jood-green"
                        >
                            {message}
                        </p>

                        <p className="mt-5 text-center text-sm leading-7 text-jood-green/75">
                            ما عندك حساب؟{' '}
                            <Link
                                to="/signup"
                                className="inline-flex min-h-11 items-center px-2 font-bold text-jood-green no-underline transition-colors duration-200 hover:text-[#4D7C0F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green motion-reduce:transition-none"
                            >
                                أنشئ حسابك
                            </Link>
                        </p>
                    </form>
                </div>
                {isForgotPasswordOpen && (
                    <ForgotPasswordDialog
                        onClose={() => setIsForgotPasswordOpen(false)}
                        initialEmail={email}
                    />
                )}
            </main>
        </div>
    )
}