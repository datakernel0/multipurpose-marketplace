import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import SingleProductBreadcrumb from "@/components/product/SingleProductBreadcrumb";
import SingleProductContentV3 from "@/components/product/SingleProductContentV3";
import OverviewSection from "@/components/product/OverviewSection";
import MoreProductsSection from "@/components/product/MoreProductsSection";
import CallToActionSection from "@/components/sections/CallToActionSection";

// Mock product data - replace with actual database query
function getProductData() {
  return {
    id: "1",
    title: "Beborn - Multipurpose WordPress Landing Page",
    slug: "beborn-multipurpose-wordpress-landing-page",
    description:
      "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scel erisque the mattis, leo quam aliquet congue justo ut scelerisque. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue justo ut scelerisque.",
    price: "$20 - $60",
    priceMin: 20,
    priceMax: 60,
    category: {
      name: "Corporate & Business",
      slug: "corporate-business",
    },
    seller: {
      id: "1",
      name: "BackTheme",
      avatar: "/images/author-avatar.jpg",
      signedUp: "08 April 2016",
    },
    images: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      url: "/images/itprv.jpg",
      thumbnail: `/images/thumb${(i % 5) + 1}.jpg`,
    })),
    metadata: {
      totalSales: 426,
      favorites: 240,
      comments: 35,
      reviews: 26,
      rating: 4.5,
    },
    productInfo: {
      released: "16 June 2015",
      updated: "28 July 2016",
      version: "1.2",
      layout: "Responsive",
      retinaReady: "No",
      filesIncluded: "Html, CSS, JavaScript",
      browser: "IE10, IE11, Firefox, Safari, Opera, Chrome5",
      bootstrap: "Bootstrap 4",
      tags: [
        "business",
        "template",
        "onepage",
        "creative",
        "responsive",
        "corporate",
        "Bootstrap3",
        "html5",
      ],
    },
  };
}

export default function SingleProductV3Page() {
  const product = getProductData();

  return (
    <div className="preload single-product-page">
      <Preloader />
      <Header />
      <SingleProductBreadcrumb product={product} />
      <SingleProductContentV3 product={product} />
      <OverviewSection />
      <MoreProductsSection sellerId={product.seller.id} />
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
