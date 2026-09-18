import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'

export default function IngredientUpload({ file, onFileChange }) {
    
const galleryRef = useRef(null)
const videoRef = useRef(null)
const streamRef = useRef(null)

const [error, setError] = useState('')
const [isCameraOpen, setIsCameraOpen] = useState(false)

    const previewUrl = useMemo(
        () => (file ? URL.createObjectURL(file) : null),
        [file]
    )

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    useEffect(() => {
    if (!isCameraOpen || !videoRef.current || !streamRef.current) {
        return
    }

    const video = videoRef.current

    video.srcObject = streamRef.current

    video.play().catch((err) => {
        console.error('Video play error:', err)
    })

    return () => {
        video.srcObject = null
    }
}, [isCameraOpen])

    function closeCamera() {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
    }

    if (videoRef.current) {
        videoRef.current.srcObject = null
    }

    setIsCameraOpen(false)
}

function capturePhoto() {
    const video = videoRef.current

    if (!video || !video.videoWidth || !video.videoHeight) {
        setError('الكاميرا لسه ما جهزت. حاول مرة ثانية.')
        return
    }

    const canvas = document.createElement('canvas')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    if (!context) {
        setError('تعذّر التقاط الصورة.')
        return
    }

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    )

    canvas.toBlob(
        (blob) => {
            if (!blob) {
                setError('تعذّر التقاط الصورة.')
                return
            }

            const capturedFile = new File(
                [blob],
                `jood-camera-${Date.now()}.jpg`,
                { type: 'image/jpeg' }
            )

            onFileChange(capturedFile)
            closeCamera()
            setError('')
        },
        'image/jpeg',
        0.9
    )
}

    async function openCamera() {
    setError('')
    if (file) {
    onFileChange(null)
}

    try {
        closeCamera()

        if (!navigator.mediaDevices?.getUserMedia) {
            setError('الكاميرا غير مدعومة على هذا الجهاز أو المتصفح.')
            return
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: 'environment' },
            },
            audio: false,
        })

        streamRef.current = stream
        setIsCameraOpen(true)
    } catch (err) {
        console.error('Camera error:', err)

        setError(
            'تعذّر فتح الكاميرا. تأكد من السماح للموقع باستخدام الكاميرا.'
        )
    }
}

    function handleFileChange(event) {
        const selectedFile = event.target.files?.[0]

        event.target.value = ''

        if (!selectedFile) return
        closeCamera()

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
                ref={galleryRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                aria-label="اختيار صورة المكونات"
            />

            {isCameraOpen && (
    <div className="mt-5">
        <div className="overflow-hidden rounded-2xl border border-jood-green/15 bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-80 w-full object-contain"
            />
        </div>

        <button
            type="button"
            onClick={capturePhoto}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-jood-green px-4 py-3 font-medium text-white transition-colors hover:bg-jood-lime hover:text-jood-green"
        >
            <Camera size={20} aria-hidden="true" />
            التقاط الصورة
        </button>
    </div>
)}

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
                    onClick={openCamera}
                    className="jood-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-jood-green px-4 py-3 text-base font-medium text-white transition-colors hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none sm:min-h-14 sm:px-6"
                >
                    <Camera size={22} aria-hidden="true" />
                    {file ? 'أعد التصوير' : 'صوّر المكونات'}
                </button>

                <button
                    type="button"
                    onClick={() => {
    closeCamera()
    galleryRef.current?.click()
}}
                    className="jood-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-jood-green/20 bg-white px-4 py-3 text-base font-medium text-jood-green transition-colors hover:bg-jood-lime/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none sm:min-h-14 sm:px-6"
                >
                    <ImagePlus size={22} aria-hidden="true" />
                    {file ? 'غيّر الصورة' : 'اختر صورة'}
                </button>
            </div>
        </div>
    )
} 