"use client"

import { useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import { useBackgroundImages } from "@/hooks/useBackgroundImage"
import Image from "next/image"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"

export default function EventDetailPage({ params }: { params: { id: string } }) {
  // Replace jQuery behavior with React hook for background images
  useBackgroundImages(".event_detail_breadcrumb .bg_image_holder")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    alert("Form submitted! Check console for submitted data.")
  }

  const speakers = [
    { name: "Joshua Barajas", role: "Web Developer", image: "/images/speaker1.jpg" },
    { name: "Thomas Rogers", role: "Digital Marketer", image: "/images/speaker2.jpg" },
    { name: "Muri Kahn", role: "Software Enginner", image: "/images/speaker3.jpg" },
    { name: "Robert Barrathleon", role: "Software Enginner", image: "/images/speaker4.jpg" },
  ]

  return (
    <div className="preload event-detail-page">
      <Preloader />
      <Header />
      <section className="job_hero_area event_detail_breadcrumb bgimage">
        <div className="bg_image_holder">
          <img src={withBasePath("/images/ev_bg.jpg")} alt="" />
        </div>
        <div className="container content_above">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="job_hero_content">
                <h1>MartPlace Upcoming Event in Bangladesh</h1>
                <div className="job_date">
                  <p>
                    <span className="lnr lnr-map-marker"></span> November 27, 2019
                  </p>
                  <p>
                    <span className="lnr lnr-calendar-full"></span> Dhaka, Bangladesh
                  </p>
                </div>
              </div>
              <Link href="#" className="btn btn--round btn--lg">
                Signup Now
              </Link>
            </div>
          </div>
        </div>
        <div className="social social--color--filled content_above">
          <p>Share on:</p>
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
          </ul>
        </div>
      </section>

      <section className="event_details section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="event_module">
                <h4 className="event_module__title">Event Overview</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam blandit hendrerit faucibus. Suspendisse hendrerit
                  turpis dui, eget ultricies erat consequat ut. Sed ac velit iaculis, condimentum neque eu, maximus urna. Maecenas
                  vitae nunc sit amet risus aliquet facilisis. Cum sociis natoque penatibus et magnis dis parturient montes,
                  nascetur ridiculus mus. In facilisis mi sit amet metus sagittis rhoncus. Fusce eros diam, finibus eget quam at,
                  mattis placerat nulla. Nulla id est dignissim, vehicula enim id, dapibus sem. Integer auctor, massa id rhoncus
                  efficitur, sem magna dignissim velit, ut facilisis enim neque nec velit. Ves tibulum posuere urna non ante
                  commodo, quis accumsan orci hendrerit. Nulla bibendum orci mi, sit amet malesuada diam.
                </p>
                <ul className="list_item">
                  <li>Nullam metus nisi, cursus sit amet metus cursus sit amet</li>
                  <li>Ut sit amet iaculis ex metus nisi, cursus sit amet</li>
                  <li>Sed ac odio aliquet, fringilla odio metus nisi cursus</li>
                </ul>
                <ul className="list_item">
                  <li>Nullam metus nisi, cursus sit amet metus cursus sit amet</li>
                  <li>Ut sit amet iaculis ex metus nisi, cursus sit amet</li>
                  <li>Sed ac odio aliquet, fringilla odio metus nisi cursus</li>
                </ul>
              </div>

              <div className="event_module">
                <h4 className="event_module__title">Event Speakers</h4>
                {speakers.map((speaker, index) => (
                  <div key={index} className="single_speaker">
                    <div className="speaker__thumbnail">
                      <Image src={withBasePath(speaker.image)} alt="" width={100} height={100} />
                    </div>
                    <div className="speaker__detail">
                      <h4>{speaker.name}</h4>
                      <span className="ocuup">{speaker.role}</span>
                      <p>Nullam blandit hendrerit faucibus. Suspendisse hendrerit turpis dui Sed ac velit iaculis, condimentum.</p>
                      <div className="speaker_social">
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
                              <span className="fa fa-pinterest"></span>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="event_module sponsor--area">
                <h4 className="event_module__title">Event Sponsors</h4>
                <ul className="sponsores">
                  {["/images/spn1.jpg", "/images/sp2.jpg", "/images/sp3.jpg", "/images/spn1.jpg"].map((img, index) => (
                    <li key={index}>
                      <Image src={withBasePath(img)} alt="Sponsors image" width={150} height={80} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="google_map">
          <div className="location_address">
            <div className="addres_module">
              <h4>Victory Business Centre, Somers Road North, Portsmouth</h4>
              <p>
                <span className="lnr lnr-phone-handset"></span>800 567.890.849
              </p>
              <p>
                <span className="lnr lnr-envelope"></span>support@martplace.com
              </p>
            </div>
          </div>
          <div id="map"></div>
        </div>

        <div className="sign_up_area">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <h2 className="sign_up_title">Sign Up & Get Your Ticket</h2>
                <div className="ticket_form">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <input type="text" placeholder="Email" />
                        </div>
                      </div>
                    </div>
                    <textarea
                      cols={30}
                      rows={10}
                      placeholder="Yout text here"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                    <div className="sub_btn">
                      <button type="submit" className="btn btn--round btn--default">
                        Submit Now
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

