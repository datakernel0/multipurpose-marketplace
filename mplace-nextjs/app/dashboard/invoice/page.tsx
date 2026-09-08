"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import DashboardMenu from "@/components/dashboard/DashboardMenu";
import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/utils/paths";

export default function DashboardInvoicePage() {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Handle download
  };

  return (
    <div className="preload dashboard-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Invoice"
        paths={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Statement", link: "#" },
          { name: "Invoice", link: "/dashboard/invoice" },
        ]}
      />

      <section className="dashboard-area">
        <DashboardMenu />

        <div className="dashboard_contents">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="dashboard_title_area">
                  <div className="pull-left">
                    <div className="dashboard__title">
                      <h3>Invoice</h3>
                    </div>
                  </div>

                  <div className="pull-right">
                    <a
                      href="#"
                      className="btn btn--round print_btn"
                      onClick={handlePrint}
                    >
                      <span className="lnr lnr-printer"></span>Print
                    </a>
                    <a
                      href="#"
                      className="btn btn--round btn--sm"
                      onClick={handleDownload}
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="invoice">
                  <div className="invoice__head">
                    <div className="invoice_logo">
                      <Image
                        src={withBasePath("/images/logo.png")}
                        alt="Logo"
                        width={150}
                        height={50}
                      />
                    </div>

                    <div className="info">
                      <h4>Invoice info</h4>
                      <p>Order # MP810094</p>
                    </div>
                  </div>

                  <div className="invoice__meta">
                    <div className="address">
                      <h5 className="bold">BackTheme</h5>
                      <p>1355 Market Street, Suite 900</p>
                      <p>San Francisco, CA 94103</p>
                      <p>United States</p>
                    </div>

                    <div className="date_info">
                      <p>
                        <span>Invoice Date</span>May 05, 2019
                      </p>
                      <p>
                        <span>Due Date</span>May 10, 2019
                      </p>
                      <p className="status">
                        <span>Status</span>Sale
                      </p>
                    </div>
                  </div>

                  <div className="invoice__detail">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>BackTheme</th>
                            <th>Item</th>
                            <th>License</th>
                            <th>Unit Cost</th>
                            <th>Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td>03 Jul 2019</td>
                            <td className="author">BackTheme</td>
                            <td className="detail">
                              <Link href="#">Multipurpose Blog Template</Link>
                            </td>
                            <td>Regular</td>
                            <td>$30</td>
                            <td>$30</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="pricing_info">
                      <p>Sub - Total amount: $30</p>
                      <p className="bold">Total : $30</p>
                    </div>
                  </div>
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
