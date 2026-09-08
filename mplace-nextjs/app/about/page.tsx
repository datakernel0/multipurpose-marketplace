"use client"

import { useState, useRef, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import CallToActionSection from "@/components/sections/CallToActionSection"
import { useCounter } from "@/hooks/useCounter"
import { useBackgroundImages } from "@/hooks/useBackgroundImage"
import Image from "next/image"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"

export default function AboutPage() {
  const [showModal, setShowModal] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const counterRef = useRef<HTMLElement>(null)

  // Replace jQuery behavior with React hook for background images
  useBackgroundImages(".about_hero_area .bg_image_holder, .content_block1 .bg_image_holder, .content_block2 .bg_image_holder")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldAnimate) {
            setShouldAnimate(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current)
      }
    }
  }, [shouldAnimate])

  const itemsCount = useCounter({ endValue: 38436, time: 2000, delay: 10, enabled: shouldAnimate })
  const totalSales = useCounter({ endValue: 38436, time: 2000, delay: 10, enabled: shouldAnimate })
  const happyCustomers = useCounter({ endValue: 38436, time: 2000, delay: 10, enabled: shouldAnimate })
  const members = useCounter({ endValue: 38436, time: 2000, delay: 10, enabled: shouldAnimate })

  return (
    <div className="preload about-page">
      <Preloader />
      <Header />
      <section className="about_hero bgimage">
        <div className="bg_image_holder">
          <img src={withBasePath("/images/about_hero.jpg")} alt="" />
        </div>
        <div className="container content_above">
          <div className="row">
            <div className="col-md-12">
              <div className="about_hero_contents">
                <h1>Welcome to MartPlace!</h1>
                <p>
                  We Help Marketers
                  <span>Build Products</span>
                </p>
                <div className="about_hero_btns">
                  <a href="#" className="play_btn" onClick={(e) => { e.preventDefault(); setShowModal(true) }}>
                    <img src={withBasePath("/images/play_btn.png")} alt="Play" />Play Quick Video
                  </a>
                  <Link href="#" className="btn btn--white btn--lg btn--round">
                    Join Us Today
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="modal fade video_modal show" style={{ display: "block" }} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <iframe width="100%" height="500" src="https://www.youtube.com/embed/lvtfD_rJ2hE" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}

      <section className="about_mission">
        <div className="content_block1">
          <div className="container">
            <div className="row">
              <div className="col-md-5 col-sm-12">
                <div className="content_area">
                  <h1 className="content_area--title">
                    About
                    <span className="highlight">MartPlace</span>
                  </h1>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut sceler isque the mattis, leo quam aliquet
                    congue this there placerat mi id nisi they interdum mollis. Praesent pharetra justo ut sceleris que the mattis,
                    leo quam aliquet. Nunc placer atmi id nisi interdum mollis quam. Lorem ipsum dolor sit amet, consetetur
                    sadipscing elitr, sed diam nonumy eirmod tempor invidunt sanctus est Lorem ipsum dolor sit amet consetetur
                    sadipscing.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="content_image bgimage">
            <div className="bg_image_holder">
              <img src={withBasePath("/images/ab1.jpg")} alt="" />
            </div>
          </div>
        </div>

        <div className="content_block2">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 offset-md-6 offset-lg-7">
                <div className="content_area2">
                  <h1 className="content_area2--title">
                    MartPlace
                    <span className="highlight">Mission</span>
                  </h1>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut sceler isque the mattis, leo quam aliquet
                    congue this there placerat mi id nisi they interdum mollis. Praesent pharetra justo ut sceleris que the mattis,
                    leo quam aliquet. Nunc placer atmi id nisi interdum mollis quam. Lorem ipsum dolor sit amet, consetetur
                    sadipscing elitr, sed diam nonumy eirmod tempor invidunt sanctus est Lorem ipsum dolor sit amet consetetur
                    sadipscing.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="content_image2 bgimage">
            <div className="bg_image_holder">
              <img src={withBasePath("/images/ab2.jpg")} alt="" />
            </div>
          </div>
        </div>
      </section>

      <section className="timeline_area section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>
                  MartPlace Milestone
                  <span className="highlighted"> Achievements</span>
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
              <ul className="timeline">
                {[
                  { period: "February 2009", title: "MartPlace was Launched", desc: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet." },
                  { period: "February 2010", title: "Launched Premium Version", desc: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet." },
                  { period: "July 2012", title: "3 Million Downloads Reached", desc: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet." },
                  { period: "November 2015", title: "50,000+ Community Members", desc: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet." },
                  { period: "August 2016", title: "Added Payoneer as a Payment Method", desc: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet." },
                ].map((milestone, index) => (
                  <li key={index} className="happening">
                    <div className="happening--period">
                      <p>{milestone.period}</p>
                    </div>
                    <div className="happening--detail">
                      <h4 className="title">{milestone.title}</h4>
                      <p>{milestone.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="counter-up-area counter-up--area2" ref={counterRef}>
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center">
              <h2>Today We are in Here</h2>
            </div>
          </div>
          <div className="col-md-12">
            <div className="counter-up">
              <div className="counter mcolor2">
                <span className="lnr lnr-briefcase"></span>
                <span className="count">{itemsCount.toLocaleString()}</span>
                <p>items for sale</p>
              </div>
              <div className="counter mcolor3">
                <span className="lnr lnr-cart"></span>
                <span className="count">{totalSales.toLocaleString()}</span>
                <p>total sales</p>
              </div>
              <div className="counter mcolor1">
                <span className="lnr lnr-smile"></span>
                <span className="count">{happyCustomers.toLocaleString()}</span>
                <p>appy customers</p>
              </div>
              <div className="counter mcolor4">
                <span className="lnr lnr-users"></span>
                <span className="count">{members.toLocaleString()}</span>
                <p>members</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="team_area section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>
                  The Team at
                  <span className="highlighted">MartPlace</span>
                </h1>
                <p>
                  Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid est laborum
                  dolo rumes fugats untras.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            {[
              { name: "Douglus Khundu", role: "Software Engineer", image: "/images/team1.jpg" },
              { name: "Robert Jellybean", role: "Application Developer", image: "/images/team2.jpg" },
              { name: "Tomat Notfrut", role: "Js Developer", image: "/images/team3.jpg" },
              { name: "Naro Sundor", role: "CTO", image: "/images/team4.jpg" },
              { name: "Robert Jellybean", role: "Application Developer", image: "/images/team2.jpg" },
              { name: "Tomat Notfrut", role: "Js Developer", image: "/images/team3.jpg" },
              { name: "Naro Sundor", role: "CTO", image: "/images/team4.jpg" },
              { name: "Douglus Khundu", role: "Software Engineer", image: "/images/team1.jpg" },
            ].map((member, index) => (
              <div key={index} className="col-lg-3 col-md-4">
                <div className="single_team_member">
                  <figure>
                    <Image src={withBasePath(member.image)} alt="Team Member" width={300} height={300} />
                    <figcaption>
                      <div className="name_desig">
                        <h4>{member.name}</h4>
                        <p>{member.role}</p>
                      </div>
                      <div className="social">
                        <ul>
                          <li>
                            <Link href="#">
                              <span className="fa fa-facebook"></span>
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <span className="fa fa-twitter"></span>
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <span className="fa fa-google-plus"></span>
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <span className="fa fa-dribbble"></span>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="partner-area section--padding partner--area2 bgimage">
        <div className="bg_image_holder">
          <img src={withBasePath("/images/fn.jpg")} alt="" />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>
                  We are
                  <span className="highlighted">Featured on</span>
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
              <div className="partners">
                {["/images/cl1.png", "/images/cl2.png", "/images/cl3.png", "/images/cl4.png", "/images/cl2.png"].map((img, index) => (
                  <div key={index} className="partner">
                    <Image src={withBasePath(img)} alt="partner image" width={150} height={80} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-area testimonial--2 section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>
                  Our Clients
                  <span className="highlighted">Feedback</span>
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
                {[
                  { name: "Tubeda Pagla", role: "Product Designer", image: "/images/test1.jpg", text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is the laoreet elit metus. Nunc placerat mi is id nisi interdum is mollis. Praesent the pharetra, justo ut scelerisque." },
                  { name: "Tarashi Hamada", role: "Quality Ninja", image: "/images/test2.jpg", text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is the laoreet elit metus. Nunc placerat mi is id nisi interdum is mollis. Praesent the pharetra, justo ut scelerisque." },
                ].map((testimonial, index) => (
                  <div key={index} className="testimonial">
                    <div className="testimonial__about">
                      <div className="avatar v_middle">
                        <Image src={withBasePath(testimonial.image)} alt="Testimonial Avatar" width={80} height={80} />
                      </div>
                      <div className="name-designation v_middle">
                        <h4 className="name">{testimonial.name}</h4>
                        <span className="desig">{testimonial.role}</span>
                      </div>
                      <span className="lnr lnr-bubble quote-icon"></span>
                    </div>
                    <div className="testimonial__text">
                      <p>{testimonial.text}</p>
                    </div>
                  </div>
                ))}
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

      <section className="gallery_area">
        <div className="gallery_contents_wrapper bgimage">
          <div className="bg_image_holder">
            <img src={withBasePath("/images/galbg.jpg")} alt="" />
          </div>
          <div className="container content_above">
            <div className="row">
              <div className="col-md-6 offset-md-3">
                <div className="gallery_contents">
                  <h3>Work Together</h3>
                  <p>We love what we do and come to work every day hungry to change the world of work!</p>
                </div>
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

