import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import { withBasePath } from "@/utils/paths"
import { prisma } from "@/lib/prisma"

async function getBadges() {
  try {
    const authorRankBadges = await prisma.badge.findMany({
      where: { type: "author_rank" },
      orderBy: { order: "asc" },
    })

    const moreBadges = await prisma.badge.findMany({
      where: { type: "more" },
      orderBy: { order: "asc" },
    })

    return { authorRankBadges, moreBadges }
  } catch (error: any) {
    return { authorRankBadges: [], moreBadges: [] }
  }
}

export default async function BadgesPage() {
  const { authorRankBadges, moreBadges } = await getBadges()

  return (
    <div className="preload badges-page">
      <Preloader />
      <Header />
      <Breadcrumb paths={[{ name: "Home", link: "/" }, { name: "Badges", link: "/badges" }]} pageTitle="Badges" />
      <section className="badges author-rank">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>Author Rank</h1>
                <p>
                  Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid est laborum dolo rumes fugats
                  untras.
                </p>
              </div>
              <div className="author-badges">
                {authorRankBadges.map((badge) => (
                  <div key={badge.id} className="badge-single">
                    {badge.image ? (
                      <img src={withBasePath(badge.image)} alt="" className="svg" />
                    ) : badge.icon ? (
                      <span className={`lnr ${badge.icon} svg`}></span>
                    ) : null}
                    <h3>{badge.name}</h3>
                    <p>{badge.description || ""}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="badges community-badges">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>More Badges</h1>
                <p>
                  Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid est laborum dolo rumes fugats
                  untras.
                </p>
              </div>
              <div className="author-badges">
                {moreBadges.map((badge) => (
                  <div key={badge.id} className="badge-single">
                    {badge.image ? (
                      <img src={withBasePath(badge.image)} alt="" className="svg" />
                    ) : badge.icon ? (
                      <span className={`lnr ${badge.icon} svg`}></span>
                    ) : null}
                    <h3>{badge.name}</h3>
                    <p>{badge.description || ""}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="badges community-badges bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>Badges Locked</h1>
                <p>
                  Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid est laborum dolo rumes fugats
                  untras.
                </p>
              </div>
              <div className="author-badges">
                {moreBadges.map((badge) => (
                  <div key={badge.id} className="badge-single">
                    <div className="svg_wrapper">
                      {badge.image ? (
                        <img src={withBasePath(badge.image)} alt="" className="svg locked" />
                      ) : badge.icon ? (
                        <span className={`lnr ${badge.icon} svg locked`}></span>
                      ) : null}
                      <span className="fa fa-lock" aria-hidden="true"></span>
                    </div>
                    <h3>{badge.name}</h3>
                    <p>{badge.description || ""}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

