"use client"

import { useEffect, useRef, useState } from "react"
import { useCounter } from "@/hooks/useCounter"
import { withBasePath } from "@/utils/paths"

export default function CounterUpSection() {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldAnimate) {
            setShouldAnimate(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [shouldAnimate])

  const itemsCount = useCounter({ endValue: 38436, time: 2000, delay: 10, enabled: shouldAnimate })
  const totalSales = useCounter({ endValue: 38436, time: 2000, delay: 10, enabled: shouldAnimate })
  const happyCustomers = useCounter({ endValue: 38436, time: 2000, delay: 10, enabled: shouldAnimate })
  const members = useCounter({ endValue: 38436, time: 2000, delay: 10, enabled: shouldAnimate })

  const bgImage = withBasePath("/images/countbg.jpg")

  return (
    <section className="counter-up-area bgimage" ref={sectionRef}>
      <div
        className="bg_image_holder"
        style={{
          backgroundImage: `url(${bgImage})`,
          opacity: 1,
        }}
      >
        <img src={bgImage} alt="Counter background" />
      </div>
      <div className="container content_above">
        <div className="col-md-12">
          <div className="counter-up">
            <div className="counter mcolor2">
              <span className="lnr lnr-briefcase"></span>
              <span className="count">{itemsCount.toLocaleString()}</span>
              <p>items for sale</p>
            </div>
            <div className="counter mcolor3">
              <span className="lnr lnr-cloud-download"></span>
              <span className="count">{totalSales.toLocaleString()}</span>
              <p>total Sales</p>
            </div>
            <div className="counter mcolor1">
              <span className="lnr lnr-smile"></span>
              <span className="count">{happyCustomers.toLocaleString()}</span>
              <p>appy customers</p>
            </div>
            <div className="counter mcolor4">
              <span className="lnr lnr-users"></span>
              <span className="count">{members.toLocaleString()}</span>
              <p>members</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

