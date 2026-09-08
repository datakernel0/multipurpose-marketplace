"use client"

import Link from "next/link"
import { withBasePath } from "@/utils/paths"
import { useBackgroundImages } from "@/hooks/useBackgroundImage"

interface SearchProductSearchAreaProps {
  searchTerm: string
  resultCount: number
  loading: boolean
}

export default function SearchProductSearchArea({ searchTerm, resultCount, loading }: SearchProductSearchAreaProps) {
  // Replace jQuery behavior with React hook
  useBackgroundImages(".search-area2 .bg_image_holder")

  const keywordText =
    searchTerm.trim().length > 0 ? (
      <>
        based on the keyword <span>&quot;{searchTerm}&quot;</span>
      </>
    ) : (
      "in total"
    )

  return (
    <section className="search-wrapper">
      <div className="search-area2 bgimage">
        <div className="bg_image_holder">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBasePath("/images/search.jpg")} alt="" />
        </div>
        <div className="container content_above">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="search">
                <div className="search__title">
                  {loading ? (
                    <h3>Searching products&hellip;</h3>
                  ) : (
                    <h3>
                      <span>{resultCount}</span> Following results found {keywordText}
                    </h3>
                  )}
                </div>
                <div className="search__field">
                  <form action={withBasePath("/search-product")} method="get">
                    <div className="field-wrapper">
                      <input
                        key={searchTerm}
                        className="relative-field rounded"
                        type="text"
                        name="q"
                        placeholder="Search your products"
                        defaultValue={searchTerm}
                      />
                      <button className="btn btn--round" type="submit">
                        Search
                      </button>
                    </div>
                  </form>
                </div>
                <div className="breadcrumb">
                  <ul>
                    <li>
                      <Link href={withBasePath("/")}>Home</Link>
                    </li>
                    <li className="active">
                      <Link href={withBasePath("/search-product")}>Search Page</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

