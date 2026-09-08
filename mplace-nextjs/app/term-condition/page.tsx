import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import { prisma } from "@/lib/prisma"

async function getTerms() {
  try {
    return await prisma.termCondition.findMany({
      orderBy: {
        order: "asc",
      },
    })
  } catch (error: any) {
    return []
  }
}

export default async function TermConditionPage() {
  const terms = await getTerms()

  return (
    <div className="preload term-condition-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Terms & Conditions" paths={[{ name: "Terms & Conditions", link: "/term-condition" }]} />
      <section className="term_condition_area">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="cardify term_modules">
                {terms.map((term) => (
                  <div key={term.id} className="term">
                    <div className="term__title">
                      <h4>{term.title}</h4>
                    </div>
                    <p>{term.content}</p>
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
