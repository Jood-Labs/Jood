import logoMark from '../../assets/images/jood.svg'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function TryJood() {
    const sectionRef = useRef(null)

    useEffect(() => {
        const section = sectionRef.current
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches

        if (
            !section ||
            prefersReducedMotion ||
            !('IntersectionObserver' in window)
        ) {
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                section.classList.toggle('is-visible', entry.isIntersecting)
            },
            { threshold: 0.10 }
        )

        section.classList.add('reveal-ready')
        observer.observe(section)

        return () => {
            observer.disconnect()
            section.classList.remove('reveal-ready', 'is-visible')
        }
    }, [])
    return (
        <section
            ref={sectionRef}
            aria-labelledby="try-jood-title"
            className="try-jood mt-8 rounded-3xl bg-jood-lime px-5 py-12 text-center sm:px-8 lg:mt-12 lg:py-20"
        >


            <div className="try-jood-content mx-auto flex max-w-2xl flex-col items-center">
                <img
                    src={logoMark}
                    alt=""
                    aria-hidden="true"
                    className="mb-6 h-16 w-auto lg:h-20"
                />
                <h2
                    id="try-jood-title"
                    className="stylistic-text text-3xl font-bold leading-relaxed text-jood-green lg:text-5xl"
                >
                    يلا جرّب جُـــــود!
                </h2>

                <p className="mt-4 text-base leading-8 text-jood-green lg:text-lg">
                    افتح ثلاجتك، وخلّنا نساعدك تختار طبختك الجاية
                </p>

                <Link
                    to="/login"
                    className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-jood-green px-8 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-jood-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none sm:w-auto"
                >
                    خلّنا نطبخ
                </Link>
            </div>
        </section>
    )
}