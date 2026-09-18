import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'

export default function IngredientUpload({ file, onFileChange }) {
    const cameraRef = useRef(null)
    const galleryRef = useRef(null)

    const [error, setError] = useState('')

    const previewUrl = useMemo(
        () => (file ? URL.createObjectURL(file) : null),
        [file]
    )

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    function handleFileChange(event) {
        const selectedFile = event.target.files?.[0]

        event.target.value = ''

        if (!selectedFile) return

        const supportedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ]

        if (!supportedTypes.includes(selectedFile.type)) {
            setError('اختر صورة بصيغة JPG أو PNG أو WebP.')
            return
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('حجم الصورة أكبر من 10 ميجابايت. اختر صورة أصغر.')
            return
        }

        setError('')
        onFileChange(selectedFile)
    }

    function removeImage() {
        onFileChange(null)
        setError('')
    }

    return (
        <div className="mx-auto w-full min-w-0 max-w-xl">
            <input
                ref={cameraRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                aria-label="تصوير المكونات"
            />

            <input
                ref={galleryRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                aria-label="اختيار صورة المكونات"
            />

            {previewUrl && (
                <div className="relative mt-5 overflow-hidden rounded-2xl border border-jood-green/15 bg-jood-background">
                    <img
                        src={previewUrl}
                        alt="معاينة صورة المكونات المختارة"
                        onError={() => {
                            onFileChange(null)
                            setError('تعذّر عرض الصورة. جرّب صورة أخرى.')
                        }}
                        className="max-h-64 w-full object-contain"
                    />

                    <button
                        type="button"
                        onClick={removeImage}
                        aria-label="إزالة الصورة"
                        className="absolute left-3 top-3 flex size-11 cursor-pointer items-center justify-center rounded-full border border-jood-green/15 bg-white text-jood-green shadow-sm transition-colors hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jood-green motion-reduce:transition-none"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>
            )}

            {error && (
                <p
                    role="alert"
                    className="mt-3 text-sm leading-6 text-red-700"
                >
                    {error}
                </p>
            )}

            <div className="mt-6 grid gap-3">
                <button
                    type="button"
                    onClick={() => cameraRef.current?.click()}
                    className="jood-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-jood-green px-4 py-3 text-base font-medium text-white transition-colors hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none sm:min-h-14 sm:px-6"
                >
                    <Camera size={22} aria-hidden="true" />
                    {file ? 'أعد التصوير' : 'صوّر المكونات'}
                </button>

                <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    className="jood-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-jood-green/20 bg-white px-4 py-3 text-base font-medium text-jood-green transition-colors hover:bg-jood-lime/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none sm:min-h-14 sm:px-6"
                >
                    <ImagePlus size={22} aria-hidden="true" />
                    {file ? 'غيّر الصورة' : 'اختر صورة'}
                </button>
            </div>
        </div>
    )
} 