"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { getApiUrl, withBasePath } from "@/utils/paths"
import { getSocket } from "@/lib/socketClient"
import MarketplaceNav from "@/components/MarketplaceNav"

// Inner component that uses useSearchParams - must be wrapped in Suspense
function HeaderContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [offcanvasOpen, setOffcanvasOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [openMenuDropdowns, setOpenMenuDropdowns] = useState<Set<string>>(new Set())
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const menuDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  
  // Check if device is mobile/touch - only set after hydration to avoid mismatch
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [headerMessages, setHeaderMessages] = useState<
    Array<{
      id: string
      partnerName: string
      partnerAvatar: string
      preview: string
      time: string
      hasUnread: boolean
      link: string
    }>
  >([])
  const [messageUnreadTotal, setMessageUnreadTotal] = useState(0)
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)
  const [saleBalance, setSaleBalance] = useState<{ earned: number; available: number } | null>(null)
  const [saleBalanceLoading, setSaleBalanceLoading] = useState(false)
  type CartPreviewItem = {
    productId: string
    title: string
    slug: string
    image: string
    category: { name: string; icon: string } | null
    price: number
    salePrice: number | null
    effectivePrice: number
    quantity: number
  }
  const [cartPreview, setCartPreview] = useState<{
    items: CartPreviewItem[]
    subtotal: number
    totalItems: number
  }>({ items: [], subtotal: 0, totalItems: 0 })
  const [cartLoading, setCartLoading] = useState(false)
  const [cartRemovingId, setCartRemovingId] = useState<string | null>(null)
  const [cartError, setCartError] = useState<string>("")
  const [headerNotifications, setHeaderNotifications] = useState<
    Array<{
      id: string
      title: string
      message: string
      type: string
      read: boolean
      link: string | null
      createdAt: string
    }>
  >([])
  const [notificationUnreadTotal, setNotificationUnreadTotal] = useState(0)

  const normalizeAvatar = useCallback((image: string | null | undefined) => {
    if (!image) {
      return withBasePath("/images/notification_head4.png")
    }
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image
    }
    return withBasePath(image.startsWith("/") ? image : `/${image}`)
  }, [])

  const computePreview = useCallback((content: string, attachmentsCount: number) => {
    const trimmed = (content || "").trim()
    if (trimmed.length > 0) {
      return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed
    }
    if (attachmentsCount > 0) {
      return attachmentsCount === 1 ? "Sent an attachment" : `Sent ${attachmentsCount} attachments`
    }
    return "No message content"
  }, [])

  const getFirstWord = useCallback((value?: string | null) => {
    const trimmed = (value ?? "").trim()
    if (!trimmed) {
      return value ?? ""
    }
    const [firstWord] = trimmed.split(/\s+/)
    return firstWord || trimmed
  }, [])

  const formatTime = useCallback((isoString: string) => {
    if (!isoString) return ""
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) {
      return ""
    }

    const diffMs = Date.now() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }, [])

  // Helper function to check if a menu item should be active
  const isMenuItemActive = useCallback((href: string, submenuHrefs?: string[]) => {
    if (!pathname) return false
    
    // Normalize pathname by removing query params and hash
    const normalizedPathname = pathname.split('?')[0].split('#')[0]
    
    // Helper to normalize href
    const normalizeHref = (h: string) => {
      if (h === '#' || h === '') return null
      const normalized = h.startsWith('/') ? h : `/${h}`
      return normalized.split('?')[0].split('#')[0]
    }
    
    // Check main href
    const normalizedHref = normalizeHref(href)
    if (normalizedHref) {
      // Exact match
      if (normalizedPathname === normalizedHref || normalizedPathname === withBasePath(normalizedHref)) return true
      // For home page, check if pathname is exactly base path or root
      if (normalizedHref === '/' && (normalizedPathname === '/' || normalizedPathname === withBasePath('/'))) return true
      // Check if pathname starts with href (for nested routes, but not for root)
      if (normalizedHref !== '/' && (normalizedPathname.startsWith(normalizedHref) || normalizedPathname.startsWith(withBasePath(normalizedHref)))) return true
    }
    
    // Check submenu items
    if (submenuHrefs) {
      return submenuHrefs.some(subHref => {
        const normalizedSubHref = normalizeHref(subHref)
        if (!normalizedSubHref) return false
        // Exact match
        if (normalizedPathname === normalizedSubHref || normalizedPathname === withBasePath(normalizedSubHref)) return true
        // For home page submenu
        if (normalizedSubHref === '/' && (normalizedPathname === '/' || normalizedPathname === withBasePath('/'))) return true
        // Check if pathname starts with submenu href (for nested routes)
        if (normalizedSubHref !== '/' && (normalizedPathname.startsWith(normalizedSubHref) || normalizedPathname.startsWith(withBasePath(normalizedSubHref)))) return true
        return false
      })
    }
    return false
  }, [pathname])
  
  useEffect(() => {
    // Mark as mounted to avoid hydration mismatch
    setIsMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sync React state with DOM classes for menu dropdowns
  useEffect(() => {
    const menuKeys = ['home', 'allProduct', 'categories', 'elements', 'pages', 'blogs']
    menuKeys.forEach((key) => {
      const dropdown = menuDropdownRefs.current[key]
      if (dropdown) {
        if (openMenuDropdowns.has(key)) {
          dropdown.classList.add('show')
        } else {
          dropdown.classList.remove('show')
        }
      }
    })
  }, [openMenuDropdowns])

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      Object.keys(dropdownRefs.current).forEach((key) => {
        const ref = dropdownRefs.current[key]
        if (ref && !ref.contains(target) && !target.closest(`.has_dropdown:has([data-dropdown="${key}"])`)) {
          ref.classList.remove("show")
        }
      })
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  useEffect(() => {
    // Close mobile menu when clicking outside
    if (!isMobile || !mobileMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const navbar = document.querySelector('.navbar-collapse')
      const toggler = document.querySelector('.navbar-toggler')
      if (navbar && !navbar.contains(target) && toggler && !toggler.contains(target)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isMobile, mobileMenuOpen])

  const fetchHeaderMessages = useCallback(
    async (abortSignal?: AbortSignal) => {
    if (!session?.user?.id) {
      setHeaderMessages([])
      setMessageUnreadTotal(0)
      return
    }

    try {
      const response = await fetch(getApiUrl("/api/messages/chats?limit=5"), {
        cache: "no-store",
        signal: abortSignal,
      })

      if (!response.ok) {
        throw new Error("Failed to load messages")
      }

      const data: {
        chats?: Array<{
          id: string
          partner: {
            id: string
            name: string | null
            username: string | null
            email: string | null
            image: string | null
          }
          lastMessage: {
            id: string
            content: string | null
            createdAt: string
            senderId: string
            receiverId: string
            read: boolean
            attachmentsCount?: number
          } | null
          unreadCount: number
          updatedAt: string
        }>
        unreadTotal?: number
      } = await response.json()

      const chats = data.chats ?? []

      const formatted = chats.map((chat) => {
        const last = chat.lastMessage
        const partnerName = chat.partner.name || chat.partner.username || "Unknown"
        const partnerAvatar = normalizeAvatar(chat.partner.image)
        const preview = computePreview(last?.content ?? "", last?.attachmentsCount ?? 0)
        const time = formatTime(last?.createdAt ?? chat.updatedAt)
        const hasUnread = chat.unreadCount > 0

        return {
          id: chat.id,
          partnerName,
          partnerAvatar,
          preview,
          time,
          hasUnread,
          link: `/message?chat=${chat.id}`,
        }
      })

      setHeaderMessages(formatted)
      setMessageUnreadTotal(data.unreadTotal ?? 0)
    } catch (error) {
      if ((error as any)?.name === "AbortError") return
    }
  }, [session?.user?.id, computePreview, normalizeAvatar])

  const fetchCartPreview = useCallback(async (abortSignal?: AbortSignal) => {
    if (!session?.user?.id) {
      setCartPreview({ items: [], subtotal: 0, totalItems: 0 })
      return
    }

    try {
      if (!abortSignal) {
        setCartError("")
      }
      if (!abortSignal) {
        setCartLoading(true)
      }
      const response = await fetch(getApiUrl("/api/cart?summary=1"), {
        cache: "no-store",
        credentials: "include",
        signal: abortSignal,
      })

      if (!response.ok) {
        throw new Error("Failed to load cart")
      }

      const data = await response.json()
      const items: CartPreviewItem[] = (data.items || []).map((item: any) => ({
        productId: item.productId,
        title: getFirstWord(item.title),
        slug: item.slug,
        image: item.image || "/images/p1.jpg",
        category: item.category || null,
        price: Number(item.price) || 0,
        salePrice: item.salePrice !== null ? Number(item.salePrice) : null,
        effectivePrice: Number(item.effectivePrice) || Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      }))

      setCartPreview({
        items,
        subtotal: Number(data.subtotal) || 0,
        totalItems: Number(data.totalItems) || 0,
      })
    } catch (error) {
      if ((error as any)?.name === "AbortError") return
      setCartPreview({ items: [], subtotal: 0, totalItems: 0 })
    } finally {
      if (!abortSignal) {
        setCartLoading(false)
      }
    }
  }, [session?.user?.id, getFirstWord])

  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString("en-US", { style: "currency", currency: "USD" })
  }, [])

  const fetchSaleBalance = useCallback(async () => {
    if (!session?.user?.id) {
      setSaleBalance(null)
      return
    }

    try {
      setSaleBalanceLoading(true)
      const response = await fetch(getApiUrl("/api/dashboard/sales/balance"), {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to load sale balance")
      }

      const data = await response.json()
      setSaleBalance({
        earned: Number(data.monthly?.saleBalance ?? data.saleBalance ?? 0),
        available: Number(data.saleBalanceAvailable ?? 0),
      })
    } catch (error) {
      setSaleBalance(null)
    } finally {
      setSaleBalanceLoading(false)
    }
  }, [session?.user?.id])

  const headerNotificationAvatars = useMemo(
    () => [
      withBasePath("/images/notification_head.png"),
      withBasePath("/images/notification_head2.png"),
      withBasePath("/images/notification_head3.png"),
      withBasePath("/images/notification_head4.png"),
    ],
    [],
  )

  const formatRelativeTime = useCallback((isoDate: string) => {
    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) return "Just now"

    const diff = Date.now() - date.getTime()
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const month = 30 * day
    const year = 12 * month

    if (diff < minute) return "Just now"
    if (diff < hour) {
      const value = Math.floor(diff / minute)
      return `${value} minute${value === 1 ? "" : "s"} ago`
    }
    if (diff < day) {
      const value = Math.floor(diff / hour)
      return `${value} hour${value === 1 ? "" : "s"} ago`
    }
    if (diff < month) {
      const value = Math.floor(diff / day)
      return `${value} day${value === 1 ? "" : "s"} ago`
    }
    if (diff < year) {
      const value = Math.floor(diff / month)
      return `${value} month${value === 1 ? "" : "s"} ago`
    }
    const value = Math.floor(diff / year)
    return `${value} year${value === 1 ? "" : "s"} ago`
  }, [])

  const parseNotificationDisplay = useCallback(
    (
      notification: {
        title: string
        message: string
        link: string | null
        createdAt: string
      },
      index: number,
    ) => {
      let actorName = notification.title || "Notification"
      let actionText = ""
      let targetName = ""
      let targetLink: string | null = notification.link || null
      let avatar = headerNotificationAvatars[index % headerNotificationAvatars.length]
      let timeLabel = formatRelativeTime(notification.createdAt)

      if (notification.message) {
        try {
          const parsed = JSON.parse(notification.message)
          if (parsed && typeof parsed === "object") {
            if (typeof parsed.actorName === "string" && parsed.actorName.trim()) {
              actorName = parsed.actorName.trim()
            }
            if (typeof parsed.action === "string") {
              actionText = parsed.action.trim()
            }
            if (typeof parsed.targetName === "string") {
              targetName = parsed.targetName.trim()
            }
            if (typeof parsed.targetLink === "string" && parsed.targetLink.trim()) {
              targetLink = parsed.targetLink.trim()
            }
            if (typeof parsed.avatar === "string" && parsed.avatar.trim()) {
              avatar = normalizeAvatar(parsed.avatar.trim())
            }
            if (typeof parsed.timeLabel === "string" && parsed.timeLabel.trim()) {
              timeLabel = parsed.timeLabel.trim()
            }
          }
        } catch (error) {
          // message is not JSON – fall back to plain string
        }
      }

      if (!actionText) {
        actionText = notification.message || ""
      }

      if (!targetName && notification.link) {
        targetName = "View details"
      }

      return { actorName, actionText, targetName, targetLink, avatar, timeLabel }
    },
    [headerNotificationAvatars, formatRelativeTime, normalizeAvatar],
  )

  const fetchHeaderNotifications = useCallback(async () => {
    if (!session?.user?.id) {
      setHeaderNotifications([])
      setNotificationUnreadTotal(0)
      return
    }

    try {
      const response = await fetch(getApiUrl("/api/notifications?limit=5"), {
        cache: "no-store",
        credentials: "include",
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load notifications")
      }

      const notifications = Array.isArray(data.notifications) ? data.notifications : []
      setHeaderNotifications(
        notifications.map((notification: any) => ({
          id: notification.id,
          title: notification.title || "Notification",
          message: notification.message || "",
          type: notification.type || "",
          read: Boolean(notification.read),
          link: notification.link || null,
          createdAt: notification.createdAt || new Date().toISOString(),
        })),
      )
      setNotificationUnreadTotal(Number(data.unreadCount || notifications.length))
    } catch (error) {
      setHeaderNotifications([])
      setNotificationUnreadTotal(0)
    }
  }, [session?.user?.id])
 
  useEffect(() => {
    const controller = new AbortController()
    void fetchHeaderMessages(controller.signal)
 
    return () => controller.abort()
  }, [fetchHeaderMessages])

  useEffect(() => {
    void fetchSaleBalance()
  }, [fetchSaleBalance])

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleCreditsUpdate = () => {
      void fetchSaleBalance()
    }
    window.addEventListener("credits:update", handleCreditsUpdate)
    window.addEventListener("salesBalance:update", handleCreditsUpdate)
    return () => {
      window.removeEventListener("credits:update", handleCreditsUpdate)
      window.removeEventListener("salesBalance:update", handleCreditsUpdate)
    }
  }, [fetchSaleBalance])
 
  useEffect(() => {
    const handleMessagesUpdate = () => {
      void fetchHeaderMessages()
    }

    window.addEventListener("messages:update", handleMessagesUpdate)
    return () => {
      window.removeEventListener("messages:update", handleMessagesUpdate)
    }
  }, [fetchHeaderMessages])

  useEffect(() => {
    if (!session?.user?.id) {
      return
    }

    const socket = getSocket()
    socketRef.current = socket

    socket.emit("user:join", session.user.id)

    const handleNewMessage = () => {
      void fetchHeaderMessages()
      void fetchHeaderNotifications()
    }

    socket.on("message:new", handleNewMessage)

    return () => {
      socket.off("message:new", handleNewMessage)
    }
  }, [session?.user?.id, fetchHeaderMessages, fetchHeaderNotifications])

  useEffect(() => {
    const controller = new AbortController()
    void fetchCartPreview(controller.signal)
    return () => controller.abort()
  }, [fetchCartPreview])

  useEffect(() => {
    const handleCartUpdate = () => {
      void fetchCartPreview()
    }
    window.addEventListener("cart:update", handleCartUpdate)
    return () => window.removeEventListener("cart:update", handleCartUpdate)
  }, [fetchCartPreview])

  useEffect(() => {
    void fetchHeaderNotifications()
  }, [fetchHeaderNotifications])

  useEffect(() => {
    const handleNotificationsUpdate = () => {
      void fetchHeaderNotifications()
    }
    window.addEventListener("notifications:update", handleNotificationsUpdate)
    return () => window.removeEventListener("notifications:update", handleNotificationsUpdate)
  }, [fetchHeaderNotifications])

  const toggleDropdown = (key: string) => {
    const dropdown = dropdownRefs.current[key]
    if (dropdown) {
      // Close other dropdowns
      Object.keys(dropdownRefs.current).forEach((k) => {
        if (k !== key && dropdownRefs.current[k]) {
          dropdownRefs.current[k]?.classList.remove("show")
        }
      })
      const willOpen = !dropdown.classList.contains("show")
      dropdown.classList.toggle("show")
      if (key === "cart" && willOpen) {
        void fetchCartPreview()
      }
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length === 0) return
    router.push(`${withBasePath("/search-product")}?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleRemoveCartItem = async (productId: string) => {
    try {
      setCartRemovingId(productId)
      setCartError("")
      const response = await fetch(getApiUrl(`/api/cart/${encodeURIComponent(productId)}`), {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Failed to remove item")
      }

      await fetchCartPreview()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:update"))
      }
    } catch (error) {
      setCartError("Failed to remove item from cart")
    } finally {
      setCartRemovingId(null)
    }
  }

  const toggleMenuDropdown = (key: string) => {
    if (!isMounted) return
    setOpenMenuDropdowns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        // Close other dropdowns (accordion behavior on mobile)
        if (isMobile) {
          newSet.clear()
        }
        newSet.add(key)
      }
      return newSet
    })
  }

  const isMenuDropdownOpen = (key: string) => {
    return openMenuDropdowns.has(key)
  }

  return (
    <div className="menu-area">
      {/* Top Menu Area */}
      <div className="top-menu-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-3 col-6 v_middle">
              <div className="logo">
                <Link href="/">
                  <span className="marketnest-wordmark">MarketNest</span>
                  <span className="marketnest-tagline">Discover. Sell. Grow.</span>
                </Link>
              </div>
            </div>

            <div className="col-lg-8 offset-lg-1 col-md-9 col-6 v_middle">
              <div className="author-area">
                {session && session.user ? (
                  <>
                    <Link href="/dashboard/upload" className="author-area__seller-btn inline">
                      Become a Seller
                    </Link>

                    {/* Notifications Area */}
                    <div className="author__notification_area">
                      <ul>
                        {/* Notifications Dropdown */}
                        <li className="has_dropdown">
                          <div
                            className="icon_wrap"
                            onClick={() => toggleDropdown("notifications")}
                            onMouseEnter={() => {
                              const dropdown = dropdownRefs.current.notifications
                              if (dropdown) dropdown.classList.add("show")
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <span className="lnr lnr-alarm"></span>
                            <span className="notification_count noti">{notificationUnreadTotal}</span>
                          </div>

                          <div
                            className="dropdowns notification--dropdown"
                            ref={(el) => { dropdownRefs.current.notifications = el }}
                            onMouseLeave={() => {
                              const dropdown = dropdownRefs.current.notifications
                              if (dropdown) dropdown.classList.remove("show")
                            }}
                          >
                            <div className="dropdown_module_header">
                              <h4>My Notifications</h4>
                              <Link href="/notification">View All</Link>
                            </div>
                            <div className="notifications_module">
                              {headerNotifications.length === 0 ? (
                                <div className="notification">
                                  <div className="notification__info">
                                    <div className="info">
                                      <p>No notifications yet.</p>
                                      <p className="time">—</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                headerNotifications.map((notification, index) => {
                                  const display = parseNotificationDisplay(notification, index)
                                  const typeKey = (notification.type || "").toLowerCase()
                                  const iconClass = (() => {
                                    switch (typeKey) {
                                      case "favorite":
                                      case "favourite":
                                        return "lnr lnr-heart loved noti_icon"
                                      case "comment":
                                      case "commented":
                                        return "lnr lnr-bubble commented noti_icon"
                                      case "purchase":
                                      case "purchased":
                                        return "lnr lnr-cart purchased noti_icon"
                                      case "review":
                                      case "reviewed":
                                        return "lnr lnr-star reviewed noti_icon"
                                      case "message":
                                        return "lnr lnr-envelope noti_icon message"
                                      default:
                                        return "lnr lnr-alarm noti_icon"
                                    }
                                  })()

                                  return (
                                    <div key={notification.id} className={`notification${notification.read ? " read" : ""}`}>
                                      {index === 0 && <span className="line"></span>}
                                      <div className="notification__info">
                                        <div className="info_avatar">
                                          <img src={display.avatar} alt={display.actorName} />
                                        </div>
                                        <div className="info">
                                          <p>
                                            <span>{display.actorName}</span>
                                            {display.actionText && <> {display.actionText}</>}
                                            {display.targetName && display.targetLink ? (
                                              <>
                                                {" "}
                                                <Link href={display.targetLink}>{display.targetName}</Link>
                                              </>
                                            ) : display.targetName ? (
                                              <> {display.targetName}</>
                                            ) : null}
                                          </p>
                                          <p className="time">{display.timeLabel}</p>
                                        </div>
                                      </div>
                                      <div className="notification__icons ">
                                        <span className={iconClass}></span>
                                      </div>
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          </div>
                        </li>

                        {/* Messages Dropdown */}
                        <li className="has_dropdown">
                          <div
                            className="icon_wrap"
                            onClick={() => toggleDropdown("messages")}
                            onMouseEnter={() => {
                              const dropdown = dropdownRefs.current.messages
                              if (dropdown) dropdown.classList.add("show")
                            }}
                            style={{ cursor: "pointer" }}
                            data-dropdown="messages"
                          >
                            <span className="lnr lnr-envelope"></span>
                            <span className="notification_count msg">{messageUnreadTotal}</span>
                          </div>

                          <div
                            className="dropdowns messaging--dropdown"
                            ref={(el) => { dropdownRefs.current.messages = el }}
                            onMouseLeave={() => {
                              const dropdown = dropdownRefs.current.messages
                              if (dropdown) dropdown.classList.remove("show")
                            }}
                          >
                            <div className="dropdown_module_header">
                              <h4>My Messages</h4>
                              <Link href="/message">View All</Link>
                            </div>
                            <div className="messages">
                              {headerMessages.length === 0 ? (
                                <div className="message">
                                  <div className="message__actions_avatar">
                                    <div className="avatar">
                                      <img src={withBasePath("/images/notification_head4.png")} alt="No messages" />
                                    </div>
                                  </div>
                                  <div className="message_data">
                                    <div className="name_time">
                                      <div className="name">
                                        <p>No messages yet</p>
                                      </div>
                                      <span className="time">—</span>
                                      <p className="message__preview_text">You have not started any conversations.</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                headerMessages.map((message) => (
                                  <Link
                                    key={message.id}
                                    href={message.link}
                                    className={`message${message.hasUnread ? " recent" : ""}`}
                                  >
                                    <div className="message__actions_avatar">
                                      <div className="avatar">
                                        <img src={message.partnerAvatar} alt={message.partnerName} />
                                      </div>
                                    </div>
                                    <div className="message_data">
                                      <div className="name_time">
                                        <div className="name">
                                          <p>{message.partnerName}</p>
                                          {message.hasUnread && <span className="lnr lnr-envelope"></span>}
                                        </div>
                                        <span className="time">{message.time}</span>
                                        <p className="message__preview_text">{message.preview}</p>
                                      </div>
                                    </div>
                                  </Link>
                                ))
                              )}
                            </div>
                          </div>
                        </li>

                        {/* Cart Dropdown */}
                        <li className="has_dropdown">
                          <div
                            className="icon_wrap"
                            onClick={() => toggleDropdown("cart")}
                            onMouseEnter={() => {
                              const dropdown = dropdownRefs.current.cart
                              if (dropdown) dropdown.classList.add("show")
                            }}
                            style={{ cursor: "pointer" }}
                            data-dropdown="cart"
                          >
                            <span className="lnr lnr-cart"></span>
                            <span className="notification_count purch">{cartPreview.totalItems}</span>
                          </div>

                          <div
                            className="dropdowns dropdown--cart"
                            ref={(el) => { dropdownRefs.current.cart = el }}
                            onMouseLeave={() => {
                              const dropdown = dropdownRefs.current.cart
                              if (dropdown) dropdown.classList.remove("show")
                            }}
                          >
                            <div className="cart_area">
                              {cartError && !cartLoading && (
                                <div className="cart_product" style={{ padding: "16px", color: "#e74c3c", textAlign: "center" }}>
                                  <p>{cartError}</p>
                                </div>
                              )}
                              {cartLoading ? (
                                <div className="cart_product" style={{ padding: "20px", textAlign: "center" }}>
                                  <p>Loading cart…</p>
                                </div>
                              ) : cartPreview.items.length === 0 ? (
                                <div className="cart_product" style={{ padding: "20px", textAlign: "center" }}>
                                  <p>Your cart is empty.</p>
                                  <Link href="/" className="btn btn--round btn--sm" style={{ marginTop: 10 }}>
                                    Browse Products
                                  </Link>
                                </div>
                              ) : (
                                <>
                                  {cartPreview.items.map((item) => (
                                    <div className="cart_product" key={item.productId}>
                                      <div className="product__info">
                                        <div className="thumbn">
                                          <img src={withBasePath(item.image)} alt="cart product thumbnail" />
                                        </div>
                                        <div className="info">
                                          <Link className="title" href={`/single-product/${item.slug}`}>
                                            {item.title}
                                          </Link>
                                          {item.category && (
                                            <div className="cat">
                                              <Link href="#">
                                                <img src={withBasePath(item.category.icon)} alt={item.category.name} />
                                                {item.category.name}
                                              </Link>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="product__action">
                                        <a
                                          href="#"
                                          onClick={(event) => {
                                            event.preventDefault()
                                            event.stopPropagation()
                                            void handleRemoveCartItem(item.productId)
                                          }}
                                          aria-label="Remove from cart"
                                        >
                                          <span className={cartRemovingId === item.productId ? "lnr lnr-sync" : "lnr lnr-trash"}></span>
                                        </a>
                                        <p>
                                          ${ (item.effectivePrice * item.quantity).toFixed(2) }
                                          {item.quantity > 1 && <span style={{ marginLeft: 6 }}>× {item.quantity}</span>}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="total">
                                    <p>
                                      <span>Total :</span>${cartPreview.subtotal.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="cart_action">
                                    <Link className="go_cart" href="/cart">
                                      View Cart
                                    </Link>
                                    <Link className="go_checkout" href="/checkout?cart=1">
                                      Checkout
                                    </Link>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>

                    {/* Author Info Dropdown */}
                    <div className="author-author__info inline has_dropdown">
                      <div
                        className="author__avatar"
                        onClick={() => toggleDropdown("author")}
                        onMouseEnter={() => {
                          const dropdown = dropdownRefs.current.author
                          if (dropdown) dropdown.classList.add("show")
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <img src={(session?.user?.image) || withBasePath("/images/usr_avatar.png")} alt="user avatar" />
                      </div>
                      <div className="autor__info">
                        <p className="name">{(session?.user?.name) || "User"}</p>
                        <div className="author_wallet">
                          <span>
                           {saleBalance ? formatCurrency(saleBalance.earned) : saleBalanceLoading ? "—" : "$0.00"}
                          </span>
                          {/* <span>
                            Available: {saleBalance ? formatCurrency(saleBalance.available) : saleBalanceLoading ? "—" : "$0.00"}
                          </span> */}
                        </div>
                      </div>

                      <div
                        className="dropdowns dropdown--author"
                        ref={(el) => { dropdownRefs.current.author = el }}
                        onMouseLeave={() => {
                          const dropdown = dropdownRefs.current.author
                          if (dropdown) dropdown.classList.remove("show")
                        }}
                      >
                        <ul>
                          <li>
                            <Link href="/author">
                              <span className="lnr lnr-user"></span>Profile
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard">
                              <span className="lnr lnr-home"></span> Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/settings">
                              <span className="lnr lnr-cog"></span> Setting
                            </Link>
                          </li>
                          <li>
                            <Link href="/cart">
                              <span className="lnr lnr-cart"></span>Purchases
                            </Link>
                          </li>
                          <li>
                            <Link href="/favourites">
                              <span className="lnr lnr-heart"></span> Favourite
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/add-credit">
                              <span className="lnr lnr-dice"></span>Add Credits
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/statement">
                              <span className="lnr lnr-chart-bars"></span>Sale Statement
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/upload">
                              <span className="lnr lnr-upload"></span>Upload Item
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/customer">
                              <span className="lnr lnr-users"></span>Customer Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/manage-item">
                              <span className="lnr lnr-book"></span>Manage Item
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/withdrawal">
                              <span className="lnr lnr-briefcase"></span>Withdrawals
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                signOut({ callbackUrl: withBasePath("/") })
                              }}
                            >
                              <span className="lnr lnr-exit"></span>Logout
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} className="join not_logged_in">
                    {/* <Link href="/signup" className="author-area__seller-btn inline">
                      Become a Seller
                    </Link> */}
                    <Link href="/login" className="btn btn-sm btn-primary">
                      Login
                    </Link>
                    <Link href="/signup" className="btn btn-sm btn-success">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Content - Only show on mobile */}
              <div className="mobile_content">
                <span
                  className="lnr lnr-user menu_icon"
                  onClick={() => setOffcanvasOpen(!offcanvasOpen)}
                  style={{ cursor: "pointer" }}
                ></span>

                {/* Offcanvas Menu */}
                <div className={`offcanvas-menu ${offcanvasOpen ? "" : "closed"}`}>
                  <span
                    className="lnr lnr-cross close_menu"
                    onClick={() => setOffcanvasOpen(false)}
                    style={{ cursor: "pointer" }}
                  ></span>
                  {session && session.user && (
                    <>
                      <div className="author-author__info">
                        <div className="author__avatar v_middle">
                          <img src={session.user.image || withBasePath("/images/usr_avatar.png")} alt="user avatar" />
                        </div>
                        <div className="autor__info v_middle">
                          <p className="name">{session.user.name || "User"}</p>
                          <p className="ammount">$20.45</p>
                        </div>
                      </div>

                      <div className="author__notification_area">
                        <ul>
                          <li>
                            <Link href="/notification">
                              <div className="icon_wrap">
                                <span className="lnr lnr-alarm"></span>
                                <span className="notification_count noti">25</span>
                              </div>
                            </Link>
                          </li>
                          <li>
                            <Link href="/message">
                              <div className="icon_wrap">
                                <span className="lnr lnr-envelope"></span>
                                <span className="notification_count msg">6</span>
                              </div>
                            </Link>
                          </li>
                          <li>
                            <Link href="/cart">
                              <div className="icon_wrap">
                                <span className="lnr lnr-cart"></span>
                                <span className="notification_count purch">2</span>
                              </div>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="dropdowns dropdown--author">
                        <ul>
                          <li>
                            <Link href="/author">
                              <span className="lnr lnr-user"></span>Profile
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard">
                              <span className="lnr lnr-home"></span> Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/settings">
                              <span className="lnr lnr-cog"></span> Setting
                            </Link>
                          </li>
                          <li>
                            <Link href="/cart">
                              <span className="lnr lnr-cart"></span>Purchases
                            </Link>
                          </li>
                          <li>
                            <Link href="/favourites">
                              <span className="lnr lnr-heart"></span> Favourite
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/add-credit">
                              <span className="lnr lnr-dice"></span>Add Credits
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/statement">
                              <span className="lnr lnr-chart-bars"></span>Sale Statement
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/upload">
                              <span className="lnr lnr-upload"></span>Upload Item
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/manage-item">
                              <span className="lnr lnr-book"></span>Manage Item
                            </Link>
                          </li>
                          <li>
                            <Link href="/dashboard/withdrawal">
                              <span className="lnr lnr-briefcase"></span>Withdrawals
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                signOut({ callbackUrl: withBasePath("/") })
                              }}
                            >
                              <span className="lnr lnr-exit"></span>Logout
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="text-center">
                        <Link href="/dashboard/upload" className="author-area__seller-btn inline">
                          Become a Seller
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Area */}
      <div className="mainmenu">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="navbar-header">
                {/* Search */}
                <div className="mainmenu__search">
                  <form onSubmit={handleSearch}>
                    <div className="searc-wrap">
                      <input
                        type="text"
                        placeholder="Search product"
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

              <MarketplaceNav />
              {false && <nav className="navbar navbar-expand-md navbar-light mainmenu__menu">
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-controls="navbarNav"
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${mobileMenuOpen ? "show" : ""}`} id="navbarNav">
                  <ul className="navbar-nav">
                    <li
                      className={`nav-item has_dropdown ${isMenuDropdownOpen('home') || isMenuItemActive('/') ? 'active' : ''}`}
                      onMouseEnter={() => {
                        if (isMounted && !isMobile) {
                          const dropdown = menuDropdownRefs.current.home
                          if (dropdown) dropdown.classList.add('show')
                        }
                      }}
                      onMouseLeave={() => {
                        if (isMounted && !isMobile) {
                          const dropdown = menuDropdownRefs.current.home
                          if (dropdown) dropdown.classList.remove('show')
                        }
                      }}
                    >
                      <Link 
                        className="nav-link" 
                        href="/"
                        onClick={(e) => {
                          if (isMounted && isMobile) {
                            e.preventDefault()
                            toggleMenuDropdown('home')
                          }
                        }}
                      >
                        HOME
                        {isMounted && isMobile && <span className="lnr lnr-plus-circle"></span>}
                      </Link>
                      <div className={`dropdowns dropdown--menu ${isMenuDropdownOpen('home') ? 'show' : ''}`} ref={(el) => { menuDropdownRefs.current.home = el }}>
                        <ul>
                          <li>
                            <Link href="/" className={isMenuItemActive('/') ? 'active' : ''}>Home Multi Vendor</Link>
                          </li>
                        </ul>
                      </div>
                    </li>
                    <li
                      className={`nav-item has_dropdown ${isMenuDropdownOpen('allProduct') || isMenuItemActive('/all-products', ['/all-products', '/all-products-list', '/top-authors']) ? 'active' : ''}`}
                      onMouseEnter={() => {
                        if (isMounted && !isMobile) {
                          const dropdown = menuDropdownRefs.current.allProduct
                          if (dropdown) dropdown.classList.add('show')
                        }
                      }}
                      onMouseLeave={() => {
                        if (isMounted && !isMobile) {
                          const dropdown = menuDropdownRefs.current.allProduct
                          if (dropdown) dropdown.classList.remove('show')
                        }
                      }}
                    >
                      <Link 
                        className="nav-link" 
                        href="/all-products"
                        onClick={(e) => {
                          if (isMounted && isMobile) {
                            e.preventDefault()
                            toggleMenuDropdown('allProduct')
                          }
                        }}
                      >
                        PRODUCT
                        {isMounted && isMobile && <span className="lnr lnr-plus-circle"></span>}
                      </Link>
                      <div className={`dropdowns dropdown--menu ${isMenuDropdownOpen('allProduct') ? 'show' : ''}`} ref={(el) => { menuDropdownRefs.current.allProduct = el }}>
                        <ul>
                          <li>
                            <Link href="/all-products?sortBy=newest" className={pathname === '/all-products' && (searchParams?.get('sortBy') === 'newest' || !searchParams?.get('sortBy')) ? 'active' : ''}>Recent Items</Link>
                          </li>
                          <li>
                            <Link href="/all-products?sortBy=popular" className={pathname === '/all-products' && searchParams?.get('sortBy') === 'popular' ? 'active' : ''}>Popular Items</Link>
                          </li>
                          <li>
                            <Link href="/all-products?minPrice=0&maxPrice=0" className={pathname === '/all-products' && searchParams?.get('minPrice') === '0' && searchParams?.get('maxPrice') === '0' ? 'active' : ''}>Free Templates</Link>
                          </li>
                          <li>
                            <Link href="/top-authors" className={isMenuItemActive('/top-authors') ? 'active' : ''}>Top Authors</Link>
                          </li>
                        </ul>
                      </div>
                    </li>
                    <li
                      className={`nav-item has_dropdown ${isMenuDropdownOpen('categories') || isMenuItemActive('/category-grid', ['/category-grid', '/category-list']) ? 'active' : ''}`}
                      onMouseEnter={() => {
                        if (isMounted && !isMobile) {
                          const dropdown = menuDropdownRefs.current.categories
                          if (dropdown) dropdown.classList.add('show')
                        }
                      }}
                      onMouseLeave={() => {
                        if (isMounted && !isMobile) {
                          const dropdown = menuDropdownRefs.current.categories
                          if (dropdown) dropdown.classList.remove('show')
                        }
                      }}
                    >
                      <Link 
                        className="nav-link" 
                        href="/category-grid"
                        onClick={(e) => {
                          if (isMounted && isMobile) {
                            e.preventDefault()
                            toggleMenuDropdown('categories')
                          }
                        }}
                      >
                        CATEGORIES
                        {isMounted && isMobile && <span className="lnr lnr-plus-circle"></span>}
                      </Link>
                      <div className={`dropdowns dropdown--menu ${isMenuDropdownOpen('categories') ? 'show' : ''}`} ref={(el) => { menuDropdownRefs.current.categories = el }}>
                        <ul>
                          <li>
                            <Link href="/category-grid" className={(isMenuItemActive('/category-grid') || isMenuItemActive('/category-list')) && !searchParams?.get('category') ? 'active' : ''}>Popular Items</Link>
                          </li>
                          <li>
                            <Link href="/category-grid">Admin Templates</Link>
                          </li>
                          <li>
                            <Link href="/category-grid">Blog / Magazine / News</Link>
                          </li>
                          <li>
                            <Link href="/category-grid">Creative</Link>
                          </li>
                          <li>
                            <Link href="/category-grid">Corporate Business</Link>
                          </li>
                          <li>
                            <Link href="/category-grid">Resume Portfolio</Link>
                          </li>
                          <li>
                            <Link href="/category-grid">eCommerce</Link>
                          </li>
                          <li>
                            <Link href="/category-grid">Entertainment</Link>
                          </li>
                          <li>
                            <Link href="/category-grid">Landing Pages</Link>
                          </li>
                        </ul>
                      </div>
                    </li>
                    <li
                      className={`nav-item has_megamenu ${isMenuDropdownOpen('elements') || isMenuItemActive('#', ['/brands', '/products']) ? 'active' : ''}`}
                      onMouseEnter={() => {
                        if (isMounted && !isMobile) {
                          const dropdown = menuDropdownRefs.current.elements
                          if (dropdown) dropdown.classList.add('show')
                        }
                      }}
                      onMouseLeave={() => {
                        if (isMounted && !isMobile) {
                          const dropdown = menuDropdownRefs.current.elements
                          if (dropdown) dropdown.classList.remove('show')
                        }
                      }}
                    >
                      <Link 
                        className="nav-link" 
                        href="#"
                        onClick={(e) => {
                          if (isMounted && isMobile) {
                            e.preventDefault()
                            toggleMenuDropdown('elements')
                          }
                        }}
                      >
                        ELEMENTS
                        {isMounted && isMobile && <span className="lnr lnr-plus-circle"></span>}
                      </Link>
                      <div className={`dropdown_megamenu contained ${isMenuDropdownOpen('elements') ? 'show' : ''}`} ref={(el) => { menuDropdownRefs.current.elements = el }}>
                        <div className="megamnu_module">
                          <div className="menu_items">
                            <div className="menu_column">
                              <ul>
                                <li>
                                  <Link href="/brands" className={isMenuItemActive('/brands') ? 'active' : ''}>Brands</Link>
                                </li>
                              </ul>
                            </div>

                            <div className="menu_column">
                              <ul>
                                <li>
                                  <Link href="/products" className={isMenuItemActive('/products') ? 'active' : ''}>Products</Link>
                                </li>
                              </ul>
                            </div>

                          </div>
                        </div>
                      </div>
                    </li>
                    <li
                      className={`nav-item has_megamenu ${isMenuDropdownOpen('pages') || isMenuItemActive('#', ['/all-products', '/all-products-list', '/category-grid', '/category-list', '/search-product', '/cart', '/checkout', '/author', '/author/items', '/author/reviews', '/notification', '/message', '/message-compose', '/favourites', '/dashboard', '/dashboard/settings', '/dashboard/purchase', '/dashboard/add-credit', '/dashboard/statement', '/dashboard/invoice', '/dashboard/upload', '/dashboard/manage-item', '/dashboard/withdrawal', '/dashboard/add-payment-method', '/login', '/signup', '/recover-pass', '/dashboard/customer', '/customer/downloads', '/dashboard/customer/info', '/how-it-works', '/about', '/faq', '/term-condition', '/badges', '/404']) ? 'active' : ''}`}
                      onMouseEnter={() => {
                        if (isMounted && !isMobile) {
                          const dropdown = menuDropdownRefs.current.pages
                          if (dropdown) dropdown.classList.add('show')
                        }
                      }}
                      onMouseLeave={() => {
                        if (isMounted && !isMobile) {
                          const dropdown = menuDropdownRefs.current.pages
                          if (dropdown) dropdown.classList.remove('show')
                        }
                      }}
                    >
                      <Link 
                        className="nav-link" 
                        href="#"
                        onClick={(e) => {
                          if (isMounted && isMobile) {
                            e.preventDefault()
                            toggleMenuDropdown('pages')
                          }
                        }}
                      >
                        PAGES
                        {isMounted && isMobile && <span className="lnr lnr-plus-circle"></span>}
                      </Link>
                      <div className={`dropdown_megamenu ${isMenuDropdownOpen('pages') ? 'show' : ''}`} ref={(el) => { menuDropdownRefs.current.pages = el }}>
                        <div className="megamnu_module">
                          <div className="menu_items">
                            <div className="menu_column">
                              <ul>
                                <li className="title">Product</li>
                                <li>
                                  <Link href="/all-products" className={isMenuItemActive('/all-products') ? 'active' : ''}>Products Grid</Link>
                                </li>
                                <li>
                                  <Link href="/all-products-list" className={isMenuItemActive('/all-products-list') ? 'active' : ''}>Products List</Link>
                                </li>
                                <li>
                                  <Link href="/category-grid" className={isMenuItemActive('/category-grid') ? 'active' : ''}>Category Grid</Link>
                                </li>
                                <li>
                                  <Link href="/category-list" className={isMenuItemActive('/category-list') ? 'active' : ''}>Category List</Link>
                                </li>
                                <li>
                                  <Link href={withBasePath("/search-product")} className={isMenuItemActive('/search-product') ? 'active' : ''}>Search Product</Link>
                                </li>
                                <li>
                                  <Link href="/cart" className={isMenuItemActive('/cart') ? 'active' : ''}>Shopping Cart</Link>
                                </li>
                                <li>
                                  <Link href="/checkout" className={isMenuItemActive('/checkout') ? 'active' : ''}>Checkout</Link>
                                </li>
                              </ul>
                            </div>

                            <div className="menu_column">
                              <ul>
                                <li className="title">Author</li>
                                <li>
                                  <Link href="/author" className={isMenuItemActive('/author') ? 'active' : ''}>Author Profile</Link>
                                </li>
                                <li>
                                  <Link href="/author/items" className={isMenuItemActive('/author/items') ? 'active' : ''}>Author Items</Link>
                                </li>
                                <li>
                                  <Link href="/author/reviews" className={isMenuItemActive('/author/reviews') ? 'active' : ''}>Customer Reviews</Link>
                                </li>
                                <li>
                                  <Link href="/notification" className={isMenuItemActive('/notification') ? 'active' : ''}>Notifications</Link>
                                </li>
                                <li>
                                  <Link href="/message" className={isMenuItemActive('/message') ? 'active' : ''}>Message Inbox</Link>
                                </li>
                                <li>
                                  <Link href="/message-compose" className={isMenuItemActive('/message-compose') ? 'active' : ''}>Message Compose</Link>
                                </li>
                                <li>
                                  <Link href="/favourites" className={isMenuItemActive('/favourites') ? 'active' : ''}>Favorites Items</Link>
                                </li>
                              </ul>
                            </div>

                            <div className="menu_column">
                              <ul>
                                <li className="title">Dashboard</li>
                                <li>
                                  <Link href="/dashboard" className={isMenuItemActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/settings" className={isMenuItemActive('/dashboard/settings') ? 'active' : ''}>Account Settings</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/purchase" className={isMenuItemActive('/dashboard/purchase') ? 'active' : ''}>Author Purchases</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/add-credit" className={isMenuItemActive('/dashboard/add-credit') ? 'active' : ''}>Add Credits</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/statement" className={isMenuItemActive('/dashboard/statement') ? 'active' : ''}>Statements</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/invoice" className={isMenuItemActive('/dashboard/invoice') ? 'active' : ''}>Invoice</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/upload" className={isMenuItemActive('/dashboard/upload') ? 'active' : ''}>Upload Item</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/manage-item" className={isMenuItemActive('/dashboard/manage-item') ? 'active' : ''}>Edit Items</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/withdrawal" className={isMenuItemActive('/dashboard/withdrawal') ? 'active' : ''}>Withdrawals</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/manage-item" className={isMenuItemActive('/dashboard/manage-item') ? 'active' : ''}>Manage Items</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/add-payment-method" className={isMenuItemActive('/dashboard/add-payment-method') ? 'active' : ''}>Add Payment Method</Link>
                                </li>
                              </ul>
                            </div>

                            <div className="menu_column">
                              <ul>
                                <li className="title">Customers</li>
                                <li>
                                  <Link href="/login" className={isMenuItemActive('/login') ? 'active' : ''}>Login</Link>
                                </li>
                                <li>
                                  <Link href="/signup" className={isMenuItemActive('/signup') ? 'active' : ''}>Register</Link>
                                </li>
                                <li>
                                  <Link href="/recover-pass" className={isMenuItemActive('/recover-pass') ? 'active' : ''}>Recovery Password</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/customer" className={isMenuItemActive('/dashboard/customer') ? 'active' : ''}>Customer Dashboard</Link>
                                </li>
                                <li>
                                  <Link href="/customer/downloads" className={isMenuItemActive('/customer/downloads') ? 'active' : ''}>Customer Downloads</Link>
                                </li>
                                <li>
                                  <Link href="/dashboard/customer/info" className={isMenuItemActive('/dashboard/customer/info') ? 'active' : ''}>Customer Info</Link>
                                </li>
                              </ul>

                            </div>

                            <div className="menu_column">
                              <ul>
                                <li className="title">Other</li>
                                <li>
                                  <Link href="/how-it-works" className={isMenuItemActive('/how-it-works') ? 'active' : ''}>How It Works</Link>
                                </li>
                                <li>
                                  <Link href="/about" className={isMenuItemActive('/about') ? 'active' : ''}>About Us</Link>
                                </li>
                                <li>
                                  <Link href="/faq" className={isMenuItemActive('/faq') ? 'active' : ''}>FAQs</Link>
                                </li>
                                <li>
                                  <Link href="/term-condition" className={isMenuItemActive('/term-condition') ? 'active' : ''}>Terms & Conditions</Link>
                                </li>
                                <li className="has_badge">
                                  <Link href="/badges" className={isMenuItemActive('/badges') ? 'active' : ''}>Badges</Link>
                                  <span className="badge">New</span>
                                </li>
                                <li>
                                  <Link href="/404" className={isMenuItemActive('/404') ? 'active' : ''}>404 Error page</Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className={`nav-item ${isMenuItemActive('/contact') ? 'active' : ''}`}>
                      <Link className="nav-link" href="/contact">
                        CONTACT
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrapper component that provides Suspense boundary for useSearchParams
export default function Header() {
  return (
    <Suspense fallback={
      <div className="header-area">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <nav className="navbar navbar-expand-lg mainmenu__menu">
                <div className="navbar-collapse collapse">
                  <ul className="navbar-nav">
                    {/* Loading state - minimal header */}
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    }>
      <HeaderContent />
    </Suspense>
  )
}
