import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  Check,
} from 'lucide-react'
import logo from '../../assets/images/jood.svg'
import { resetPassword } from '../../services/authApi'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const [recoveryToken, setRecoveryToken] = useState('')
  const [linkError, setLinkError] = useState('')
  const submittingRef = useRef(false)
  const confirmInputRef = useRef(null)
  const titleRef = useRef(null)
  const recoveryProcessedRef = useRef(false)

  const isSaving = status === 'loading' || status === 'check'
  const isSuccess = status === 'success'

  useEffect(() => {
  // Prevent React StrictMode from processing the recovery URL twice
  if (recoveryProcessedRef.current) return

  recoveryProcessedRef.current = true

  const hashParams = new URLSearchParams(
    window.location.hash.substring(1)
  )

  const accessToken = hashParams.get('access_token')
  const type = hashParams.get('type')
  const recoveryError = hashParams.get('error_description')

  if (recoveryError) {
    setLinkError(
      'رابط استعادة كلمة المرور غير صالح أو انتهت صلاحيته.'
    )
    return
  }

  if (!accessToken || type !== 'recovery') {
    setLinkError(
      'رابط استعادة كلمة المرور غير صالح أو انتهت صلاحيته.'
    )
    return
  }

  setRecoveryToken(accessToken)

  // Remove sensitive recovery tokens from the address bar
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  )
}, [])

  useEffect(() => {
    if (isSuccess) {
      titleRef.current?.focus()
    }
  }, [isSuccess])

  async function handleSubmit(event) {
  event.preventDefault()

  if (submittingRef.current) return

  if (!recoveryToken) {
    setError(
      'رابط استعادة كلمة المرور غير صالح أو انتهت صلاحيته.'
    )
    return
  }

  if (password.length < 8) {
    setError('كلمة المرور لازم تكون ٨ أحرف على الأقل.')
    return
  }

  if (password !== confirmPassword) {
    setError('كلمتا المرور غير متطابقتين.')
    confirmInputRef.current?.focus()
    return
  }

  setError('')
  submittingRef.current = true
  setStatus('loading')

  try {
    await resetPassword(recoveryToken, password)

    setPassword('')
    setConfirmPassword('')
    setRecoveryToken('')
    setStatus('success')
  } catch (error) {
    setStatus('idle')

    setError(
      error.message ||
      'تعذّر تغيير كلمة المرور. اطلب رابط استعادة جديدًا وحاول مرة أخرى.'
    )
  } finally {
    submittingRef.current = false
  }
}

  const inputClassName =
    'min-h-12 w-full rounded-xl border border-jood-green/20 bg-jood-background/50 py-3 pl-4 pr-14 text-base text-jood-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green'

  const eyeButtonClassName =
    'absolute inset-y-0 right-1 my-auto flex size-11 items-center justify-center rounded-lg text-jood-green/70 hover:text-jood-green focus-visible:outline-2 focus-visible:outline-jood-green'

  const buttonClassName =
    'jood-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-jood-green px-6 py-3 text-base font-medium text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none'

  return (
    <div className="min-h-dvh bg-white p-3 sm:p-5">
      <main className="jood-fixed-watermark relative isolate flex min-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-3xl bg-jood-background px-5 py-6 sm:min-h-[calc(100dvh-2.5rem)] sm:px-8">

        <Link
          to="/login"
          aria-label="العودة لتسجيل الدخول"
          className="group ms-auto inline-flex min-h-12 w-fit flex-row-reverse items-center rounded-full border border-jood-green/15 bg-white px-3 text-jood-green shadow-sm transition-colors duration-200 hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none"
        >
          <ArrowLeft
            size={22}
            aria-hidden="true"
            className="shrink-0"
          />

          <span
            aria-hidden="true"
            className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:max-w-40 group-hover:pl-2 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:pl-2 group-focus-visible:opacity-100 motion-reduce:transition-none"
          >
            تسجيل الدخول
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

          {!isSuccess && (
            <>
              <h1 className="stylistic-text mt-6 text-center text-3xl font-bold leading-relaxed text-jood-green">
                كلمة مرور جديدة
              </h1>

              <p className="mt-2 text-center text-base leading-7 text-jood-green/75">
                اكتب كلمة المرور الجديدة وأكّدها لحفظ التغيير
              </p>
            </>
          )}

          {linkError ? (
  <div className="mt-6 rounded-3xl bg-white px-6 py-8 text-center shadow-sm sm:px-8 sm:py-9">
    <h1 className="stylistic-text text-2xl font-bold leading-relaxed text-jood-green">
      الرابط غير صالح
    </h1>

    <p className="mt-3 text-base leading-7 text-jood-green/70">
      {linkError}
    </p>

    <Link
      to="/login"
      className={`${buttonClassName} mt-6 hover:bg-jood-lime hover:text-jood-green`}
    >
      العودة لتسجيل الدخول
    </Link>
  </div>
) : isSuccess ? (
            <div className="mt-6 rounded-3xl bg-white px-6 py-8 text-center shadow-sm sm:px-8 sm:py-9">

              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-jood-lime text-jood-green">
                <Check
                  size={30}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </div>

              <h1
                ref={titleRef}
                tabIndex={-1}
                className="stylistic-text mt-5 text-center text-2xl font-bold leading-relaxed text-jood-green outline-none"
              >
                تم تغيير كلمة المرور
              </h1>

              <p className="mx-auto mt-2 max-w-xs text-center text-base leading-7 text-jood-green/70">
                تقدر الآن تسجّل دخولك باستخدام كلمة المرور الجديدة
              </p>

              <Link
                to="/login"
                className={`${buttonClassName} mt-6 hover:bg-jood-lime hover:text-jood-green`}
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (

            <form
              onSubmit={handleSubmit}
              className="mt-5 rounded-3xl bg-white p-5 sm:p-6"
            >

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-jood-green"
                >
                  كلمة المرور الجديدة
                </label>

                <div className="relative">
                  <input
                    id="new-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    dir="ltr"
                    required
                    readOnly={isSaving}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setError('')
                    }}
                    className={inputClassName}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((visible) => !visible)
                    }
                    aria-label={
                      showPassword
                        ? 'إخفاء كلمة المرور'
                        : 'إظهار كلمة المرور'
                    }
                    aria-controls="new-password"
                    className={eyeButtonClassName}
                  >
                    {showPassword ? (
                      <EyeOff
                        size={20}
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        size={20}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="confirm-new-password"
                  className="mb-2 block text-sm font-medium text-jood-green"
                >
                  تأكيد كلمة المرور
                </label>

                <div className="relative">
                  <input
                    ref={confirmInputRef}
                    id="confirm-new-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    dir="ltr"
                    required
                    readOnly={isSaving}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value)
                      setError('')
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error ? 'password-error' : undefined
                    }
                    className={`${inputClassName} aria-invalid:border-red-600`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (visible) => !visible
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'إخفاء تأكيد كلمة المرور'
                        : 'إظهار تأكيد كلمة المرور'
                    }
                    aria-controls="confirm-new-password"
                    className={eyeButtonClassName}
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        size={20}
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        size={20}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>

                {error && (
                  <p
                    id="password-error"
                    role="alert"
                    className="mt-2 text-sm leading-6 text-red-700"
                  >
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                aria-busy={isSaving}
                className={`${buttonClassName} mt-6 enabled:hover:bg-jood-lime enabled:hover:text-jood-green disabled:cursor-default`}
              >
                {status === 'idle' && 'حفظ كلمة المرور'}

                {status === 'loading' && (
                  <>
                    <LoaderCircle
                      size={20}
                      aria-hidden="true"
                      className="animate-spin motion-reduce:animate-none"
                    />
                    <span>جاري الحفظ</span>
                  </>
                )}

                {status === 'check' && (
                  <>
                    <Check
                      size={24}
                      aria-hidden="true"
                    />
                    <span className="sr-only">
                      اكتمل الحفظ
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          <p
            role="status"
            className="sr-only"
          >
            {status === 'loading' && 'جاري الحفظ'}
          </p>
        </div>
      </main>
    </div>
  )
}