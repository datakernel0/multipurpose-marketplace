"use client"

import React from "react"
import { PageHeader } from "@ant-design/pro-components"
import { Breadcrumb } from "antd"
import styled from "styled-components"
import { withBasePath } from "@/utils/paths"
import Link from "next/link"

const PageHeaderStyle = styled(PageHeader)`
  .page-header-actions button.ant-btn-white svg {
    width: 12px;
    height: 12px;
    margin-right: 2px;
    color: #5f63f2;
  }
  i + span,
  svg + span,
  img + span {
    margin-left: 6px;
  }
`

interface BreadcrumbRoute {
  breadcrumbName: string
  path: string
}

interface AdminPageHeaderProps {
  title: string | React.ReactNode
  subTitle?: string | React.ReactNode
  routes?: BreadcrumbRoute[]
  buttons?: React.ReactNode[]
  ghost?: boolean
  bgColor?: string
  className?: string
}

export default function AdminPageHeader({
  title,
  subTitle,
  routes,
  buttons,
  ghost = false,
  bgColor = "#F4F5F7",
  className,
}: AdminPageHeaderProps) {
  // Convert routes array to items format for Ant Design Breadcrumb
  const breadcrumbItems = routes
    ? routes.map((route) => ({
        title: route.breadcrumbName,
        path: withBasePath(route.path),
      }))
    : undefined

  // Custom itemRender to use Next.js Link instead of default <a> tag
  const itemRender = (item: any, params: any, items: any[], paths: string[]) => {
    const isLast = item === items[items.length - 1]
    if (isLast) {
      return <span>{item.title}</span>
    }
    return <Link href={item.path || "#"}>{item.title}</Link>
  }

  return (
    <>
      <div
        style={{
          backgroundColor: bgColor || "#F4F5F7",
        }}
      >
        <PageHeaderStyle
          style={{
            backgroundColor: "rgb(244, 245, 247)",
          }}
          className={className}
          title={title}
          subTitle={subTitle}
          breadcrumb={
            breadcrumbItems
              ? {
                  items: breadcrumbItems,
                  itemRender: itemRender,
                }
              : undefined
          }
          extra={buttons}
          ghost={ghost}
        />
      </div>
    </>
  )
}

