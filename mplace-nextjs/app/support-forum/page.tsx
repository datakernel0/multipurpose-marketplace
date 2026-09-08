"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Image from "next/image"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"

interface ForumThread {
  id: string
  slug?: string
  title: string
  author: string
  authorAvatar: string
  timeAgo: string
  tag: string
  isPinned?: boolean
  isResolved?: boolean
  isClosed?: boolean
  lastAnswerAvatar: string
  lastAnswerTime: string
  votes: number
  replies: number
}

export default function SupportForumPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [threads, setThreads] = useState<ForumThread[]>([])

  useEffect(() => {
    async function fetchThreads() {
      try {
        const response = await fetch("/api/forum")
        const data = await response.json()
        
        // Helper function to format time ago
        const formatTimeAgo = (date: Date) => {
          const now = new Date()
          const diff = now.getTime() - new Date(date).getTime()
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const days = Math.floor(hours / 24)
          
          if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
          if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
          return 'Just now'
        }

        setThreads(
          data.map((thread: any) => ({
            id: thread.id,
            slug: thread.slug,
            title: thread.title,
            author: thread.author?.name || 'Unknown',
            authorAvatar: thread.author?.image || "/images/support_avat1.png",
            timeAgo: formatTimeAgo(thread.createdAt),
            tag: thread.tag,
            isPinned: thread.isPinned,
            isResolved: thread.isResolved,
            lastAnswerAvatar: thread.lastAnswerUser?.image || "/images/support_avat4.png",
            lastAnswerTime: thread.lastAnswerTime ? formatTimeAgo(thread.lastAnswerTime) : 'No answers',
            votes: thread.votes,
            replies: thread._count?.replies || 0,
          }))
        )
      } catch (error: any) {
        setThreads([])
      }
    }
    fetchThreads()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search
  }

  return (
    <div className="preload support-forum-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Support Forum" paths={[{ name: "Forum", link: "/support-forum" }]} />
      <section className="support_threads_area section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="support_threads">
                <div className="thread_sort_area clearfix">
                  <div className="sort_options">
                    <ul>
                      {["all", "open", "resolved", "closed", "unanswered"].map((filter) => (
                        <li key={filter} className={activeFilter === filter ? "active" : ""}>
                          <a href="#" onClick={(e) => {
                            e.preventDefault()
                            setActiveFilter(filter)
                          }}>
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="thread_search_area">
                    <form action="#" onSubmit={handleSearch}>
                      <div className="searc-wrap">
                        <input
                          type="text"
                          placeholder="Search forum"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="search-wrap__btn">
                          <span className="lnr lnr-magnifier"></span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="support_thread_list cardify">
                  {threads.map((thread) => (
                    <div key={thread.id} className="support_thread--single">
                      <div className="support_thread_info">
                        <Link href={`/support-forum/detail/${thread.slug || thread.id}`} className="support_title">
                          {thread.title}
                          {thread.isPinned && <span className="pinned">Pinned</span>}
                          {thread.isResolved && <span className="solved">resolved</span>}
                          {thread.isClosed && <span className="closed">Closed</span>}
                        </Link>
                        <div className="suppot_query_tag">
                          <Link href="#" className="user">
                            <Image
                              className="poster_avatar"
                              src={withBasePath(thread.authorAvatar)}
                              alt="Support Avatar"
                              width={30}
                              height={30}
                            />{" "}
                            {thread.author}{" "}
                          </Link>
                          <span>{thread.timeAgo}</span>
                          <span className="support_tag">{thread.tag}</span>
                        </div>
                      </div>

                      <div className="support_thread_meta">
                        <ul>
                          <li className="answer_time">
                            <Image
                              src={withBasePath(thread.lastAnswerAvatar)}
                              alt="Support images"
                              width={30}
                              height={30}
                            />
                            <span className="time">{thread.lastAnswerTime}</span>
                          </li>
                          <li>
                            <p className="number">{thread.votes}</p>
                            <span>votes</span>
                          </li>
                          <li>
                            <p className="number">{thread.replies}</p>
                            <span>replies</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <aside className="sidebar support--sidebar">
                <Link href="/login" className="login_promot">
                  <span className="lnr lnr-lock"></span>Login to Ask a Question
                </Link>

                <div className="sidebar-card card--forum_categories">
                  <div className="card-title">
                    <h4>Forum Categories</h4>
                  </div>
                  <div className="collapsible-content">
                    <ul className="card-content">
                      {[
                        { name: "Wordpress", count: 35 },
                        { name: "Support Center", count: 45 },
                        { name: "General Topics", count: 13 },
                        { name: "Pre-Sales", count: 8 },
                        { name: "Purchases", count: 34 },
                        { name: "Billing", count: 78 },
                        { name: "Testimonials", count: 26 },
                      ].map((category) => (
                        <li key={category.name}>
                          <Link href="#">
                            <span className="lnr lnr-chevron-right"></span>
                            {category.name}
                            <span className="item-count">{category.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="sidebar-card card--top_discussion">
                  <div className="card-title">
                    <h4>Top Discussions</h4>
                  </div>
                  <div className="collapsible-content">
                    <ul className="card-content">
                      {[
                        "Commissions Transfer Problem ( 12h )",
                        "Dashboard not updating ( 9h )",
                        "AdminPro ( 2d )",
                        "Bill required after purchase ( 3d )",
                        "How to install the theme? ( 7d )",
                        "Contact Form not Working ( 9d )",
                      ].map((discussion, index) => (
                        <li key={index}>
                          <Link href="#">
                            <span></span>
                            {discussion}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>
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

