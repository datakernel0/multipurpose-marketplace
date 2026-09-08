"use client"

import { Badge, Popover } from "antd"
import FeatherIcon from "feather-icons-react"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"

function MessageIcon() {
  const content = (
    <div style={{ padding: "10px", minWidth: "300px" }}>
      <div style={{ marginBottom: "10px", fontWeight: 500 }}>Messages</div>
      <div style={{ padding: "10px 0", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ textAlign: "center", color: "#9299B8", padding: "20px" }}>
          No new messages
        </div>
      </div>
      <Link href={withBasePath("/message")} style={{ display: "block", textAlign: "center", padding: "10px", color: "#5F63F2" }}>
        See all messages
      </Link>
    </div>
  )

  return (
    <div className="message">
      <Popover content={content} placement="bottomLeft" trigger="click">
        <Badge dot offset={[-8, -5]}>
          <span className="head-example">
            <FeatherIcon icon="mail" size={20} />
          </span>
        </Badge>
      </Popover>
    </div>
  )
}

function NotificationIcon() {
  const content = (
    <div style={{ padding: "10px", minWidth: "300px" }}>
      <div style={{ marginBottom: "10px", fontWeight: 500 }}>Notifications</div>
      <div style={{ padding: "10px 0", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ textAlign: "center", color: "#9299B8", padding: "20px" }}>
          No new notifications
        </div>
      </div>
      <Link href="#" style={{ display: "block", textAlign: "center", padding: "10px", color: "#5F63F2" }}>
        See all notifications
      </Link>
    </div>
  )

  return (
    <div className="notification">
      <Popover content={content} placement="bottomLeft" trigger="click">
        <Badge dot offset={[-8, -5]}>
          <span className="head-example">
            <FeatherIcon icon="bell" size={20} />
          </span>
        </Badge>
      </Popover>
    </div>
  )
}

function SettingsIcon() {
  const content = (
    <div style={{ padding: "10px", minWidth: "300px" }}>
      <div style={{ marginBottom: "10px", fontWeight: 500 }}>Settings</div>
      <div style={{ padding: "10px 0", borderTop: "1px solid #f0f0f0" }}>
        <Link href={withBasePath("/admin/settings")} style={{ display: "block", padding: "8px", color: "#5A5F7D" }}>
          General Settings
        </Link>
        <Link href={withBasePath("/admin/settings")} style={{ display: "block", padding: "8px", color: "#5A5F7D" }}>
          Security
        </Link>
        <Link href={withBasePath("/admin/settings")} style={{ display: "block", padding: "8px", color: "#5A5F7D" }}>
          Preferences
        </Link>
      </div>
    </div>
  )

  return (
    <div className="settings">
      <Popover content={content} placement="bottomRight" trigger="click">
        <span className="head-example">
          <FeatherIcon icon="settings" size={20} />
        </span>
      </Popover>
    </div>
  )
}

function SupportIcon() {
  const content = (
    <div style={{ padding: "10px", minWidth: "250px" }}>
      <div style={{ marginBottom: "15px" }}>
        <div style={{ fontSize: "14px", fontWeight: 400, color: "#9299B8", marginBottom: "8px" }}>Documentation</div>
        <div style={{ paddingLeft: "16px" }}>
          <Link href="#" style={{ display: "block", padding: "4px 0", color: "#272B41" }}>How to customize admin</Link>
          <Link href="#" style={{ display: "block", padding: "4px 0", color: "#272B41" }}>How to use</Link>
        </div>
      </div>
      <div style={{ marginBottom: "15px" }}>
        <div style={{ fontSize: "14px", fontWeight: 400, color: "#9299B8", marginBottom: "8px" }}>Support</div>
        <div style={{ paddingLeft: "16px" }}>
          <Link href="#" style={{ display: "block", padding: "4px 0", color: "#272B41" }}>Contact Support</Link>
          <Link href="#" style={{ display: "block", padding: "4px 0", color: "#272B41" }}>FAQ</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="support">
      <Popover content={content} placement="bottomLeft" trigger="click">
        <span className="head-example">
          <FeatherIcon icon="help-circle" size={20} />
        </span>
      </Popover>
    </div>
  )
}

export { MessageIcon, NotificationIcon, SettingsIcon, SupportIcon }

