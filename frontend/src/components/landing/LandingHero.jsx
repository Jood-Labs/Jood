import logoMark from '../../assets/images/jood.svg'
import { Link } from 'react-router-dom'

export default function LandingHero() {
    return (
        <section
            aria-labelledby="hero-title"
            className="relative isolate flex min-h-[93svh] items-center justify-center overflow-hidden rounded-3xl bg-jood-background px-5 py-20 sm:px-8 lg:min-h-[80svh] lg:py-28"
        >
            <img
                src={logoMark}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 w-[130%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.06] lg:w-[65%]"
            />

            <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                <p className="mb-4 text-base font-medium text-jood-secondary">
                    محتار وش تطبخ اليوم؟
                </p>

                <h1
                    id="hero-title"
                    className="stylistic-text text-4xl font-bold leading-snug text-jood-green sm:text-5xl lg:text-7xl"
                >
                    الجود من الموجود
                </h1>

                <p className="mt-6 max-w-lg text-base leading-8 text-jood-green/80 lg:text-lg">
                    صوّر المكونات اللي عندك، وخلّ جُود يقترح لك وصفات
                    تناسب ذوقك ووقتك، ويساعدك تستفيد من الموجود
                </p>

                <Link
                    to="/login"
                    className="mt-10 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-jood-green px-8 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none sm:w-auto"
                >
                    جرّب جُود
                </Link>
            </div>
        </section>
    )
}