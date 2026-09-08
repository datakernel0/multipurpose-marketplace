import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";
import "react-image-crop/dist/ReactCrop.css";
import "../styles/globals.css";
import { Providers } from "./providers";
import { withBasePath } from "@/utils/paths";
import Preloader from "@/components/Preloader";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";

const quicksand = Quicksand({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "MarketNest | Discover. Sell. Grow.",
  description: "MarketNest is a digital-products marketplace for templates, code, graphics, and creator resources.",
  keywords: "digital products, templates, source code, UI kits, marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" sizes="16x16" href={withBasePath("/images/favicon.png")} />
        <link rel="stylesheet" href={withBasePath("/css/animate.css")} />
        <link rel="stylesheet" href={withBasePath("/css/font-awesome.min.css")} />
        <link rel="stylesheet" href={withBasePath("/css/fontello.css")} />
        <link rel="stylesheet" href={withBasePath("/css/lnr-icon.css")} />
        <link rel="stylesheet" href={withBasePath("/css/owl.carousel.css")} />
        <link rel="stylesheet" href={withBasePath("/css/slick.css")} />
        <link rel="stylesheet" href={withBasePath("/css/trumbowyg.min.css")} />
        <link rel="stylesheet" href={withBasePath("/css/style.css")} />
      </head>
      <body className={`${quicksand.variable} preload`}>
        <ErrorBoundaryWrapper>
          <Preloader />
          <Providers>{children}</Providers>
          <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
            async
          />
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
