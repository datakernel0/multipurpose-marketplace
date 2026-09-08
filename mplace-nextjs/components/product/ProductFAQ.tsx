"use client"

import { useState } from "react"

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "How to write the changelog for theme updates?",
    answer:
      "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
  },
  {
    id: "2",
    question: "Why do I need to login to purchase an item on DigiPro?",
    answer:
      "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
  },
  {
    id: "3",
    question: "How to create an account on DigiPro?",
    answer:
      "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
  },
  {
    id: "4",
    question: "How to write the changelog for theme updates?",
    answer:
      "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
  },
  {
    id: "5",
    question: "Do you recommend using a download manager software?",
    answer:
      "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
  },
  {
    id: "6",
    question: "How to purchase an item on DigiPro?",
    answer:
      "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
  },
]

export default function ProductFAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  return (
    <div className="tab-content-wrapper">
      <div className="panel-group accordion" role="tablist" id="accordion">
        {faqItems.map((item) => {
          const panelId = `panel-${item.id}`
          const collapseId = `collapse${item.id}`
          const isOpen = openItems.has(item.id)
          return (
            <div className="panel accordion__single" id={panelId} key={item.id}>
              <div className="single_acco_title">
                <h4>
                  <a
                    href={`#${collapseId}`}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleItem(item.id)
                    }}
                    aria-expanded={isOpen}
                    aria-controls={collapseId}
                    className={isOpen ? "" : "collapsed"}
                  >
                    <span>{item.question}</span>
                    <i className={`lnr lnr-chevron-${isOpen ? "up" : "down"} indicator`}></i>
                  </a>
                </h4>
              </div>
              <div
                id={collapseId}
                className={`panel-collapse collapse ${isOpen ? "show" : ""}`}
                aria-labelledby={panelId}
              >
                <div className="acco_body">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

