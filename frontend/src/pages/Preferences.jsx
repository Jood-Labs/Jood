import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'
import PreferenceOptions from '../components/preferences/PreferenceOptions'

const dietOptions = [
  {
    value: 'none',
    label: 'بدون نظام محدد',
    description: 'آكل من مختلف الأطعمة، مع مراعاة حساسيتي وتفضيلاتي.',
  },
  {
    value: 'vegetarian',
    label: 'نباتي',
    description: 'بدون لحوم أو دجاج أو أسماك، وقد يشمل البيض والحليب.',
  },
  {
    value: 'vegan',
    label: 'نباتي بالكامل',
    description: 'بدون منتجات حيوانية، بما فيها البيض والحليب والعسل.',
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

function readPreferences() {
  // BACKEND: Load the authenticated user's saved preferences from the API instead of sessionStorage.
  const defaults = {
    diet: 'none',
    allergies: [],
    dislikedIngredients: [],
    cuisines: [],
  }

  try {
    const saved = JSON.parse(
      sessionStorage.getItem('jood-preferences') || 'null'
    )

    if (!saved || typeof saved !== 'object') return defaults

    function readList(value) {
      return Array.isArray(value)
        ? [...new Set(value.filter(
            (item) => typeof item === 'string' && item.trim()
          ))]
        : []
    }

    return {
      diet: dietOptions.some((option) => option.value === saved.diet)
        ? saved.diet
        : defaults.diet,
      allergies: readList(saved.allergies),
      dislikedIngredients: readList(saved.dislikedIngredients),
      cuisines: readList(saved.cuisines),
    }
  } catch {
    return defaults
  }
}

function SelectedPreferences({
  name,
  title,
  emptyText,
  placeholder,
  options,
  selected,
  onChange,
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')

  function getLabel(value) {
    return options.find((option) => option.value === value)?.label ?? value
  }

  function normalize(value) {
    return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ar')
  }

  function addOption(value) {
    if (selected.includes(value)) {
      setError('هذا الخيار مضاف بالفعل.')
      return
    }

    onChange([...selected, value])
    setDraft('')
    setError('')
    setAnnouncement(`تمت إضافة ${getLabel(value)}`)
  }

  function addCustomOption() {
    const value = draft.trim().replace(/\s+/g, ' ')

    if (!value) {
      setError('اكتب اسم الخيار أولًا.')
      return
    }

    const existingOption = options.find(
      (option) => normalize(option.label) === normalize(value)
    )

    const duplicate = selected.some(
      (item) => normalize(getLabel(item)) === normalize(value)
    )

    if (duplicate) {
      setError('هذا الخيار مضاف بالفعل.')
      return
    }

    addOption(existingOption?.value ?? value)
  }

  function removeOption(value) {
    onChange(selected.filter((item) => item !== value))
    setAnnouncement(`تمت إزالة ${getLabel(value)}`)
  }

  const availableOptions = options.filter(
    (option) => !selected.includes(option.value)
  )

  return (
    <section
      aria-labelledby={`${name}-title`}
      className="rounded-3xl bg-white p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id={`${name}-title`}
          className="stylistic-text text-xl font-bold text-jood-green"
        >
          {title}
        </h2>

        <button
          type="button"
          aria-expanded={isAdding}
          aria-controls={`${name}-add`}
          onClick={() => {
            setIsAdding((current) => !current)
            setError('')
          }}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-jood-background px-3 text-sm font-medium text-jood-green transition-colors hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green motion-reduce:transition-none"
        >
          {isAdding ? (
            <X size={16} aria-hidden="true" />
          ) : (
            <Plus size={16} aria-hidden="true" />
          )}
          {isAdding ? 'إغلاق' : 'إضافة'}
        </button>
      </div>

      {selected.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {selected.map((value) => (
            <li
              key={value}
              className="flex max-w-full items-center gap-1 rounded-full bg-jood-lime ps-4 pe-1 text-jood-green"
            >
              <span className="min-w-0 break-words text-sm font-medium">
                {getLabel(value)}
              </span>

              <button
                type="button"
                onClick={() => removeOption(value)}
                aria-label={`إزالة ${getLabel(value)}`}
                className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-jood-green/10 focus-visible:outline-2 focus-visible:outline-jood-green"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-7 text-jood-green/65">
          {emptyText}
        </p>
      )}

      <div id={`${name}-add`} hidden={!isAdding}>
        <div className="mt-5 border-t border-jood-green/10 pt-5">
          {availableOptions.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {availableOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => addOption(option.value)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-jood-green/20 px-3 text-sm text-jood-green hover:bg-jood-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                >
                  <Plus size={15} aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <label
            htmlFor={`${name}-custom`}
            className="mb-2 block text-sm font-medium text-jood-green"
          >
            إضافة خيار آخر
          </label>

          <div className="flex gap-2">
            <input
              id={`${name}-custom`}
              type="text"
              maxLength={60}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                setError('')
              }}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault()
                  addCustomOption()
                }
              }}
              placeholder={placeholder}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${name}-error` : undefined}
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-jood-green/20 px-4 py-3 text-base text-jood-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green aria-invalid:border-red-600"
            />

            <button
              type="button"
              onClick={addCustomOption}
              className="min-h-12 rounded-xl bg-jood-green px-4 text-sm font-medium text-white hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
            >
              إضافة
            </button>
          </div>

          {error && (
            <p
              id={`${name}-error`}
              role="alert"
              className="mt-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </div>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  )
}

export default function Preferences() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo === '/account' ? '/account' : '/app'
  const [preferences, setPreferences] = useState(readPreferences)
  const [isEditingDiet, setIsEditingDiet] = useState(false)
  const [error, setError] = useState('')

  const currentDiet = dietOptions.find(
    (option) => option.value === preferences.diet
  )

  function updatePreference(key, value) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }))
    setError('')
  }

  function handleSave(event) {
    event.preventDefault()

    try {
      // BACKEND: Persist the authenticated user's preference changes through the preferences endpoint.
      sessionStorage.setItem(
        'jood-preferences',
        JSON.stringify(preferences)
      )
      navigate(returnTo)
    } catch {
      setError('تعذّر حفظ التغييرات. حاول مرة ثانية.')
    }
  }

  return (
    <div className="min-h-dvh bg-white p-3 sm:p-5">
      <main className="min-h-[calc(100dvh-1.5rem)] rounded-3xl bg-jood-background px-5 py-6 sm:min-h-[calc(100dvh-2.5rem)] sm:px-8">
        <div className="mx-auto max-w-2xl">
          <header className="flex items-center justify-between gap-4">
            <h1 className="stylistic-text text-3xl font-bold text-jood-green">
              تفضيلاتي
            </h1>

            <Link
              to={returnTo}
              aria-label={returnTo === '/account' ? 'العودة لحسابي دون حفظ' : 'العودة للرئيسية دون حفظ'}
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-jood-green/15 bg-white text-jood-green hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
            >
              <ArrowLeft size={22} aria-hidden="true" />
            </Link>
          </header>

          <p className="mt-3 text-base leading-8 text-jood-green/75">
            ذوقك يتغيّر، وتفضيلاتك تتغيّر معك.
          </p>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <section className="rounded-3xl bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="stylistic-text text-xl font-bold text-jood-green">
                  النظام الغذائي
                </h2>

                <button
                  type="button"
                  aria-expanded={isEditingDiet}
                  aria-controls="diet-editor"
                  onClick={() => setIsEditingDiet((current) => !current)}
                  className="min-h-11 rounded-full bg-jood-background px-4 text-sm font-medium text-jood-green hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green"
                >
                  {isEditingDiet ? 'تم' : 'تعديل'}
                </button>
              </div>

              <div id="diet-editor" hidden={!isEditingDiet} className="mt-4">
                <PreferenceOptions
                  title="اختر نظامك"
                  name="diet"
                  options={dietOptions}
                  selected={preferences.diet}
                  multiple={false}
                  onChange={(value) => updatePreference('diet', value)}
                />
              </div>

              {!isEditingDiet && (
                <div className="mt-4">
                  <p className="font-medium text-jood-green">
                    {currentDiet.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-jood-green/75">
                    {currentDiet.description}
                  </p>
                </div>
              )}
            </section>

            <SelectedPreferences
              name="allergies"
              title="الحساسية الغذائية"
              emptyText="لم تضف أي حساسية غذائية."
              placeholder="اكتب المكوّن المسبب للحساسية"
              options={allergyOptions}
              selected={preferences.allergies}
              onChange={(value) => updatePreference('allergies', value)}
            />

            <SelectedPreferences
              name="dislikedIngredients"
              title="مكونات ما أحبها"
              emptyText="لم تضف مكونات تتجنبها."
              placeholder="مثل: الباذنجان"
              options={dislikedOptions}
              selected={preferences.dislikedIngredients}
              onChange={(value) =>
                updatePreference('dislikedIngredients', value)
              }
            />

            <SelectedPreferences
              name="cuisines"
              title="مطابخي المفضلة"
              emptyText="لم تحدد مطابخ مفضلة."
              placeholder="مثل: مكسيكي"
              options={cuisineOptions}
              selected={preferences.cuisines}
              onChange={(value) => updatePreference('cuisines', value)}
            />

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="pt-3 pb-4">
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-jood-green px-6 py-3 text-base font-medium text-white transition-colors hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none"
              >
                حفظ التغييرات
              </button>

              <Link
                to={returnTo}
                className="mt-2 flex min-h-11 items-center justify-center rounded-lg text-sm text-jood-green hover:text-[#4D7C0F] focus-visible:outline-2 focus-visible:outline-jood-green"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}