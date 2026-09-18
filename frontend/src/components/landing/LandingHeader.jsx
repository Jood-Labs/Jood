import logo from '../../assets/images/jood3.svg'
import { Link } from 'react-router-dom'

export default function LandingHeader() {
    return (
        <header className="bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
                <a
                    href="/"
                    aria-label="جُود، الصفحة الرئيسية"
                    className="block w-fit stylistic-textshrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green"
                >
                    <img
                        src={logo}
                        alt="جُود — الجود من الموجود"
                        width={362}
                        height={147}
                        className="h-auto w-32 lg:w-40"
                    />
                </a>

                <nav
                    aria-label="التنقل الرئيسي"
                    className="hidden items-center gap-2 lg:flex"
                >
                    <a
                        href="#how-it-works"
                        className="jood-button rounded-full stylistic-text px-5 py-3 text-base font-medium text-jood-green transition-colors duration-200 hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none"
                    >
                        كيف تبدأ؟
                    </a>

                    <a
                        href="#why-jood"
                        className="jood-button rounded-full stylistic-text px-5 py-3 text-base font-medium text-jood-green transition-colors duration-200 hover:bg-jood-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none"
                    >
                        مميزات جُود
                    </a>
                </nav>

                <Link
                    to="/login"
                    className="jood-button inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-jood-green px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-jood-lime hover:text-jood-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jood-green motion-reduce:transition-none lg:justify-self-end"
                >
                    تسجيل الدخول
                </Link>
            </div>
        </header>
    )
}