import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft,
    Eye,
    EyeOff,
    LockKeyhole,
} from 'lucide-react'

import RecipeLayout from '../components/recipe/RecipeLayout'
import {
    primaryButton,
    secondaryButton,
} from '../components/recipe/recipeStyles'
import { changePassword } from '../services/authApi'

function PasswordField({
    label,
    value,
    onChange,
    autoComplete,
    inputRef,
    error,
    hint,
}) {
    const id = useId()
    const [visible, setVisible] = useState(false)

    const describedBy = [
        hint ? `${id}-hint` : '',
        error ? `${id}-error` : '',
    ].filter(Boolean).join(' ') || undefined

    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-medium"
            >
                {label}
            </label>

            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    type={visible ? 'text' : 'password'}
                    autoComplete={autoComplete}
                    required
                    maxLength={128}
                    value={value}
                    onChange={onChange}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                    className="min-h-12 w-full min-w-0 rounded-xl border border-jood-green/20 bg-jood-background/50 py-3 pe-14 ps-4 text-base text-jood-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                />

                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={
                        visible
                            ? `إخفاء ${label}`
                            : `إظهار ${label}`
                    }
                    aria-controls={id}
                    className="absolute inset-y-0 left-1 flex w-11 items-center justify-center rounded-lg text-jood-green/65 hover:text-jood-green focus-visible:outline-2 focus-visible:outline-jood-green"
                >
                    {visible ? (
                        <EyeOff size={20} aria-hidden="true" />
                    ) : (
                        <Eye size={20} aria-hidden="true" />
                    )}
                </button>
            </div>

            {hint && (
                <p
                    id={`${id}-hint`}
                    className="mt-2 text-xs leading-6 text-jood-green/60"
                >
                    {hint}
                </p>
            )}

            {error && (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="mt-2 text-sm text-red-700"
                >
                    {error}
                </p>
            )}
        </div>
    )
}

export default function ChangePassword() {
    const currentRef = useRef(null)
    const newRef = useRef(null)
    const confirmRef = useRef(null)

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    function clearFeedback() {
        setErrors({})
        setMessage('')
    }

    async function handleSubmit(event) {
    event.preventDefault()

    if (loading) return

    if (!currentPassword.trim()) {
        setErrors({
            current: 'اكتب كلمة المرور الحالية',
        })
        currentRef.current?.focus()
        return
    }

    if (newPassword.trim().length < 8) {
        setErrors({
            new: 'كلمة المرور الجديدة لازم تكون ٨ أحرف على الأقل',
        })
        newRef.current?.focus()
        return
    }

    if (newPassword === currentPassword) {
        setErrors({
            new: 'اختَر كلمة مرور مختلفة عن الحالية',
        })
        newRef.current?.focus()
        return
    }

    if (newPassword !== confirmPassword) {
        setErrors({
            confirm: 'كلمتا المرور غير متطابقتين',
        })
        confirmRef.current?.focus()
        return
    }

    setErrors({})
    setMessage('')
    setLoading(true)

    try {
        await changePassword(
            currentPassword,
            newPassword
        )

        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')

        setMessage('تم تغيير كلمة المرور بنجاح')
    } catch (error) {
        if (
            error.message ===
            'Current password is incorrect'
        ) {
            setErrors({
                current: 'كلمة المرور الحالية غير صحيحة',
            })

            currentRef.current?.focus()
        } else {
            setMessage(
                error.message ||
                'تعذّر تغيير كلمة المرور'
            )
        }
    } finally {
        setLoading(false)
    }
}

    return (
        <RecipeLayout>
            <div className="flex justify-end">
                <Link to="/account" className={secondaryButton}>
                    العودة لحسابي
                    <ArrowLeft size={18} aria-hidden="true" />
                </Link>
            </div>

            <div className="mx-auto mt-7 max-w-xl">
                <div className="flex size-16 items-center justify-center rounded-full bg-jood-lime">
                    <LockKeyhole
                        size={28}
                        strokeWidth={1.7}
                        aria-hidden="true"
                    />
                </div>

                <h1 className="stylistic-text mt-5 text-3xl font-bold leading-relaxed">
                    تغيير كلمة المرور
                </h1>

                <p className="mt-3 leading-8 text-jood-green/70">
                    اختَر كلمة مرور جديدة وسهلة عليك تتذكّرها
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 rounded-3xl bg-white p-5 sm:p-7"
                >
                    <div className="space-y-5">
                        <PasswordField
                            label="كلمة المرور الحالية"
                            inputRef={currentRef}
                            value={currentPassword}
                            autoComplete="current-password"
                            error={errors.current}
                            onChange={(event) => {
                                setCurrentPassword(event.target.value)
                                clearFeedback()
                            }}
                        />

                        <PasswordField
                            label="كلمة المرور الجديدة"
                            inputRef={newRef}
                            value={newPassword}
                            autoComplete="new-password"
                            hint="٨ أحرف على الأقل"
                            error={errors.new}
                            onChange={(event) => {
                                setNewPassword(event.target.value)
                                clearFeedback()
                            }}
                        />

                        <PasswordField
                            label="تأكيد كلمة المرور الجديدة"
                            inputRef={confirmRef}
                            value={confirmPassword}
                            autoComplete="new-password"
                            error={errors.confirm}
                            onChange={(event) => {
                                setConfirmPassword(event.target.value)
                                clearFeedback()
                            }}
                        />
                    </div>

                    <button
    type="submit"
    disabled={loading}
    className={`${primaryButton} mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60`}
>
    {loading
        ? 'جاري الحفظ...'
        : 'حفظ كلمة المرور'}
</button>

                    <p
                        role="status"
                        aria-atomic="true"
                        className="mt-3 text-sm leading-7 text-jood-green/75"
                    >
                        {message}
                    </p>
                </form>
            </div>
        </RecipeLayout>
    )
}