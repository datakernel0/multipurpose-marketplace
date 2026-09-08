"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"

import { getApiUrl, withBasePath } from "@/utils/paths"

export interface ApiNotification {
  id: string
  title: string
  message: string
  type: string
  link: string | null
  createdAt: string
  read?: boolean
}

export interface NotificationListClientProps {
  initialNotifications: ApiNotification[]
}

interface DisplayNotification {
  id: string
  user: {
    name: string
    avatar: string
  }
  action: string
  product: {
    name: string
    link: string
  }
  time: string
  type: string
  showLine: boolean
}

function formatRelativeTime(isoDate: string) {
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
}

function mapNotification(item: ApiNotification, index: number): DisplayNotification {
  const avatars = [
    withBasePath("/images/notification_head.png"),
    withBasePath("/images/notification_head2.png"),
    withBasePath("/images/notification_head3.png"),
    withBasePath("/images/notification_head4.png"),
  ]

  return {
    id: item.id,
    user: {
      name: item.title || "Notification",
      avatar: avatars[index % avatars.length],
    },
    action: item.message || "",
    product: {
      name: item.link ? "View details" : "",
      link: item.link || "#",
    },
    time: formatRelativeTime(item.createdAt || new Date().toISOString()),
    type: (item.type || "other").toLowerCase(),
    showLine: index === 0,
  }
}

export default function NotificationListClient({ initialNotifications }: NotificationListClientProps) {
  const [notifications, setNotifications] = useState<DisplayNotification[]>(() =>
    initialNotifications.map((notification, index) => mapNotification(notification, index)),
  )

  useEffect(() => {
    setNotifications(initialNotifications.map((notification, index) => mapNotification(notification, index)))
  }, [initialNotifications])

  const isEmpty = notifications.length === 0

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "favorite":
      case "favourite":
        return "lnr-heart loved"
      case "comment":
      case "commented":
        return "lnr-bubble commented"
      case "purchase":
      case "purchased":
        return "lnr-cart purchased"
      case "review":
      case "reviewed":
        return "lnr-star reviewed"
      case "message":
        return "lnr-envelope message"
      default:
        return "lnr-alarm"
    }
  }

  const handleDismiss = async (notificationId: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/notifications/${notificationId}`), {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Failed to remove notification")
      }

      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications:update"))
      }
    } catch (error) {
      // Swallow error, we already show updated list on next fetch
    }
  }

  const renderedNotifications = useMemo(() => {
    if (isEmpty) {
      return (
        <div className="text-center" style={{ padding: "60px 0" }}>
          <p>No notifications yet.</p>
        </div>
      )
    }

    return notifications.map((notification) => (
      <div key={notification.id} className="notification">
        {notification.showLine && <span className="line"></span>}
        <div className="notification__info">
          <div className="info_avatar">
            <Image src={notification.user.avatar} alt={notification.user.name} width={50} height={50} />
          </div>
          <div className="info">
            <p>
              <span>{notification.user.name}</span> {notification.action}
              {notification.product.name ? (
                <>
                  {" "}
                  <Link href={notification.product.link}>{notification.product.name}</Link>
                </>
              ) : null}
            </p>
            <p className="time">{notification.time}</p>
          </div>
        </div>

        <div className="notification__icons">
          <span className={`lnr ${getNotificationIcon(notification.type)} noti_icon`}></span>
          <span className="lnr lnr-cross" onClick={() => handleDismiss(notification.id)} style={{ cursor: "pointer" }}></span>
        </div>
      </div>
    ))
  }, [isEmpty, notifications])

  return <>{renderedNotifications}</>
}
