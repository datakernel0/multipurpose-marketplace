"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import CallToActionSection from "@/components/sections/CallToActionSection";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { withBasePath } from "@/utils/paths";
import Image from "next/image";
import { useBackgroundImages } from "@/hooks/useBackgroundImage";

export default function ContentBlockPage() {
  // Replace jQuery behavior with React hook
  useBackgroundImages(
    ".content_block1 .bg_image_holder, .content_block2 .bg_image_holder"
  );
  return (
    <div className="preload content-block-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Content Blocks"
        paths={[{ name: "Content Blocks", link: "/content-block" }]}
      />
      <section className="section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="feature_title">
                <h3>Content Block 1</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="content_block1">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6">
                <div className="content_area">
                  <h1 className="content_area--title">
                    About <span className="highlight">MartPlace</span>
                  </h1>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra
                    justo ut sceler isque the mattis, leo quam aliquet congue
                    this there placerat mi id nisi they interdum mollis.
                    Praesent pharetra justo ut sceleris que the mattis, leo quam
                    aliquet. Nunc placer atmi id nisi interdum mollis quam.
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt sanctus est Lorem ipsum
                    dolor sit amet consetetur sadipscing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="content_image bgimage">
            <div className="bg_image_holder">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBasePath("/images/ab1.jpg")} alt="" />
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="feature_title">
                <h3>Content Block 2</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="content_block2">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 offset-md-6 offset-lg-7">
                <div className="content_area2">
                  <h1 className="content_area2--title">
                    MartPlace <span className="highlight">Mission</span>
                  </h1>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra
                    justo ut sceler isque the mattis, leo quam aliquet congue
                    this there placerat mi id nisi they interdum mollis.
                    Praesent pharetra justo ut sceleris que the mattis, leo quam
                    aliquet. Nunc placer atmi id nisi interdum mollis quam.
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt sanctus est Lorem ipsum
                    dolor sit amet consetetur sadipscing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="content_image2 bgimage">
            <div className="bg_image_holder">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBasePath("/images/ab2.jpg")} alt="" />
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="feature_title">
                <h3>Content Block 3</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="content_block3">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 v_middle">
                <div className="area_image">
                  <Image
                    src={withBasePath("/images/1.png")}
                    alt="area images"
                    width={500}
                    height={400}
                  />
                </div>
              </div>

              <div className="col-lg-5 col-md-6 offset-lg-2 v_middle">
                <div className="area_content">
                  <h2>Create a Free Account</h2>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra
                    justo ut sceler isque the mattis, leo quam aliquet congue
                    this there placerat mi id nisi interdum mollis. Praesent
                    pharetra justo ut scelerisque the mattis, leo quam aliquet.
                    Nunc placer atmi id nisi interdum mollis quam.
                  </p>
                  <Link
                    href="#"
                    className="btn btn--default btn--white btn--round"
                  >
                    Register Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="feature_title">
                <h3>Content Block 4</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="content_block3 bgcolor">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 v_middle">
                <div className="area_content">
                  <h2>Upload Your Products</h2>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra
                    justo ut sceler isque the mattis, leo quam aliquet congue
                    this there placerat mi id nisi interdum mollis. Praesent
                    pharetra justo ut scelerisque the mattis, leo quam aliquet.
                    Nunc placer atmi id nisi interdum mollis quam.
                  </p>
                  <Link
                    href="#"
                    className="btn btn--white btn--default btn--round"
                  >
                    Register Now
                  </Link>
                </div>
              </div>

              <div className="col-lg-5 col-md-6 v_middle offset-lg-2">
                <div className="area_image">
                  <Image
                    src={withBasePath("/images/2.png")}
                    alt="area images"
                    width={500}
                    height={400}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="feature_title">
                <h3>Content Block 5</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="content_block5 section--padding">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 v_middle">
                <div className="content_block5_content">
                  <h1>
                    Find Out More About{" "}
                    <span className="highlighted">BackTheme</span>
                  </h1>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra
                    justo ut sceler isque the mattis, leo quam aliquet congue
                    this there placerat mi id nisi they interdum mollis.
                    Praesent phare tra justo ut sceleris que the mattis, leo
                    quam aliquet. Nunc placer atmi id nisi interdum mollis quam.
                  </p>

                  <Link href="/about" className="btn btn--default btn--round">
                    About Us
                  </Link>
                </div>
              </div>

              <div className="col-lg-6 col-md-6 offset-lg-1 v_middle">
                <Image
                  src={withBasePath("/images/knous.jpg")}
                  alt="The Image is not available or broken"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
