import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import HeroSection from "@/components/sections/HeroSection"
import FeaturesSection from "@/components/sections/FeaturesSection"
import FeaturedProductsSection from "@/components/sections/FeaturedProductsSection"
import ProductsSection from "@/components/sections/ProductsSection"
import WhyChooseSection from "@/components/sections/WhyChooseSection"
import ProposalAreaSection from "@/components/sections/ProposalAreaSection"
import SpecialFeatureAreaSection from "@/components/sections/SpecialFeatureAreaSection"
import CallToActionSection from "@/components/sections/CallToActionSection"

export default function Home({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  return (
    <div className="home1 mutlti-vendor">
      <Preloader />
      <Header />
      <HeroSection />
      <FeaturesSection />
      <FeaturedProductsSection />
      <ProductsSection searchParams={searchParams} />
      <WhyChooseSection />
      <ProposalAreaSection />
      <SpecialFeatureAreaSection />
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
