"use client"

import { useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import Link from "next/link"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    cv: null as File | null,
    message: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, cv: e.target.files[0] })
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault()
     alert("Application submitted! Check console for submitted data.")
   }

  return (
    <div className="preload job-detail-page">
      <Preloader />
      <Header />
      <section className="job_hero_area job_detail bgimage">
        <div className="bg_image_holder">
          <img src="/images/job_hero.jpg" alt="" />
        </div>
        <div className="container content_above">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="job_hero_content">
                <h1>Senior Front-end Engineer</h1>
                <div className="job_date">
                  <p>
                    <span className="lnr lnr-map-marker"></span> New York City
                  </p>
                  <p>
                    <span className="lnr lnr-calendar-full"></span> New York City
                  </p>
                </div>
              </div>
              <Link href="#" className="btn btn--round btn--white btn--lg">
                Apply now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="job_area section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="job_detail_module information">
                <h3 className="job__title">Quick Information</h3>
                <div className="job__content">
                  <ul className="informations">
                    {[
                      { icon: "lnr-map-marker", label: "Location:", value: "New York City" },
                      { icon: "lnr-briefcase", label: "Job Type:", value: "Full time" },
                      { icon: "lnr-book", label: "Salary:", value: "$4000 - $5000" },
                      { icon: "lnr-graduation-hat", label: "Education:", value: "Masters and Bachelor" },
                      { icon: "lnr-hourglass", label: "Experience:", value: "2+ years" },
                      { icon: "lnr-calendar-full", label: "Deadline:", value: "September 1, 2019" },
                    ].map((info, index) => (
                      <li key={index}>
                        <div className="info_title">
                          <span className={`lnr ${info.icon}`}></span>
                          <p>{info.label}</p>
                        </div>
                        <div className="info">
                          <p>{info.value}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="job_detail_module">
                <h3 className="job__title">Job Description</h3>
                <div className="job__content">
                  <p>
                    laoreet dolore magna aluam erat volutpaterat consectetuerni euism laoreet dolore magna aliquam erat volutpaterat
                    . Consectetuer elit, sed diam nonmy dolor sit amet consectetuer adipiscing elit, sed diam nonmy ipsum dolor sit
                    amet, consectetuer adipiscing elit sed diam nonmy ni euism laor dolore magna aliquam erat volutpat consectetuerni
                    euism laoreet dolore magna aliqm volutpat onsectetuer amet consectetuer adipiscing elit sed diam nonmy ni
                    euism laore dolore magna aluam eravolutpaterat consectetuerni
                  </p>
                </div>

                <h3 className="job__title">Responsibilities</h3>
                <div className="job__content">
                  <p>
                    laoreet dolore magna aluam erat volutpaterat consectetuerni euism laoreet dolore magna aliquam erat volutpaterat
                    . Consectetuer elit, sed diam nonmy dolor sit amet consectetuer adipiscing elit, sed diam nonmy ipsum dolor sit
                    amet, consectetuer adipiscing elit sed diam nonmy.
                  </p>
                  <ul className="content_list">
                    <li>Build next-generation web applications with a focus on the client side.</li>
                    <li>Redesign UI's, implement new UI's, and pick up Java as necessary.</li>
                    <li>Explore and design dynamic and compelling consumer experiences.</li>
                    <li>Design and build scalable framework for web applications.</li>
                  </ul>
                </div>

                <h3 className="job__title">Minimum Qualifications</h3>
                <div className="job__content">
                  <p>
                    laoreet dolore magna aluam erat volutpaterat consectetuerni euism laoreet dolore magna aliquam erat volutpaterat
                    . Consectetuer elit, sed diam nonmy dolor sit amet consectetuer adipiscing elit, sed diam nonmy ipsum dolor sit
                    amet, consectetuer adipiscing elit sed diam nonmy.
                  </p>
                  <ul className="content_list">
                    <li>Build next-generation web applications with a focus on the client side.</li>
                    <li>Redesign UI's, implement new UI's, and pick up Java as necessary.</li>
                    <li>Explore and design dynamic and compelling consumer experiences.</li>
                    <li>Design and build scalable framework for web applications.</li>
                    <li>Build next-generation web applications with a focus on the client side.</li>
                    <li>Redesign UI's, implement new UI's, and pick up Java as necessary.</li>
                  </ul>
                </div>

                <h3 className="job__title">Preferred Qualifications</h3>
                <div className="job__content">
                  <p>
                    laoreet dolore magna aluam erat volutpaterat consectetuerni euism laoreet dolore magna aliquam erat volutpaterat
                    . Consectetuer elit, sed diam nonmy dolor sit amet consectetuer adipiscing elit, sed diam nonmy ipsum dolor sit
                    amet, consectetuer adipiscing elit sed diam nonmy.
                  </p>
                  <ul className="content_list">
                    <li>Build next-generation web applications with a focus on the client side.</li>
                    <li>Redesign UI's, implement new UI's, and pick up Java as necessary.</li>
                    <li>Explore and design dynamic and compelling consumer experiences.</li>
                    <li>Design and build scalable framework for web applications.</li>
                    <li>Build next-generation web applications with a focus on the client side.</li>
                  </ul>
                  <div className="social social--color--filled">
                    <p>Share on :</p>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="apply_area section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>
                  Apply for This
                  <span className="highlighted">Position</span>
                </h1>
                <p>
                  Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid est laborum
                  dolo rumes fugats untras.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="apply_form">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          id="fname"
                          type="text"
                          placeholder="Enter First name"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          id="lname"
                          type="text"
                          placeholder="Enter Last Name"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="email"
                          placeholder="Enter Email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Enter Phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <input
                      id="address"
                      type="text"
                      placeholder="Enter Address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cv_upload" className="cv_upload">
                      <span className="text">Upload your CV</span>
                      <span className="lnr lnr-upload up_icon"></span>
                      <input id="cv_upload" type="file" onChange={handleFileChange} />
                    </label>
                  </div>
                  <div className="form-group">
                    <textarea
                      cols={30}
                      rows={10}
                      placeholder="Your text here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="text-center">
                    <button type="submit" className="btn btn--round btn--default">
                      Apply Now
                    </button>
                  </div>
                </form>
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

