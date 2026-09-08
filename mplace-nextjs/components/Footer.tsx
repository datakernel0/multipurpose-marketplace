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
                <div className="info__logo marketnest-footer-brand">
                  <span className="marketnest-wordmark">MarketNest</span>
                  <span className="marketnest-tagline">Discover. Sell. Grow.</span>
                </div>
                <p className="info--text">
                  A focused marketplace for digital products from independent creators.
                </p>
              </div>
            </div>

            <div className="col-lg-5 col-md-6">
              <div className="footer-menu">
                <h4 className="footer-widget-title text--white">Marketplace</h4>
                <ul>
                  <li>
                    <Link href="/all-products">Browse Products</Link>
                  </li>
                  <li>
                    <Link href="/category-grid">Categories</Link>
                  </li>
                  <li>
                    <Link href="/dashboard/upload">Become a Seller</Link>
                  </li>
                  <li>
                    <Link href="/favourites">Favorites</Link>
                  </li>
                </ul>
              </div>

              <div className="footer-menu">
                <h4 className="footer-widget-title text--white">
                  Support
                </h4>
                <ul>
                  <li>
                    <Link href="/contact">Contact / Support</Link>
                  </li>
                  <li>
                    <Link href="/faq">FAQ</Link>
                  </li>
                  <li>
                    <Link href="/term-condition">Terms</Link>
                  </li>
                  <li>
                    <Link href="/login">Login</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-4 col-md-12">
              <div className="newsletter">
                <h4 className="footer-widget-title text--white">Newsletter</h4>
                <p>
                  Get occasional updates about new digital products and creator resources.
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
                   &copy; {new Date().getFullYear()} <Link href="/">MarketNest</Link>.
                   All rights reserved.
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
