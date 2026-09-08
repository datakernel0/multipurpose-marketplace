import Link from "next/link"
import Image from "next/image"
import type { ReactNode } from "react"

import { withBasePath } from "@/utils/paths"

export type AuthorSidebarTab = "profile" | "items" | "reviews" | "followers" | "following"

export interface AuthorSidebarAuthor {
  id: string
  name: string
  username?: string | null
  avatar: string
  signedUp: string
  followers: number
  following: number
  badges: Array<{ icon: string; title: string }>
  facebookUrl?: string | null
  twitterUrl?: string | null
  dribbbleUrl?: string | null
  viewerIsAuthor?: boolean
  viewerFollowsAuthor?: boolean
}

export interface AuthorSidebarFollowButton {
  label: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
}

interface AuthorSidebarProps {
  author: AuthorSidebarAuthor | null
  activeTab: AuthorSidebarTab
  followButton?: AuthorSidebarFollowButton
  children?: ReactNode
}

export function AuthorSidebar({ author, activeTab, followButton, children }: AuthorSidebarProps) {
  const usernameOrId = author?.username || author?.id || ""

  const buildLink = (path: "profile" | "items" | "reviews" | "followers" | "following") => {
    const encoded = usernameOrId ? encodeURIComponent(usernameOrId) : null
    switch (path) {
      case "profile":
        return encoded ? `/author?username=${encoded}` : "/author"
      case "items":
        return encoded ? `/author/items?username=${encoded}` : "/author/items"
      case "reviews":
        return encoded ? `/author/reviews?username=${encoded}` : "/author/reviews"
      case "followers":
        return encoded ? `/author/followers?username=${encoded}` : "/author/followers"
      case "following":
        return encoded ? `/author/following?username=${encoded}` : "/author/following"
      default:
        return "/author"
    }
  }

  const followButtonLabel = followButton?.loading ? "Updating..." : followButton?.label
  const followButtonDisabled = followButton?.disabled || followButton?.loading

  return (
    <aside className="sidebar sidebar_author">
      <div className="author-card sidebar-card">
        <div className="author-infos">
          <div className="author_avatar">
            <Image
              src={withBasePath(author?.avatar || "/images/author-avatar.jpg")}
              alt={author?.name || "Author"}
              width={150}
              height={150}
            />
          </div>

          <div className="author">
            <h4>{author?.name || "Author"}</h4>
            <p>Signed Up: {author?.signedUp || "Unknown"}</p>
          </div>

          <div className="author-badges">
            <ul className="list-unstyled">
              {(author?.badges || []).map((badge, index) => (
                <li key={`${badge.icon}-${badge.title}-${index}`}>
                  <span title={badge.title}>
                    <Image src={withBasePath(badge.icon)} alt={badge.title} className="svg" width={30} height={30} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="social social--color--filled">
            <ul>
              <li>
                <Link href={author?.facebookUrl || "#"} aria-disabled={!author?.facebookUrl}>
                  <span className="fa fa-facebook"></span>
                </Link>
              </li>
              <li>
                <Link href={author?.twitterUrl || "#"} aria-disabled={!author?.twitterUrl}>
                  <span className="fa fa-twitter"></span>
                </Link>
              </li>
              <li>
                <Link href={author?.dribbbleUrl || "#"} aria-disabled={!author?.dribbbleUrl}>
                  <span className="fa fa-dribbble"></span>
                </Link>
              </li>
            </ul>
          </div>

          {followButton && (
            <div className="author-btn">
              <button
                type="button"
                className={`btn btn--md btn--round${author?.viewerFollowsAuthor ? " btn--secondary" : ""}`}
                onClick={followButton.onClick}
                disabled={followButtonDisabled}
              >
                {followButtonLabel}
              </button>
            </div>
          )}

          
        </div>
      </div>

      <div className="sidebar-card author-menu">
        <ul>
          <li>
            <Link href={buildLink("profile")} className={activeTab === "profile" ? "active" : undefined}>
              Profile
            </Link>
          </li>
          <li>
            <Link href={buildLink("items")} className={activeTab === "items" ? "active" : undefined}>
              Author Items
            </Link>
          </li>
          <li>
            <Link href={buildLink("reviews")} className={activeTab === "reviews" ? "active" : undefined}>
              Customer Reviews
            </Link>
          </li>
          <li>
            <Link href={buildLink("followers")} className={activeTab === "followers" ? "active" : undefined}>
              Followers ({author?.followers ?? 0})
            </Link>
          </li>
          <li>
            <Link href={buildLink("following")} className={activeTab === "following" ? "active" : undefined}>
              Following ({author?.following ?? 0})
            </Link>
          </li>
        </ul>
      </div>

      {children}
    </aside>
  )
}

