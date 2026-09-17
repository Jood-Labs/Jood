import { useRef, useState } from 'react'
import { Check, Plus } from 'lucide-react'

export default function PreferenceOptions({
    title,
    options,
    selected,
    onChange,
    multiple = true,
    name,
    allowCustom = false,
    customPlaceholder = 'اكتب خيارًا آخر',
    customLabel = 'إضافة خيار',
}) {
    const customInputRef = useRef(null)

    const [draft, setDraft] = useState('')
    const [error, setError] = useState('')
    const [announcement, setAnnouncement] = useState('')

    const customValues = multiple
        ? selected.filter(
              (value) => !options.some((option) => option.value === value)
          )
        : []

    const displayedOptions = [
        ...options,
        ...customValues.map((value) => ({
            value,
            label: value,
        })),
    ]

    function normalize(value) {
        return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ar')
    }

    function handleChange(value) {
        setError('')

        if (!multiple) {
            onChange(value)
            return
        }

        onChange(
            selected.includes(value)
                ? selected.filter((item) => item !== value)
                : [...selected, value]
        )
    }

    function addCustomOption() {
        const value = draft.trim().replace(/\s+/g, ' ')

        if (!value) {
            setError('اكتب اسم الخيار أولًا.')
            customInputRef.current?.focus()
            return
        }

        const existingOption = displayedOptions.find(
            (option) => normalize(option.label) === normalize(value)
        )

        const optionValue = existingOption?.value ?? value

        if (selected.includes(optionValue)) {
            setError('هذا الخيار مضاف بالفعل.')
            customInputRef.current?.focus()
            return
        }

        onChange([...selected, optionValue])
        setDraft('')
        setError('')
        setAnnouncement(`تمت إضافة ${existingOption?.label ?? value}`)
        customInputRef.current?.focus()
    }

    return (
        <fieldset
            dir="rtl"
            className="m-0 w-full min-w-0 max-w-full border-0 p-0"
        >
            <legend className="mb-4 max-w-full break-words p-0 text-lg font-bold text-jood-green">
                {title}
            </legend>

            <div
                className={`grid min-w-0 grid-cols-1 gap-3 ${
                    multiple ? 'sm:grid-cols-2' : ''
                }`}
            >
                {displayedOptions.map((option) => {
                    const isSelected = multiple
                        ? selected.includes(option.value)
                        : selected === option.value

                    return (
                        <label
                            key={option.value}
                            className="relative block w-full min-w-0 cursor-pointer"
                        >
                            <input
                                type={multiple ? 'checkbox' : 'radio'}
                                name={name}
                                value={option.value}
                                checked={isSelected}
                                onChange={() => handleChange(option.value)}
                                className="peer sr-only"
                            />

                            <span
                                className={`flex h-full min-h-12 w-full min-w-0 items-start justify-between gap-3 rounded-2xl border px-3 py-3 text-base transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-jood-green motion-reduce:transition-none sm:min-h-14 sm:px-4 sm:py-4 ${
                                    isSelected
                                        ? 'border-jood-green bg-jood-lime text-jood-green'
                                        : 'border-jood-green/15 bg-white text-jood-green hover:bg-jood-background'
                                }`}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block break-words font-medium">
                                        {option.label}
                                    </span>

                                    {option.description && (
                                        <span className="mt-1 block break-words text-sm leading-6 text-jood-green/75">
                                            {option.description}
                                        </span>
                                    )}
                                </span>

                                <span
                                    aria-hidden="true"
                                    className={`mt-1 flex size-5 shrink-0 items-center justify-center border ${
                                        multiple
                                            ? 'rounded-md'
                                            : 'rounded-full'
                                    } ${
                                        isSelected
                                            ? 'border-jood-green bg-jood-green text-white'
                                            : 'border-jood-green/30'
                                    }`}
                                >
                                    {isSelected && (
                                        <Check size={14} aria-hidden="true" />
                                    )}
                                </span>
                            </span>
                        </label>
                    )
                })}
            </div>

            {allowCustom && multiple && (
                <div className="mt-5 min-w-0">
                    <label
                        htmlFor={`${name}-custom`}
                        className="mb-2 block text-sm font-medium text-jood-green"
                    >
                        {customLabel}
                    </label>

                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <input
                            ref={customInputRef}
                            id={`${name}-custom`}
                            type="text"
                            value={draft}
                            maxLength={60}
                            onChange={(event) => {
                                setDraft(event.target.value)
                                setError('')
                                setAnnouncement('')
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
                            placeholder={customPlaceholder}
                            aria-invalid={Boolean(error)}
                            aria-describedby={
                                error ? `${name}-custom-error` : undefined
                            }
                            className="min-h-12 w-full min-w-0 rounded-xl border border-jood-green/20 bg-white px-3 py-3 text-base text-jood-green placeholder:text-jood-green/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green aria-invalid:border-red-600 sm:px-4"
                        />

                        <button
                            type="button"
                            onClick={addCustomOption}
                            aria-label={customLabel}
                            className="flex min-h-12 min-w-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-jood-green px-3 text-sm font-medium text-white transition-colors hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green motion-reduce:transition-none sm:px-4"
                        >
                            <Plus size={18} aria-hidden="true" />
                            <span className="hidden sm:inline">
                                إضافة
                            </span>
                        </button>
                    </div>

                    {error && (
                        <p
                            id={`${name}-custom-error`}
                            role="alert"
                            className="mt-2 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    <p role="status" aria-atomic="true" className="sr-only">
                        {announcement}
                    </p>
                </div>
            )}
        </fieldset>
    )
}