"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import DashboardMenu from "@/components/dashboard/DashboardMenu";
import Link from "next/link";

interface StatementTransaction {
  date: string;
  orderId: string;
  author: string;
  detail: string;
  type: "sale" | "purchase" | "credited" | "withdraw";
  price: string;
  earning: string;
  isSubtract?: boolean;
}

export default function DashboardStatementPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactionType, setTransactionType] = useState("all");

  const transactions: StatementTransaction[] = [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search
  };

  const getTypeClass = (type: string) => {
    switch (type) {
      case "sale":
        return "sale";
      case "purchase":
        return "purchase";
      case "credited":
        return "credited";
      case "withdraw":
        return "withdrawal";
      default:
        return "";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "sale":
        return "Sale";
      case "purchase":
        return "Purchase";
      case "credited":
        return "Credited";
      case "withdraw":
        return "Withdraw";
      default:
        return type;
    }
  };

  return (
    <div className="preload dashboard-page dashboard-statement">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Sales Statements"
        paths={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Statement", link: "/dashboard/statement" },
        ]}
      />

      <section className="dashboard-area">
        <DashboardMenu />

        <div className="dashboard_contents dashboard_statement_area">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="dashboard_title_area">
                  <div className="dashboard__title">
                    <h3>Sales Statements</h3>
                    <div className="date_area">
                      <form action="#" onSubmit={handleSearch}>
                        <div className="input_with_icon">
                          <input
                            type="text"
                            className="dattaPikkara"
                            placeholder="From"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                          />
                          <span className="lnr lnr-calendar-full"></span>
                        </div>

                        <div className="input_with_icon">
                          <input
                            type="text"
                            className="dattaPikkara"
                            placeholder="To"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                          />
                          <span className="lnr lnr-calendar-full"></span>
                        </div>
                        <div className="select-wrap">
                          <select
                            name="transaction_type"
                            id="#"
                            value={transactionType}
                            onChange={(e) => setTransactionType(e.target.value)}
                          >
                            <option value="all">All Transaction</option>
                            <option value="sale">Sale</option>
                            <option value="purchase">Purchase</option>
                            <option value="credited">Withdraw</option>
                          </select>
                          <span className="lnr lnr-chevron-down"></span>
                        </div>

                        <button
                          type="submit"
                          className="btn btn--sm btn--round btn--color1"
                        >
                          Search
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-3 col-md-3">
                <div className="statement_info_card">
                  <div className="info_wrap">
                    <span className="lnr lnr-tag icon mcolorbg1"></span>
                    <div className="info">
                        <p>—</p>
                      <span>Total Sales</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-3">
                <div className="statement_info_card">
                  <div className="info_wrap">
                    <span className="lnr lnr-cart icon mcolorbg2"></span>
                    <div className="info">
                        <p>—</p>
                      <span>Total Purchases</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-3">
                <div className="statement_info_card">
                  <div className="info_wrap">
                    <span className="lnr lnr-dice icon mcolorbg3"></span>
                    <div className="info">
                        <p>—</p>
                      <span>Total Credited</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-3">
                <div className="statement_info_card">
                  <div className="info_wrap">
                    <span className="lnr lnr-briefcase icon mcolorbg4"></span>
                    <div className="info">
                        <p>—</p>
                      <span>Total Withdraw</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="statement_table table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Author</th>
                        <th>Detail</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Earning</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center">
                            No transactions yet.
                          </td>
                        </tr>
                      ) : transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td>{transaction.date}</td>
                          <td>{transaction.orderId}</td>
                          <td
                            className={
                              transaction.detail
                                ? "author"
                                : "author text-center"
                            }
                            colSpan={transaction.detail ? undefined : 2}
                          >
                            {transaction.author}
                          </td>
                          {transaction.detail && (
                            <td className="detail">
                              <Link href={`/single-product/${index + 1}`}>
                                {transaction.detail}
                              </Link>
                            </td>
                          )}
                          <td className="type">
                            <span className={getTypeClass(transaction.type)}>
                              {getTypeLabel(transaction.type)}
                            </span>
                          </td>
                          <td>{transaction.price}</td>
                          <td
                            className={`earning ${
                              transaction.isSubtract ? "subtract" : ""
                            }`}
                          >
                            {transaction.earning}
                          </td>
                          <td className="action">
                            <Link href="/dashboard/invoice">view</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="pagination-area pagination-area2">
                    <nav className="navigation pagination" role="navigation">
                      <div className="nav-links">
                        <Link className="prev page-numbers" href="#">
                          <span className="lnr lnr-arrow-left"></span>
                        </Link>
                        <Link className="page-numbers current" href="#">
                          1
                        </Link>
                        <Link className="page-numbers" href="#">
                          2
                        </Link>
                        <Link className="page-numbers" href="#">
                          3
                        </Link>
                        <Link className="next page-numbers" href="#">
                          <span className="lnr lnr-arrow-right"></span>
                        </Link>
                      </div>
                    </nav>
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
