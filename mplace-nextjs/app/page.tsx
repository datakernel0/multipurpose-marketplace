import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import HeroSection from "@/components/sections/HeroSection"
import FeaturesSection from "@/components/sections/FeaturesSection"
import FeaturedProductsSection from "@/components/sections/FeaturedProductsSection"
import ProductsSection from "@/components/sections/ProductsSection"
import FollowersFeedSection from "@/components/sections/FollowersFeedSection"
import CounterUpSection from "@/components/sections/CounterUpSection"
import WhyChooseSection from "@/components/sections/WhyChooseSection"
import ProposalAreaSection from "@/components/sections/ProposalAreaSection"
import TestimonialAreaSection from "@/components/sections/TestimonialAreaSection"
import LatestNewsSection from "@/components/sections/LatestNewsSection"
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
      <FollowersFeedSection />
      <CounterUpSection />
      <WhyChooseSection />
      <ProposalAreaSection />
      <TestimonialAreaSection />
      <LatestNewsSection />
      <SpecialFeatureAreaSection />
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
