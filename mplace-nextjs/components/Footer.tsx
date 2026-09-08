"use client";

import { getApiUrl, withBasePath } from "@/utils/paths";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(getApiUrl("/api/newsletter"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to subscribe. Please try again.");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Successfully subscribed to newsletter!");
      setEmail("");
      setLoading(false);

      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (err: any) {
      setError(err?.message || "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };
  return (
    <footer className="footer-area">
      <div className="footer-big section--padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6">
              <div className="info-footer">
                <div className="info__logo">
                  <img
                    src={withBasePath("/images/flogo.png")}
                    alt="footer logo"
                  />
                </div>
                <p className="info--text">
                  Nunc placerat mi id nisi interdum they mollis. Praesent
                  pharetra, justo ut scel erisque the mattis, leo quam.
                </p>
                <ul className="info-contact">
                  <li>
                    <span className="lnr lnr-phone info-icon"></span>
                    <span className="info">Phone: +6789-875-2235</span>
                  </li>
                  <li>
                    <span className="lnr lnr-envelope info-icon"></span>
                    <span className="info">support@backtheme.com</span>
                  </li>
                  <li>
                    <span className="lnr lnr-map-marker info-icon"></span>
                    <span className="info">
                      202 New Hampshire Avenue Northwest #100, New York-2573
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-5 col-md-6">
              <div className="footer-menu">
                <h4 className="footer-widget-title text--white">Our Company</h4>
                <ul>
                  <li>
                    <Link href="/how-it-works">How to Join Us</Link>
                  </li>
                  <li>
                    <Link href="/how-it-works">How It Work</Link>
                  </li>
                  <li>
                    <Link href="/all-products">Buying and Selling</Link>
                  </li>
                  <li>
                    <Link href="/testimonials">Testimonials</Link>
                  </li>
                  <li>
                    <Link href="/term-condition">Copyright Notice</Link>
                  </li>
                  <li>
                    <Link href="/term-condition">Refund Policy</Link>
                  </li>
                  <li>
                    <Link href="/affiliate">Affiliates</Link>
                  </li>
                </ul>
              </div>

              <div className="footer-menu">
                <h4 className="footer-widget-title text--white">
                  Help and FAQs
                </h4>
                <ul>
                  <li>
                    <Link href="/how-it-works">How to Join Us</Link>
                  </li>
                  <li>
                    <Link href="/how-it-works">How It Work</Link>
                  </li>
                  <li>
                    <Link href="/all-products">Buying and Selling</Link>
                  </li>
                  <li>
                    <Link href="/testimonials">Testimonials</Link>
                  </li>
                  <li>
                    <Link href="/term-condition">Copyright Notice</Link>
                  </li>
                  <li>
                    <Link href="/term-condition">Refund Policy</Link>
                  </li>
                  <li>
                    <Link href="/affiliate">Affiliates</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-4 col-md-12">
              <div className="newsletter">
                <h4 className="footer-widget-title text--white">Newsletter</h4>
                <p>
                  Subscribe to get the latest news, update and offer
                  information. Don't worry, we won't send spam!
                </p>
                <div className="newsletter__form">
                  <form onSubmit={handleSubmit}>
                    <div className="field-wrapper">
                      <input
                        className="relative-field rounded"
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <button
                        className="btn btn--round"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                    {message && (
                      <div
                        style={{
                          marginTop: "10px",
                          color: "#62d03a",
                          fontSize: "14px",
                        }}
                      >
                        {message}
                      </div>
                    )}
                    {error && (
                      <div
                        style={{
                          marginTop: "10px",
                          color: "#ff6a6d",
                          fontSize: "14px",
                        }}
                      >
                        {error}
                      </div>
                    )}
                  </form>
                </div>

                <div className="social social--color--filled">
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
                    <li>
                      <Link href="#">
                        <span className="fa fa-linkedin"></span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#">
                        <span className="fa fa-dribbble"></span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mini-footer">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="copyright-text">
                <p>
                  &copy; {new Date().getFullYear()}
                  <Link href="/"> MartPlace</Link>. All rights reserved. Created
                  by
                  <Link href="#"> BackTheme</Link>
                </p>
              </div>

              <div className="go_top">
                <span className="lnr lnr-chevron-up"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
