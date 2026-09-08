import Link from "next/link"
import { withBasePath } from "@/utils/paths"

export default function LatestNewsSection() {
  const newsItems = [
    {
      id: 1,
      thumbnail: withBasePath("/images/news1.png"),
      title: "Web Design Trends in 2019",
      description: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
      date: "24 Feb 2019",
      comments: 45,
      views: 345,
    },
    {
      id: 2,
      thumbnail: withBasePath("/images/news2.png"),
      title: "The best advices to start your own project",
      description: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
      date: "15 Mar 2019",
      comments: 45,
      views: 345,
    },
    {
      id: 3,
      thumbnail: withBasePath("/images/news1.png"),
      title: "Best Tomato Sauce in town",
      description: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
      date: "20 Dec 2016",
      comments: 45,
      views: 345,
    },
  ]

  return (
    <section className="latest-news section--padding">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="section-title">
              <h1>
                Latest <span className="highlighted">News</span>
              </h1>
              <p>
                Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid est laborum
                dolo rumes fugats untras.
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          {newsItems.map((news) => (
            <div key={news.id} className="col-lg-4 col-md-6">
              <div className="news">
                <div className="news__thumbnail">
                  <img src={news.thumbnail} alt="News Thumbnail" />
                </div>
                <div className="news__content">
                  <Link href="#" className="news-title">
                    <h4>{news.title}</h4>
                  </Link>
                  <p>{news.description}</p>
                </div>
                <div className="news__meta">
                  <div className="date">
                    <span className="lnr lnr-clock"></span>
                    <p>{news.date}</p>
                  </div>

                  <div className="other">
                    <ul>
                      <li>
                        <span className="lnr lnr-bubble"></span>
                        <span>{news.comments}</span>
                      </li>
                      <li>
                        <span className="lnr lnr-eye"></span>
                        <span>{news.views}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

