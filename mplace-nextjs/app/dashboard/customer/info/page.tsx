"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import CustomerMenu from "@/components/customer/CustomerMenu";
import CallToActionSection from "@/components/sections/CallToActionSection";
import { useState } from "react";

export default function CustomerInfoPage() {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "backtheme",
    lastName: "Aazz Tech",
    displayName: "BackTheme",
    email: "contact@backtheme.com",
  });

  const [billingAddress, setBillingAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    zipcode: "",
    country: "",
    state: "",
  });

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillingAddressChange = (field: string, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Information saved! Check console for submitted data.");
  };

  return (
    <div className="preload customer-info-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Customer Info"
        paths={[
          { name: "Dashboard", link: "/dashboard/customer" },
          { name: "Customer Info", link: "/dashboard/customer/info" },
        ]}
      />
      <section className="dashboard-area">
        <CustomerMenu />

        <div className="dashboard_contents">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="dashboard_title_area">
                  <div className="dashboard__title">
                    <h3>Account Settings</h3>
                  </div>
                </div>
              </div>
            </div>

            <form action="#" className="setting_form" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-12">
                  <div className="information_module">
                    <a className="toggle_title">
                      <h4>Personal Information</h4>
                    </a>

                    <div className="information__set toggle_module">
                      <div className="information_wrapper form--fields">
                        <div className="form-group">
                          <label htmlFor="fname">First Name</label>
                          <input
                            type="text"
                            id="fname"
                            className="text_field"
                            placeholder="First name"
                            value={personalInfo.firstName}
                            onChange={(e) =>
                              handlePersonalInfoChange(
                                "firstName",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="lname">Last Name</label>
                          <input
                            type="text"
                            id="lname"
                            className="text_field"
                            placeholder="Last Name"
                            value={personalInfo.lastName}
                            onChange={(e) =>
                              handlePersonalInfoChange(
                                "lastName",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="dname">Display Name</label>
                          <input
                            type="text"
                            id="dname"
                            className="text_field"
                            placeholder="Display Name"
                            value={personalInfo.displayName}
                            onChange={(e) =>
                              handlePersonalInfoChange(
                                "displayName",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="emailad">Primary Email Address</label>
                          <input
                            type="text"
                            id="emailad"
                            className="text_field"
                            placeholder="Email address"
                            value={personalInfo.email}
                            onChange={(e) =>
                              handlePersonalInfoChange("email", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="information_module">
                    <a className="toggle_title">
                      <h4>Change Billing Address</h4>
                    </a>

                    <div className="information__set toggle_module">
                      <div className="information_wrapper form--fields">
                        <div className="form-group">
                          <label htmlFor="address1">Address Line 1</label>
                          <input
                            type="text"
                            id="address1"
                            className="text_field"
                            placeholder="Address line one"
                            value={billingAddress.address1}
                            onChange={(e) =>
                              handleBillingAddressChange(
                                "address1",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="address2">Address Line 2</label>
                          <input
                            type="text"
                            id="address2"
                            className="text_field"
                            placeholder="Address line two"
                            value={billingAddress.address2}
                            onChange={(e) =>
                              handleBillingAddressChange(
                                "address2",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="city">
                            City / State<sup>*</sup>
                          </label>
                          <div className="select-wrap select-wrap2">
                            <select
                              name="city"
                              id="city"
                              className="text_field"
                              value={billingAddress.city}
                              onChange={(e) =>
                                handleBillingAddressChange(
                                  "city",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select one</option>
                              <option value="dhaka">Dhaka</option>
                              <option value="sydney">Sydney</option>
                              <option value="newyork">New York</option>
                              <option value="london">London</option>
                              <option value="mexico">New Mexico</option>
                            </select>
                            <span className="lnr lnr-chevron-down"></span>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="zipcode">
                            Zip / Postal Code<sup>*</sup>
                          </label>
                          <input
                            type="text"
                            id="zipcode"
                            className="text_field"
                            placeholder="zip/postal code"
                            value={billingAddress.zipcode}
                            onChange={(e) =>
                              handleBillingAddressChange(
                                "zipcode",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="country">
                            Country<sup>*</sup>
                          </label>
                          <div className="select-wrap select-wrap2">
                            <select
                              name="country"
                              id="country"
                              className="text_field"
                              value={billingAddress.country}
                              onChange={(e) =>
                                handleBillingAddressChange(
                                  "country",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select one</option>
                              <option value="dhaka">Dhaka</option>
                              <option value="sydney">Sydney</option>
                              <option value="newyork">New York</option>
                              <option value="london">London</option>
                              <option value="mexico">New Mexico</option>
                            </select>
                            <span className="lnr lnr-chevron-down"></span>
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor="state">
                            State / Province<sup>*</sup>
                          </label>
                          <input
                            type="text"
                            id="state"
                            className="text_field"
                            placeholder="zip/postal code"
                            value={billingAddress.state}
                            onChange={(e) =>
                              handleBillingAddressChange(
                                "state",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard_setting_btn">
                    <button type="submit" className="btn btn--round btn--md">
                      Save Change
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
