"use client"

import Slider, { CustomArrowProps } from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"

function SamplePrevArrow(props: CustomArrowProps) {
  const { onClick } = props
  return (
    <span className="lnr lnr-chevron-left slick-arrow" onClick={onClick}></span>
  )
}

function SampleNextArrow(props: CustomArrowProps) {
  const { onClick } = props
  return (
    <span className="lnr lnr-chevron-right slick-arrow" onClick={onClick}></span>
  )
}

export default function TestimonialAreaSectionSingle() {
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

  const testimonials = [
    {
      id: 1,
      avatar: withBasePath("/images/test1.jpg"),
      name: "Tubeda Pagla",
      designation: "Product Designer",
      text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is the laoreet elit metus. Nunc placerat mi is id nisi interdum is mollis. Praesent the pharetra, justo ut scelerisque.",
    },
    {
      id: 2,
      avatar: withBasePath("/images/test2.jpg"),
      name: "Tarashi Hamada",
      designation: "Quality Ninja",
      text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is the laoreet elit metus. Nunc placerat mi is id nisi interdum is mollis. Praesent the pharetra, justo ut scelerisque.",
    },
    {
      id: 3,
      avatar: withBasePath("/images/test1.jpg"),
      name: "Tubeda Pagla",
      designation: "Product Designer",
      text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is the laoreet elit metus. Nunc placerat mi is id nisi interdum is mollis. Praesent the pharetra, justo ut scelerisque.",
    },
    {
      id: 4,
      avatar: withBasePath("/images/test2.jpg"),
      name: "Tarashi Hamada",
      designation: "Quality Ninja",
      text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is the laoreet elit metus. Nunc placerat mi is id nisi interdum is mollis. Praesent the pharetra, justo ut scelerisque.",
    },
  ]

  const bgImage = withBasePath("/images/testibg.jpg")

  return (
    <section className="testimonial-area testimonial--2 section--padding bgimage">
      <div
        className="bg_image_holder"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50% 50%",
          opacity: 1,
        }}
      >
        <img src={bgImage} alt="" />
      </div>
      <div className="container content_above">
        <div className="row">
          <div className="col-md-12">
            <div className="section-title">
              <h1>
                Our Clients <span className="highlighted">Feedback</span>
              </h1>
              <p>
                Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid est laborum
                dolo rumes fugats untras.
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="testimonial-slider">
              <Slider {...settings}>
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id}>
                    <div className="testimonial">
                      <div className="testimonial__about">
                        <div className="avatar v_middle">
                          <img src={testimonial.avatar} alt="Testimonial Avatar" />
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

            <div className="all-testimonial">
              <Link href="/testimonials" className="btn btn--lg btn--round">
                View All Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

