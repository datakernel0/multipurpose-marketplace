"use client"

import { ReactNode, useState, useEffect } from "react"
import { Layout, Button, Row, Col } from "antd"
import FeatherIcon from "feather-icons-react"
import { Scrollbars } from "react-custom-scrollbars"
import { ThemeProvider } from "styled-components"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"
import AdminMenu from "./AdminMenu"
import AdminHeaderContent from "./AdminHeaderContent"
import AdminHeaderSearch from "./AdminHeaderSearch"
import { AdminLayoutStyled } from "./AdminLayoutStyled"
import { darkTheme } from "@/config/adminTheme"

const { Header, Footer, Sider, Content } = Layout

interface AdminLayoutWrapperProps {
  children: ReactNode
  user: {
    name?: string | null
    email: string
    image?: string | null
    role: string
  }
}

export default function AdminLayoutWrapper({ children, user }: AdminLayoutWrapperProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1920)
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth)
      const handleResize = () => {
        setWindowWidth(window.innerWidth)
        if (window.innerWidth <= 1200) {
          setCollapsed(true)
        }
      }
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (windowWidth <= 1200) {
      setCollapsed(true)
    }
  }, [windowWidth])

  // Collapse sidebar when route changes
  useEffect(() => {
    if (windowWidth <= 991) {
      setCollapsed(true)
    }
  }, [pathname, windowWidth])

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  const SideBarStyle: React.CSSProperties = {
    margin: "0",
    padding: "15px 15px 55px 15px",
    overflowY: "auto",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 64,
    zIndex: 998,
  }

  const renderView = ({ style, ...props }: any) => {
    return <div {...props} className="admin-scrollbar-view" style={style} />
  }

  const renderThumbVertical = ({ style, ...props }: any) => {
    return <div {...props} className="admin-scrollbar-thumb-vertical" style={style} />
  }

  const renderTrackVertical = () => {
    return <div className="admin-scrollbar-track-vertical" />
  }

  const renderThumbHorizontal = ({ style, ...props }: any) => {
    return <div {...props} className="admin-scrollbar-thumb-horizontal" style={style} />
  }

  const footerStyle = {
    padding: "20px 30px 18px",
    color: "rgba(0, 0, 0, 0.65)",
    fontSize: "14px",
    background: "rgba(255, 255, 255, .90)",
    width: "100%",
    boxShadow: "0 -5px 10px rgba(146,153,184, 0.05)",
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <AdminLayoutStyled>
        <Layout className="layout">
          <Header>
            <Row>
              <Col lg={4} sm={6} xs={12} className="navbar-brand">
                <Button type="link" onClick={toggleCollapsed}>
                  <FeatherIcon icon={collapsed ? "menu" : "x"} size={20} />
                </Button>
                <Link href={withBasePath("/admin")} className="striking-logo">
                  <span>MartPlace</span>
                </Link>
              </Col>

              <Col lg={14} md={8} sm={0} xs={0} className="header-search-col">
                <AdminHeaderSearch />
              </Col>

              <Col lg={6} md={10} sm={0} xs={0} className="header-content-col">
                <AdminHeaderContent user={user} />
              </Col>

              <Col lg={0} md={0} sm={18} xs={12} className="mobile-action-col">
                <div className="mobile-action">
                  <Link href="#" className="btn-auth">
                    <FeatherIcon icon="more-vertical" size={20} />
                  </Link>
                </div>
              </Col>
            </Row>
          </Header>

          <Layout>
            <Sider
              width={280}
              style={SideBarStyle}
              collapsed={collapsed}
              theme="light"
              collapsible={false}
            >
              <Scrollbars
                className="custom-scrollbar"
                autoHide
                autoHideTimeout={500}
                autoHideDuration={200}
                renderThumbHorizontal={renderThumbHorizontal}
                renderThumbVertical={renderThumbVertical}
                renderView={renderView}
                renderTrackVertical={renderTrackVertical}
              >
                <div className="sidebar-nav-title">MAIN MENU</div>
                <AdminMenu />
              </Scrollbars>
            </Sider>

            <Layout className="atbd-main-layout" style={{ marginLeft: collapsed ? 80 : 280, marginTop: 64 }}>
              <Content className="admin-content">{children}</Content>
              <Footer className="admin-footer" style={footerStyle}>
                <Row>
                  <Col md={12} xs={24}>
                    <span className="admin-footer__copyright">2024 © MartPlace</span>
                  </Col>
                  <Col md={12} xs={24}>
                    <div className="admin-footer__links">
                      <Link href="#">About</Link>
                      <Link href="#">Team</Link>
                      <Link href="#">Contact</Link>
                    </div>
                  </Col>
                </Row>
              </Footer>
            </Layout>
          </Layout>
        </Layout>
      </AdminLayoutStyled>
    </ThemeProvider>
  )
}

