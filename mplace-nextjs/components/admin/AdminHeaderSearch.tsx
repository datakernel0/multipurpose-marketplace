"use client"

import { Input, Row, Col } from "antd"
import FeatherIcon from "feather-icons-react"
import { AdminHeaderSearchStyled } from "./AdminHeaderSearchStyled"

export default function AdminHeaderSearch() {
  return (
    <AdminHeaderSearchStyled>
      <div className="certain-category-search-wrapper w-100">
        <Row className="ant-row-middle">
          <Col md={2} xs={1} className="text-right">
            <span className="certain-category-icon">
              <FeatherIcon icon="search" size={16} />
            </span>
          </Col>
          <Col md={22} xs={23}>
            <Input placeholder="Search..." style={{ border: "none", boxShadow: "none" }} />
          </Col>
        </Row>
      </div>
    </AdminHeaderSearchStyled>
  )
}

