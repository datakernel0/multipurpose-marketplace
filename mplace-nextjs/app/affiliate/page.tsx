"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function AffiliatePage() {
  const [formData, setFormData] = useState({
    username: "",
    url: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="preload affiliate-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Become an Affiliate"
        subtitle="Earn 50% on the initial purchase of every theme package."
        paths={[{ name: "Affiliates", link: "/affiliate" }]}
      />
      <section className="affiliate_area section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>
                  Your Affiliate
                  <span className="highlighted">Link</span>
                </h1>
                <p>
                  Laborum dolo rumes fugats untras. Etharums ser quidem rerum
                  facilis dolores nemis omnis fugats. Lid est laborum dolo rumes
                  fugats untras.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
              <div className="cardify affiliate_form">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="userName">Username</label>
                    <input
                      type="text"
                      className="text_field"
                      id="userName"
                      placeholder="Enter your username..."
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="userUrl">Enter URL</label>
                    <input
                      type="text"
                      className="text_field"
                      id="userUrl"
                      placeholder="http://martplace.com"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                    />
                  </div>
                </form>
                <div className="generated">
                  <p>Affiliate Link</p>
                  <p className="link">http://martplace.com?ref=BackTheme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="affliate_rules section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>
                  How it
                  <span className="highlighted">Works?</span>
                </h1>
                <p>
                  Laborum dolo rumes fugats untras. Etharums ser quidem rerum
                  facilis dolores nemis omnis fugats. Lid est laborum dolo rumes
                  fugats untras.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="cardify affliate_rule_module">
                <div className="affiliate_title">
                  <span className="pcolor lnr lnr-checkmark-circle"></span>
                  <h4>Your Benefit</h4>
                </div>
                <div className="collapsible-content faq--card">
                  <ul className="card-content">
                    {[
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                    ].map((item, index) => (
                      <li key={index}>
                        <a href="#">
                          <span></span>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="cardify affliate_rule_module">
                <div className="affiliate_title">
                  <span className="mcolor4 lnr lnr-cross-circle"></span>
                  <h4>Your Benefit</h4>
                </div>
                <div className="collapsible-content faq--card">
                  <ul className="card-content">
                    {[
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                      "Earn 50% on the initial purchase of every theme package, including our theme club.",
                    ].map((item, index) => (
                      <li key={index}>
                        <a href="#">
                          <span></span>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
