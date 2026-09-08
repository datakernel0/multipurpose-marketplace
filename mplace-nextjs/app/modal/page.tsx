"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import CallToActionSection from "@/components/sections/CallToActionSection";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ModalPage() {
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);

  useEffect(() => {
    if (showModal1 || showModal2) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal1, showModal2]);

  return (
    <div className="preload modal-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Modals"
        paths={[{ name: "Modals", link: "/modal" }]}
      />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="shortcode_module_title">
                <div className="dashboard__title pull-left">
                  <h3>Cards 1</h3>
                </div>
                <div className="pull-right">
                  <a
                    href="#"
                    className="btn btn--md btn--round"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowModal1(true);
                    }}
                  >
                    Modal 1
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="shortcode_module_title">
                <div className="dashboard__title pull-left">
                  <h3>Cards 2</h3>
                </div>
                <div className="pull-right">
                  <a
                    href="#"
                    className="btn btn--md btn--round"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowModal2(true);
                    }}
                  >
                    Modal 2
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal 1 */}
      {showModal1 && (
        <div
          className="modal fade rating_modal show"
          style={{ display: "block" }}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="rating_modal"
        >
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal1(false)}
          ></div>
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowModal1(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
                <h3 className="modal-title" id="rating_modal">
                  Rating this Item
                </h3>
                <h4>Product Enquiry Extension</h4>
                <p>
                  by <Link href="/author">BackTheme</Link>
                </p>
              </div>

              <div className="modal-body">
                <form action="#">
                  <ul>
                    <li>
                      <p>Your Rating</p>
                      <div className="right_content btn btn--round btn--white btn--md">
                        <select name="rating" className="give_rating">
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                      </div>
                    </li>

                    <li>
                      <p>Rating Causes</p>
                      <div className="right_content">
                        <div className="select-wrap">
                          <select name="review_reason" id="rev">
                            <option value="design">Design Quality</option>
                            <option value="customization">Customization</option>
                            <option value="support">Support</option>
                            <option value="performance">Performance</option>
                            <option value="documentation">
                              Well Documented
                            </option>
                          </select>
                          <span className="lnr lnr-chevron-down"></span>
                        </div>
                      </div>
                    </li>
                  </ul>

                  <div className="rating_field">
                    <label htmlFor="rating_field">Comments</label>
                    <textarea
                      name="rating_field"
                      id="rating_field"
                      className="text_field"
                      placeholder="Please enter your rating reason to help the author"
                    ></textarea>
                    <p className="notice">
                      Your review will be ​publicly visible​ and the author may
                      reply to your comments.
                    </p>
                  </div>
                  <button type="submit" className="btn btn--round btn--default">
                    Submit Rating
                  </button>
                  <button
                    type="button"
                    className="btn btn--round modal_close"
                    onClick={() => setShowModal1(false)}
                  >
                    Close
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2 */}
      {showModal2 && (
        <div
          className="modal fade rating_modal item_remove_modal show"
          style={{ display: "block" }}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="myModal2"
        >
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal2(false)}
          ></div>
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  Are you sure to delete this item?
                </h3>
                <p>You will not be able to recover this file!</p>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowModal2(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <button
                  type="submit"
                  className="btn btn--round btn-danger btn--default"
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="btn btn--round modal_close"
                  onClick={() => setShowModal2(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
