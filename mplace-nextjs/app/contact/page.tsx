"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import { getApiUrl } from "@/utils/paths";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(getApiUrl("/api/contact"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send message. Please try again.");
        setLoading(false);
        return;
      }

      setMessage(
        data.message ||
          "Thank you for contacting us! We'll get back to you soon."
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setLoading(false);

      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (err: any) {
      setError("Failed to send message. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="preload contact-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Contact Us"
        subtitle="You came to the right place"
        paths={[{ name: "Contact Us", link: "/contact" }]}
      />
      <section className="contact-area section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="row">
                <div className="col-md-12">
                  <div className="section-title">
                    <h1>
                      How can We
                      <span className="highlighted">Help?</span>
                    </h1>
                    <p>
                      Laborum dolo rumes fugats untras. Etharums ser quidem
                      rerum facilis dolores nemis omnis fugats. Lid est laborum
                      dolo rumes fugats untras.
                    </p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-4 col-md-6">
                  <div className="contact_tile">
                    <span className="tiles__icon lnr lnr-map-marker"></span>
                    <h4 className="tiles__title">Office Address</h4>
                    <div className="tiles__content">
                      <p>
                        202 New Hampshire Avenue , Northwest #100, New York-2573
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="contact_tile">
                    <span className="tiles__icon lnr lnr-phone"></span>
                    <h4 className="tiles__title">Phone Number</h4>
                    <div className="tiles__content">
                      <p>1-800-643-4500</p>
                      <p>1-800-643-4500</p>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="contact_tile">
                    <span className="tiles__icon lnr lnr-inbox"></span>
                    <h4 className="tiles__title">Email Address</h4>
                    <div className="tiles__content">
                      <p>support@backtheme.com</p>
                      <p>support@backtheme.com</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="contact_form cardify">
                    <div className="contact_form__title">
                      <h3>Leave Your Messages</h3>
                    </div>

                    <div className="row">
                      <div className="col-md-8 offset-md-2">
                        <div className="contact_form--wrapper">
                          <form onSubmit={handleSubmit}>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input
                                    type="text"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        name: e.target.value,
                                      })
                                    }
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
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        email: e.target.value,
                                      })
                                    }
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
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group">
                                  <input
                                    type="text"
                                    placeholder="Subject"
                                    value={formData.subject}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        subject: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="form-group">
                              <textarea
                                cols={30}
                                rows={10}
                                placeholder="Your text here"
                                value={formData.message}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    message: e.target.value,
                                  })
                                }
                                required
                              ></textarea>
                            </div>

                            <div className="sub_btn">
                              <button
                                type="submit"
                                className="btn btn--round btn--default"
                                disabled={loading}
                              >
                                {loading ? "Sending..." : "Send Request"}
                              </button>
                            </div>
                            {message && (
                              <div
                                style={{
                                  marginTop: "15px",
                                  padding: "15px",
                                  backgroundColor: "#d4edda",
                                  color: "#155724",
                                  borderRadius: "4px",
                                  textAlign: "center",
                                }}
                              >
                                {message}
                              </div>
                            )}
                            {error && (
                              <div
                                style={{
                                  marginTop: "15px",
                                  padding: "15px",
                                  backgroundColor: "#f8d7da",
                                  color: "#721c24",
                                  borderRadius: "4px",
                                  textAlign: "center",
                                }}
                              >
                                {error}
                              </div>
                            )}
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="map" style={{ height: "400px", width: "100%" }}></div>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
