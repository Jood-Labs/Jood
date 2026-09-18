import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PreferenceOptions from '../components/preferences/PreferenceOptions'
import logo from '../assets/images/jood.svg'
import { savePreferences } from '../services/preferencesApi'

const steps = [
    {
        title: 'وش نظامك الغذائي؟',
        description: 'اختَر الأقرب لك، وتقدر تعدّله لاحقًا',
    },
    {
        title: 'وش المكونات اللي تتجنبها؟',
        description: 'حدّد اللي ينطبق عليك، أو تابع بدون اختيار',
    },
    {
        title: 'أي مطابخ تفضّل؟',
        description: 'تقدر تختار أكثر من مطبخ، أو تتركها مفتوحة',
    },
]

const dietOptions = [
    {
        value: 'none',
        label: 'بدون نظام محدد',
        description: 'آكل من مختلف الأطعمة، مع مراعاة حساسيتي وتفضيلاتي',
    },
    {
        value: 'vegetarian',
        label: 'نباتي',
        description: 'بدون لحوم أو دجاج أو أسماك، وقد يشمل البيض والحليب',
    },
    {
        value: 'vegan',
        label: 'نباتي بالكامل',
        description: 'بدون منتجات حيوانية، بما فيها البيض والحليب والعسل',
    },
]

const allergyOptions = [
    { value: 'milk', label: 'الحليب' },
    { value: 'eggs', label: 'البيض' },
    { value: 'peanuts', label: 'الفول السوداني' },
    { value: 'tree-nuts', label: 'المكسرات' },
    { value: 'wheat', label: 'القمح' },
    { value: 'soy', label: 'الصويا' },
    { value: 'fish', label: 'السمك' },
    { value: 'shellfish', label: 'المحار والقشريات' },
    { value: 'sesame', label: 'السمسم' },
]

const dislikedOptions = [
    { value: 'onion', label: 'البصل' },
    { value: 'garlic', label: 'الثوم' },
    { value: 'mushroom', label: 'الفطر' },
    { value: 'coriander', label: 'الكزبرة' },
]

const cuisineOptions = [
    { value: 'saudi', label: 'سعودي' },
    { value: 'italian', label: 'إيطالي' },
    { value: 'indian', label: 'هندي' },
    { value: 'american', label: 'أمريكي' },
    { value: 'levantine', label: 'شامي' },
    { value: 'asian', label: 'آسيوي' },
]

export default function PreferenceSetup() {
    const navigate = useNavigate()
    const titleRef = useRef(null)

    const [step, setStep] = useState(0)
    const [preferences, setPreferences] = useState({
        diet: 'none',
        allergies: [],
        dislikedIngredients: [],
        cuisines: [],
    })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    function updatePreference(key, value) {
        setPreferences((current) => ({
            ...current,
            [key]: value,
        }))
        setError('')
    }

    function changeStep(nextStep) {
        setStep(nextStep)
        setError('')

        requestAnimationFrame(() => {
            titleRef.current?.focus({ preventScroll: true })
            window.scrollTo({ top: 0, behavior: 'instant' })
        })
    }

async function handleSubmit(event) {
    event.preventDefault()

    if (step < steps.length - 1) {
        changeStep(step + 1)
        return
    }

    setError('')
    setSaving(true)

    try {
        await savePreferences(preferences)

        navigate('/app', {
            replace: true,
        })
    } catch (error) {
        setError(
            error.message ||
            'تعذّر حفظ تفضيلاتك. حاول مرة ثانية.'
        )
    } finally {
        setSaving(false)
    }
}

    return (
        <div className="min-h-dvh bg-white p-3 sm:p-5">
            <main className="jood-fixed-watermark relative isolate min-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-3xl bg-jood-background px-5 py-6 sm:min-h-[calc(100dvh-2.5rem)] sm:px-8">

                <div className="mx-auto max-w-xl">
                    <img
                        src={logo}
                        alt="جُود"
                        width={162}
                        height={140}
                        className="mx-auto h-auto w-20"
                    />

                    <div className="mt-8">
                        <div className="mb-3 flex items-center justify-between text-sm text-jood-green/75">
                            <span>خلّنا نعرف ذوقك</span>
                            <span>الخطوة {step + 1} من {steps.length}</span>
                        </div>

                        <div
                            role="progressbar"
                            aria-label="تقدّم إعداد التفضيلات"
                            aria-valuemin={0}
                            aria-valuemax={steps.length}
                            aria-valuenow={step + 1}
                            aria-valuetext={`الخطوة ${step + 1} من ${steps.length}`}
                            className="h-2 overflow-hidden rounded-full bg-jood-green/10"
                        >
                            <div
                                className="h-full rounded-full bg-jood-green transition-[width] duration-300 motion-reduce:transition-none"
                                style={{
                                    width: `${((step + 1) / steps.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>

                    <h1
                        ref={titleRef}
                        tabIndex={-1}
                        className="stylistic-text mt-8 text-2xl font-bold leading-relaxed text-jood-green outline-none sm:text-3xl"
                    >
                        {steps[step].title}
                    </h1>

                    <p className="mt-2 text-base leading-7 text-jood-green/75">
                        {steps[step].description}
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6">
                        <div className="rounded-3xl bg-white p-5 sm:p-6">
                            {step === 0 && (
                                <PreferenceOptions
                                    title="النظام الغذائي"
                                    name="diet"
                                    options={dietOptions}
                                    selected={preferences.diet}
                                    multiple={false}
                                    onChange={(value) => updatePreference('diet', value)}
                                />
                            )}

                            {step === 1 && (
                                <div className="space-y-8">
                                    <div>
                                        <PreferenceOptions
                                            title="الحساسية الغذائية"
                                            name="allergies"
                                            options={allergyOptions}
                                            selected={preferences.allergies}
                                            onChange={(value) =>
                                                updatePreference('allergies', value)
                                            }
                                            allowCustom
                                            customLabel="إضافة حساسية أخرى"
                                            customPlaceholder="اكتب المكوّن المسبب للحساسية"
                                        />

             
                                    </div>

                                    <PreferenceOptions
                                        title="مكونات ما تحبها"
                                        name="dislikedIngredients"
                                        options={dislikedOptions}
                                        selected={preferences.dislikedIngredients}
                                        onChange={(value) =>
                                            updatePreference('dislikedIngredients', value)
                                        }
                                        allowCustom
                                        customLabel="إضافة مكوّن آخر"
                                        customPlaceholder="مثل: الباذنجان"
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <PreferenceOptions
                                    title="المطابخ المفضلة"
                                    name="cuisines"
                                    options={cuisineOptions}
                                    selected={preferences.cuisines}
                                    onChange={(value) =>
                                        updatePreference('cuisines', value)
                                    }
                                    allowCustom
                                    customLabel="إضافة مطبخ آخر"
                                    customPlaceholder="مثل: مكسيكي"
                                />
                            )}
                        </div>

                        {error && (
                            <p role="alert" className="mt-4 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex gap-3 pb-4">
                            {step > 0 && (
                                <button
                                    type="button"
                                    onClick={() => changeStep(step - 1)}
                                    className="jood-button min-h-12 rounded-full border border-jood-green/20 bg-white px-6 py-3 font-medium text-jood-green hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                                >
                                    السابق
                                </button>
                            )}

                            <button
    type="submit"
    disabled={saving}
    className="jood-button flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-jood-green px-6 py-3 font-medium text-white transition-colors hover:bg-jood-lime hover:text-jood-green disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green motion-reduce:transition-none"
>
    {saving
        ? 'جاري الحفظ...'
        : step === steps.length - 1
            ? 'حفظ وابدأ'
            : 'التالي'}

    <ArrowLeft size={18} aria-hidden="true" />
</button>

                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}