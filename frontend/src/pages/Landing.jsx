import LandingHeader from '../components/landing/LandingHeader'
import LandingHero from '../components/landing/LandingHero'
import HowItWorks from '../components/landing/HowItWorks'
import Features from '../components/landing/Features'
import TryJood from '../components/landing/TryJood'
import LandingFooter from '../components/landing/LandingFooter'

export default function Landing() {
    return (
        <div className="min-h-dvh bg-white">
            <LandingHeader />

            <main className="px-3 pb-3 sm:px-5 sm:pb-5">
                <LandingHero />
                <HowItWorks />
                <Features />
                <TryJood />
            </main>

            <LandingFooter />
        </div>
    )
}