"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"
import { withBasePath } from "@/utils/paths"
import Image from "next/image"
import Slider, { CustomArrowProps } from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

interface Testimonial {
  id: string
  name: string
  designation: string
  text: string
  avatar: string
}

function SamplePrevArrow(props: CustomArrowProps) {
  const { onClick } = props
  return <span className="lnr lnr-chevron-left slick-arrow" onClick={onClick}></span>
}

function SampleNextArrow(props: CustomArrowProps) {
  const { onClick } = props
  return <span className="lnr lnr-chevron-right slick-arrow" onClick={onClick}></span>
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch("/api/testimonials")
        const data = await response.json()
        setTestimonials(
          data.map((testimonial: any) => ({
            id: testimonial.id,
            name: testimonial.name,
            designation: testimonial.designation,
            text: testimonial.text,
            avatar: withBasePath(testimonial.avatar),
          }))
        )
      } catch (error: any) {
        setTestimonials([])
      }
    }
    fetchTestimonials()
  }, [])

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: false,
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }


  return (
    <div className="preload testimonials-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Testimonials" paths={[{ name: "Testimonials", link: "/testimonials" }]} />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="testimonial-slider">
                <Slider {...settings}>
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id}>
                      <div className="testimonial">
                        <div className="testimonial__about">
                          <div className="avatar v_middle">
                            <Image src={testimonial.avatar} alt="Testimonial Avatar" width={80} height={80} />
                          </div>
                          <div className="name-designation v_middle">
                            <h4 className="name">{testimonial.name}</h4>
                            <span className="desig">{testimonial.designation}</span>
                          </div>
                          <span className="lnr lnr-bubble quote-icon"></span>
                        </div>
                        <div className="testimonial__text">
                          <p>{testimonial.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

