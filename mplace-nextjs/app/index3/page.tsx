import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import HeroSection3 from "@/components/sections/HeroSection3"
import FeaturedProductsSectionSingle from "@/components/sections/FeaturedProductsSectionSingle"
import ProductsSection3 from "@/components/sections/ProductsSection3"
import CounterUpSection from "@/components/sections/CounterUpSection"
import WhyChooseSectionSingle from "@/components/sections/WhyChooseSectionSingle"
import SpecialFeatureAreaSection2 from "@/components/sections/SpecialFeatureAreaSection2"
import CallToActionSection from "@/components/sections/CallToActionSection"

export const dynamic = 'force-dynamic'

export default function Index3({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return (
    <div className="home3">
      <Preloader />
      <Header />
      <HeroSection3 />
      <FeaturedProductsSectionSingle />
      <ProductsSection3 searchParams={searchParams} />
      <CounterUpSection />
      <WhyChooseSectionSingle />
      <SpecialFeatureAreaSection2 />
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

