import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import CountdownTimer from "@/components/common/CountdownTimer"
import Image from "next/image"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"
import { prisma } from "@/lib/prisma"

async function getEvents() {
  try {
    const featuredEvent = await prisma.event.findFirst({
      where: { featured: true },
      include: {
        speakers: {
          take: 3,
        },
      },
    })

    const otherEvents = await prisma.event.findMany({
      where: { featured: false },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { featuredEvent, otherEvents }
  } catch (error: any) {
    return { featuredEvent: null, otherEvents: [] }
  }
}

export default async function EventPage() {
  const { featuredEvent, otherEvents } = await getEvents()

  return (
    <div className="preload event-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Our Events" paths={[{ name: "Events", link: "/event" }]} />
      <section className="event_area section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="featured_event">
                <div className="row align-items-center">
                  <div className="col-lg-6">
                    <div className="event_img">
                      <Image src={withBasePath("/images/ev1.jpg")} alt="event thumbnail" width={600} height={400} />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="featured_event_detail">
                      <h1>{featuredEvent?.title || "MartPlace Upcoming Event"}</h1>
                      <ul className="date_place">
                        <li>
                          <span className="lnr lnr-calendar-full"></span>
                          <p>{featuredEvent?.date || "May 17-19, 2019"}</p>
                        </li>
                        <li>
                          <span className="lnr lnr-map-marker"></span>
                          <p>{featuredEvent?.location || "Dhaka, Bangladesh"}</p>
                        </li>
                      </ul>
                      {featuredEvent?.targetDate && <CountdownTimer targetDate={featuredEvent.targetDate} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {otherEvents.map((event) => (
              <div key={event.id} className="col-lg-4 col-md-6">
                <div className="card_style1">
                  <figure className="card_style1__info">
                    <Image src={withBasePath(event.image)} alt="Event card thumbnail" width={400} height={300} />
                    <figcaption>
                      <Link href={`/event/detail/${event.slug}`}>
                        <h3>{event.title}</h3>
                      </Link>
                      <ul className="date_place">
                        <li>
                          <span className="lnr lnr-calendar-full"></span>
                          <p>{event.date}</p>
                        </li>
                        <li>
                          <span className="lnr lnr-map-marker"></span>
                          <p>{event.location}</p>
                        </li>
                      </ul>
                    </figcaption>
                  </figure>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

