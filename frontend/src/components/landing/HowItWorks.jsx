import { useEffect, useRef } from 'react'

const steps = [
  {
    number: '١',
    title: 'ورّنا الموجود',
    description:
      'صوّر مكوناتك أو أدخلها يدويًا، ثم راجعها وتأكد منها',
  },
  {
    number: '٢',
    title: 'حدّد اللي يناسبك',
    description:
      'اختَر تفضيلاتك، ووقت التحضير وعدد الحصص',
  },
  {
    number: '٣',
    title: 'اختَر طبختك',
    description:
      'استكشف الوصفات المقترحة، وأضف اللي ناقصك لسلّة التسوق',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )

    if (
      !section ||
      motionPreference.matches ||
      !('IntersectionObserver' in window)
    ) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add('timeline-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    section.classList.add('timeline-ready')
    observer.observe(section)

    return () => {
      observer.disconnect()
      section.classList.remove('timeline-ready', 'timeline-visible')
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="jood-timeline scroll-mt-8 px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="lg:text-center">
          <h2
            id="how-it-works-title"
            className="stylistic-text text-3xl font-bold leading-snug text-jood-green lg:text-4xl"
          >
            كيف تبدأ؟
          </h2>

          <p className="mt-4 text-base leading-8 text-jood-green/80">
            من مكوناتك إلى طبختك، بثلاث خطوات
          </p>
        </div>

        <ol className="mt-10 lg:mt-16 lg:grid lg:grid-cols-3">
          {steps.map(({ number, title, description }, index) => (
            <li
              key={number}
              className="timeline-step relative flex gap-5 pb-10 last:pb-0 lg:flex-col lg:items-center lg:gap-0 lg:px-6 lg:pb-0 lg:text-center"
              style={{ '--step-delay': `${index * 180}ms` }}
            >
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 right-6 top-12 w-px translate-x-1/2 bg-jood-green/20 lg:bottom-auto lg:right-1/2 lg:top-6 lg:h-px lg:w-full lg:translate-x-0"
                />
              )}

              <span
                aria-hidden="true"
                className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-jood-lime text-xl font-bold text-jood-green"
              >
                {number}
              </span>

              <div className="min-w-0 pt-1 lg:pt-7">
                <h3 className="stylistic-text text-xl font-bold leading-relaxed text-jood-green">
                  {title}
                </h3>

                <p className="mt-2 max-w-md text-base leading-8 text-jood-green/80 lg:mx-auto">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}