"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useState } from "react"
import { withBasePath } from "@/utils/paths"

export default function FormElementsPage() {
  const [date1, setDate1] = useState<Date | null>(null)
  const [date2, setDate2] = useState<Date | null>(null)

  return (
    <div className="preload form-elements-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Form Elements" paths={[{ name: "Form Elements", link: "/form-elements" }]} />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Forms Elements</h3>
                </div>
                <div className="modules__content">
                  <div className="row">
                    <div className="col-md-6 offset-md-1">
                      <form action="#">
                        <div className="form-group">
                          <label htmlFor="f1">Input Field 1</label>
                          <input type="text" id="f1" className="text_field" placeholder="Enter your username..." />
                        </div>
                        <div className="form-group">
                          <label htmlFor="f2">Input Field 2</label>
                          <input type="text" id="f2" placeholder="Name" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="category">Select Field 1</label>
                          <div className="select-wrap select-wrap2">
                            <select name="country" id="category" className="text_field">
                              <option value="">Select one</option>
                              <option value="wordpress">Wordpress</option>
                              <option value="html">Html</option>
                              <option value="graphic">Graphics</option>
                              <option value="illustration">Illustration</option>
                              <option value="music">Music</option>
                              <option value="video">Video</option>
                            </select>
                            <span className="lnr lnr-chevron-down"></span>
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor="selected">Multiple selection</label>
                          <select name="country" id="selected" multiple className="text_field">
                            <option value="php">php</option>
                            <option value="html">Html</option>
                            <option value="psd">psd</option>
                            <option value="js">javascript</option>
                            <option value="coffee">coffeescript</option>
                            <option value="video">Video</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="cv_upload">Upload Field</label>
                          <label htmlFor="cv_upload" className="cv_upload">
                            <span className="text">Upload your CV</span>
                            <span className="lnr lnr-upload up_icon"></span>
                            <input id="cv_upload" type="file" />
                          </label>
                        </div>
                        <div className="form-group">
                          <label htmlFor="rlicense">Input with addon</label>
                          <div className="input-group with--addon">
                            <span className="input-group-addon">$</span>
                            <input type="text" id="rlicense" className="text_field" placeholder="00.00" />
                          </div>
                        </div>
                        <div className="form-group">
                          <p className="label">Checkbox Style 1</p>
                          <div className="custom_checkbox">
                            <input type="checkbox" id="opt1" name="mail_rating_reminder" defaultChecked />
                            <label htmlFor="opt1">
                              <span className="shadow_checkbox"></span>
                              <span> I have read and agree to the terms and conditions</span>
                            </label>
                          </div>
                        </div>
                        <div className="form-group">
                          <p className="label">Checkbox Style 2</p>
                          <div className="custom-checkbox2">
                            <input type="checkbox" id="opti6" name="filter_opt" />
                            <label htmlFor="opti6">
                              <span className="circle"></span>Option 1
                            </label>
                          </div>
                        </div>
                        <div className="form-group">
                          <p className="label">Radio Style 1</p>
                          <div className="custom-radio">
                            <input type="radio" id="opt5" name="filter_opt" />
                            <label htmlFor="opt5">
                              <span className="circle"></span>Option 1
                            </label>
                          </div>
                          <div className="custom-radio">
                            <input type="radio" id="opt6" name="filter_opt" />
                            <label htmlFor="opt6">
                              <span className="circle"></span>Option 2
                            </label>
                          </div>
                          <div className="custom-radio">
                            <input type="radio" id="opt7" name="filter_opt" />
                            <label htmlFor="opt7">
                              <span className="circle"></span>Option 3
                            </label>
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor="textarea1">Textarea 1</label>
                          <textarea className="text_field" name="txt" id="textarea1" placeholder="Your text here"></textarea>
                        </div>
                        <div className="form-group">
                          <label htmlFor="textarea2">Textarea 2</label>
                          <textarea className="" name="txt2" id="textarea2" placeholder="Your text here"></textarea>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="datp1">Date Picker</label>
                              <div className="input_with_icon">
                                <DatePicker
                                  id="datp1"
                                  selected={date1}
                                  onChange={(date) => setDate1(date)}
                                  placeholderText="From"
                                  className="dattaPikkara text_field"
                                  dateFormat="MM/dd/yyyy"
                                />
                                <span className="lnr lnr-calendar-full"></span>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="datp2">Date Picker</label>
                              <div className="input_with_icon">
                                <DatePicker
                                  id="datp2"
                                  selected={date2}
                                  onChange={(date) => setDate2(date)}
                                  placeholderText="To"
                                  className="dattaPikkara text_field"
                                  dateFormat="MM/dd/yyyy"
                                />
                                <span className="lnr lnr-calendar-full"></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
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

