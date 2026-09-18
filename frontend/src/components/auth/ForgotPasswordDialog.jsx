import { useEffect, useRef, useState } from 'react'
import { X, LoaderCircle, Check, Mail } from 'lucide-react'
import { forgotPassword } from '../../services/authApi'

export default function ForgotPasswordDialog({
    onClose,
    initialEmail = '',
}) {
    const dialogRef = useRef(null)
    const titleRef = useRef(null)
    const timersRef = useRef([])
    const submittingRef = useRef(false)

    const [email, setEmail] = useState(initialEmail)
    const [submitStatus, setSubmitStatus] = useState('idle')
    const [showSuccess, setShowSuccess] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [announcement, setAnnouncement] = useState('')

    useEffect(() => {
        const dialog = dialogRef.current
        const timers = timersRef.current

        if (!dialog.open) {
            dialog.showModal()
        }

        titleRef.current?.focus()

        return () => {
            timers.forEach(clearTimeout)
            if (dialog.open) dialog.close()
        }
    }, [])

    useEffect(() => {
        if (showSuccess) {
            titleRef.current?.focus()
        }
    }, [showSuccess])

    useEffect(() => {
        if (cooldown <= 0) return

        const timer = setTimeout(() => {
            setCooldown((remaining) => Math.max(0, remaining - 1))
        }, 1000)

        return () => clearTimeout(timer)
    }, [cooldown])

    function handleClose() {
        timersRef.current.forEach(clearTimeout)
        timersRef.current = []
        onClose()
    }

    async function sendRecoveryRequest() {
    if (submittingRef.current || cooldown > 0) return

    const isResend = showSuccess

    submittingRef.current = true
    setSubmitStatus('loading')
    setAnnouncement(
        isResend
            ? 'جاري إعادة إرسال رابط الاستعادة'
            : 'جاري إرسال رابط الاستعادة'
    )

    try {
        await forgotPassword(email)

        setSubmitStatus('success')
        setShowSuccess(true)
        setCooldown(30)

        setAnnouncement(
            isResend
                ? 'تم طلب إعادة إرسال رابط الاستعادة'
                : 'تم طلب إرسال رابط الاستعادة'
        )
    } catch (error) {
        setSubmitStatus('idle')

        setAnnouncement(
            error.message || 'تعذّر إرسال رابط الاستعادة'
        )
    } finally {
        submittingRef.current = false
    }
}

    function handleSubmit(event) {
        event.preventDefault()
        sendRecoveryRequest()
    }

    const isSending =
        submitStatus === 'loading' || submitStatus === 'check'

    const buttonClassName =
        'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-jood-green px-6 py-3 text-base font-medium text-white transition-colors duration-200 enabled:hover:bg-jood-lime enabled:hover:text-jood-green disabled:cursor-default disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none'

    return (
        <dialog
            ref={dialogRef}
            onCancel={(event) => {
                event.preventDefault()
                handleClose()
            }}
            aria-labelledby="forgot-password-title"
            aria-describedby="forgot-password-description"
            className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border-0 bg-white p-6 text-jood-green shadow-xl backdrop:bg-black/40 sm:p-8"
        >
            <button
                type="button"
                onClick={handleClose}
                aria-label="إغلاق"
                className="ms-auto flex size-11 cursor-pointer items-center justify-center rounded-full border border-jood-green/20 bg-white text-jood-green transition-colors duration-200 hover:bg-jood-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none"
            >
                <X size={20} strokeWidth={2.5} aria-hidden="true" />
            </button>

            {showSuccess && (
                <div className="mx-auto mt-5 flex size-16 items-center justify-center rounded-full bg-jood-lime">
                    <Mail size={28} strokeWidth={1.8} aria-hidden="true" />
                </div>
            )}

            <h2
                ref={titleRef}
                id="forgot-password-title"
                tabIndex={-1}
                className={`stylistic-text mt-5 text-2xl font-bold leading-relaxed outline-none ${showSuccess ? 'text-center' : ''
                    }`}
            >
                {showSuccess ? 'تحقّق من بريدك' : 'نسيت كلمة المرور؟'}
            </h2>

            <p
                id="forgot-password-description"
                className={`mt-3 text-base leading-8 text-jood-green/75 ${showSuccess ? 'text-center' : ''
                    }`}
            >
                {showSuccess
                    ? 'إذا كان البريد مرتبطًا بحساب، بتوصلك رسالة فيها رابط إعادة تعيين كلمة المرور'
                    : 'أدخل البريد المرتبط بحسابك لطلب رابط إعادة تعيين كلمة المرور'}
            </p>

            {showSuccess ? (
                <div className="mt-4 text-center">
                    <p
                        dir="ltr"
                        className="break-all text-base font-medium text-jood-green"
                    >
                        {email}
                    </p>

                    <p className="mt-4 text-sm leading-7 text-jood-green/75">
                        ما وصلتك الرسالة؟ تحقّق من مجلد البريد غير المرغوب فيه
                    </p>

                    <button
                        type="button"
                        onClick={sendRecoveryRequest}
                        disabled={isSending || cooldown > 0}
                        aria-busy={isSending}
                        className={`${buttonClassName} mt-6`}
                    >
                        {submitStatus === 'loading' ? (
                            <>
                                <LoaderCircle
                                    size={20}
                                    aria-hidden="true"
                                    className="animate-spin motion-reduce:animate-none"
                                />
                                <span>جاري إعادة الإرسال…</span>
                            </>
                        ) : submitStatus === 'check' ? (
                            <>
                                <Check size={24} aria-hidden="true" />
                                <span className="sr-only">اكتملت معاينة الإرسال</span>
                            </>
                        ) : cooldown > 0 ? (
                            <span>إعادة الإرسال بعد {cooldown} ثانية</span>
                        ) : (
                            <span>إعادة إرسال الرابط</span>
                        )}
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-6">
                    <label
                        htmlFor="recovery-email"
                        className="mb-2 block text-sm font-medium"
                    >
                        البريد الإلكتروني
                    </label>

                    <input
                        id="recovery-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        dir="ltr"
                        required
                        readOnly={isSending}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="name@example.com"
                        className="min-h-12 w-full rounded-xl border border-jood-green/20 bg-jood-background/50 px-4 py-3 text-base text-jood-green placeholder:text-right placeholder:text-jood-green/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                    />

                    <button
                        type="submit"
                        disabled={isSending}
                        aria-busy={isSending}
                        className={`${buttonClassName} mt-6`}
                    >
                        {submitStatus === 'loading' ? (
                            <>
                                <LoaderCircle
                                    size={20}
                                    aria-hidden="true"
                                    className="animate-spin motion-reduce:animate-none"
                                />
                                <span>جاري الإرسال…</span>
                            </>
                        ) : submitStatus === 'check' ? (
                            <>
                                <Check size={24} aria-hidden="true" />
                                <span className="sr-only">اكتملت معاينة الإرسال</span>
                            </>
                        ) : (
                            'إرسال رابط الاستعادة'
                        )}
                    </button>
                </form>
            )}

            <p role="status" className="sr-only">
                {announcement}
            </p>

        </dialog>
    )
}