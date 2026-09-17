import {
    CookingPot,
    SlidersHorizontal,
    ShoppingBasket,
    Bookmark,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

const features = [
    {
        icon: CookingPot,
        title: 'طبختك من الموجود',
        description:
            'اكتشف وصفات تستفيد من المكونات اللي عندك، بدل ما تبدأ من الصفر',
    },
    {
        icon: SlidersHorizontal,
        title: 'على ذوقك ووقتك',
        description:
            'خصّص اقتراحاتك حسب تفضيلاتك الغذائية ووقت التحضير وعدد الحصص',
    },
    {
        icon: ShoppingBasket,
        title: 'الناقص في قائمة',
        description:
            'اجمع المكونات الناقصة من وصفاتك في قائمة تسوق ترجع لها بسهولة',
    },
    {
        icon: Bookmark,
        title: 'وصفاتك محفوظة',
        description:
            'احفظ الوصفات اللي عجبتك، وارجع لها وقت ما تحتار وش تطبخ',
    },
]

export default function Features() {
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

        const cards = section.querySelectorAll('.feature-item')

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle(
                        'is-visible',
                        entry.isIntersecting
                    )
                })
            },
            { threshold: 0.4 }
        )

        cards.forEach((card) => {
            card.classList.add('reveal-ready')
            observer.observe(card)
        })

        return () => {
            observer.disconnect()

            cards.forEach((card) => {
                card.classList.remove('reveal-ready', 'is-visible')
            })
        }
    }, [])
    return (
        <section
            ref={sectionRef}
            id="why-jood"
            aria-labelledby="features-title"
            className="scroll-mt-8 rounded-3xl bg-jood-green px-7 py-10 sm:px-8 lg:py-14"
        >
            <div className="mx-auto max-w-6xl">
                <div className="text-center">
                    <h2
                        id="features-title"
                        className="stylistic-text text-3xl font-bold leading-snug text-jood-background lg:text-4xl"
                    >
                        مميزات جُود
                    </h2>

                    <p className="mt-4 text-base leading-7 text-jood-background/80">
                        كل اللي يساعدك تختار طبختك وتجهّز لها
                    </p>
                </div>

                <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:gap-6">
                    {features.map(({ icon: Icon, title, description }, index) => (
                        <li
                            key={title}
                            style={{ '--reveal-delay': `${(index % 2) * 200}ms` }}
                            className="feature-item rounded-3xl border border-white/15 bg-white/5 p-6 lg:p-8"
                            
                        >
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-jood-lime text-jood-green">
                                <Icon
                                    size={24}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </span>

                            <h3 className="stylistic-text mt-5 text-xl font-bold leading-relaxed text-jood-background">
                                {title}
                            </h3>

                            <p className="mt-2 text-base leading-8 text-jood-background/80">
                                {description}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}