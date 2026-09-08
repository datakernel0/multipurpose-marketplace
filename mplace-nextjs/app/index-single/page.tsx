import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import HeroSectionSingle from "@/components/sections/HeroSectionSingle"
import FeaturesSection from "@/components/sections/FeaturesSection"
import FeaturedProductsSectionSingle from "@/components/sections/FeaturedProductsSectionSingle"
import ProductsSectionSingle from "@/components/sections/ProductsSectionSingle"
import CounterUpSection from "@/components/sections/CounterUpSection"
import PromotionAreaSection from "@/components/sections/PromotionAreaSection"
import OverviewAreaSection from "@/components/sections/OverviewAreaSection"
import PartnerAreaSection from "@/components/sections/PartnerAreaSection"
import WhyChooseSectionSingle from "@/components/sections/WhyChooseSectionSingle"
import ProposalAreaSection from "@/components/sections/ProposalAreaSection"
import TestimonialAreaSectionSingle from "@/components/sections/TestimonialAreaSectionSingle"
import SpecialFeatureAreaSection from "@/components/sections/SpecialFeatureAreaSection"
import CallToActionSection from "@/components/sections/CallToActionSection"

export const dynamic = 'force-dynamic'

export default function IndexSingle({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return (
    <div className="home2 single-vendor">
      <Preloader />
      <Header />
      <HeroSectionSingle />
      <FeaturesSection />
      <FeaturedProductsSectionSingle />
      <ProductsSectionSingle searchParams={searchParams} />
      <CounterUpSection />
      <PromotionAreaSection />
      <OverviewAreaSection />
      <PartnerAreaSection />
      <WhyChooseSectionSingle />
      <ProposalAreaSection />
      <TestimonialAreaSectionSingle />
      <SpecialFeatureAreaSection />
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

