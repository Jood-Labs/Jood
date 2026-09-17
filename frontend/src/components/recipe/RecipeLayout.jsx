import { Link } from 'react-router-dom'
import {
    UserRound,
    ChevronDown,
    SlidersHorizontal,
    ShoppingBasket,
    LogOut,
} from 'lucide-react'

import logo from '../../assets/images/jood3.svg'

export default function RecipeLayout({
    children,
    navigationState,
}) {
    return (
        <div
            dir="rtl"
            className="flex min-h-dvh flex-col bg-white text-jood-green"
        >
            <header>
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
                    <Link
                        to="/app"
                        state={navigationState}
                        aria-label="جُود الرئيسية"
                    >
                        <img
                            src={logo}
                            alt="جُود"
                            className="h-auto w-28 sm:w-32"
                        />
                    </Link>

                    <details className="group relative">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full bg-jood-background px-4 py-2 text-sm font-medium hover:bg-jood-lime [&::-webkit-details-marker]:hidden">
                            <UserRound size={20} aria-hidden="true" />
                            حسابي

                            <ChevronDown
                                size={16}
                                aria-hidden="true"
                                className="transition-transform group-open:rotate-180"
                            />
                        </summary>

                        <nav
                            aria-label="حسابي"
                            className="absolute left-0 top-full z-20 mt-2 w-48 rounded-2xl bg-white p-2 shadow-lg"
                        >
                            <Link
                                to="/account"
                                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-jood-background"
                            >
                                <UserRound size={18} aria-hidden="true" />
                                بيانات حسابي
                            </Link>
                            <Link
                                to="/preferences"
                                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-jood-background"
                            >
                                <SlidersHorizontal
                                    size={18}
                                    aria-hidden="true"
                                />
                                تفضيلاتي
                            </Link>

                            <Link
                                to="/shopping-list"
                                state={navigationState}
                                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-jood-background"
                            >
                                <ShoppingBasket
                                    size={18}
                                    aria-hidden="true"
                                />
                                قائمة التسوق
                            </Link>

                            <div className="my-1 border-t border-jood-green/10" />

                            {/* BACKEND: Replace the direct login link with a logout request/session clear, then navigate to /login. */}
                            <Link
                                to="/login"
                                replace
                                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                                <LogOut size={18} aria-hidden="true" />
                                تسجيل الخروج
                            </Link>
                        </nav>
                    </details>
                </div>
            </header>

            <main className="jood-fixed-watermark relative isolate mx-3 my-3 flex-1 overflow-hidden rounded-3xl bg-jood-background px-4 py-6 sm:mx-5 sm:px-8 lg:py-12">

                <div className="mx-auto max-w-5xl">
                    {children}
                </div>
            </main>

            <footer className="px-5 py-5 text-center text-sm text-jood-green/65">
                © {new Date().getFullYear()} جُود، جميع الحقوق محفوظة
            </footer>
        </div>
    )
}