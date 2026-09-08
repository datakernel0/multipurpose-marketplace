import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import MoreProductsSection from "@/components/product/MoreProductsSection";
import SingleProductBreadcrumb from "@/components/product/SingleProductBreadcrumb";
import SingleProductContent from "@/components/product/SingleProductContent";
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
      username: "backtheme",
      avatar: "/images/author-avatar.jpg",
      signedUp: "08 April 2016",
      facebookUrl: "#",
      twitterUrl: "#",
      dribbbleUrl: "#",
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
    pricingOptions: [
      { id: "opt1", label: "Single Site License", price: 20 },
      { id: "opt2", label: "2 Sites License", price: 40 },
      { id: "opt3", label: "Multi Site License", price: 60 },
    ],
  };
}

export default function SingleProductPage() {
  const product = getProductData();

  return (
    <div className="preload single-product-page">
      <Preloader />
      <Header />
      <SingleProductBreadcrumb product={product} />
      <SingleProductContent product={product} />
      <MoreProductsSection sellerId={product.seller.id} />
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
