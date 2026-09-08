import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"

export default function TablePage() {
  return (
    <div className="preload table-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Table" paths={[{ name: "Table", link: "/table" }]} />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="">
                <div className="modules__content">
                  <div className="withdraw_module withdraw_history">
                    <div className="withdraw_table_header">
                      <h3>Withdrawal History</h3>
                    </div>
                    <div className="table-responsive">
                      <table className="table withdraw__table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Payment Method</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>09 Jul 2019</td>
                            <td>Payoneer</td>
                            <td className="bold">$568.50</td>
                            <td className="pending">
                              <span>Pending</span>
                            </td>
                          </tr>
                          <tr>
                            <td>20 May 2019</td>
                            <td>Payoneer</td>
                            <td className="bold">$1300.50</td>
                            <td className="paid">
                              <span>Paid</span>
                            </td>
                          </tr>
                          <tr>
                            <td>16 Dec 2016</td>
                            <td>Local Bank (USD) - Account ending in 5790</td>
                            <td className="bold">$2380</td>
                            <td className="paid">
                              <span>Paid</span>
                            </td>
                          </tr>
                          <tr>
                            <td>09 Jul 2019</td>
                            <td>Payoneer</td>
                            <td className="bold">$568.50</td>
                            <td className="pending">
                              <span>Pending</span>
                            </td>
                          </tr>
                          <tr>
                            <td>20 May 2019</td>
                            <td>Payoneer</td>
                            <td className="bold">$1300.50</td>
                            <td className="paid">
                              <span>Paid</span>
                            </td>
                          </tr>
                          <tr>
                            <td>16 Dec 2016</td>
                            <td>Local Bank (USD) - Account ending in 5790</td>
                            <td className="bold">$2380</td>
                            <td className="paid">
                              <span>Paid</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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

