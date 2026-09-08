import styled from "styled-components"

export const AdminLayoutStyled = styled.div`
  .ant-layout {
    min-height: 100vh;
  }

  header {
    box-shadow: 0 2px 30px rgba(146, 153, 184, 0.1);
    background: #fff;
    z-index: 999;
    height: 64px;
    line-height: 64px;
    padding: 0;
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;

    .ant-row {
      height: 100%;
      margin: 0;
    }

    .ant-col {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0;
    }

    .header-search-col {
      justify-content: flex-start;
      padding-left: 20px;
    }

    .header-content-col {
      justify-content: flex-end;
      padding-right: 20px;
    }

    .ant-btn-link {
      background: transparent;
      border-color: transparent;
      color: #5a5f7d;
      padding: 0 25px 0 15px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;

      &:hover {
        color: #5f63f2;
        background: transparent;
      }

      &:focus {
        color: #5a5f7d;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 0;
    height: 100%;
    padding-left: 15px;

    .ant-btn-link {
      margin-right: 0;
    }
  }

  .striking-logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    font-size: 20px;
    font-weight: 600;
    color: #272b41;
    padding-left: 10px;
    height: 100%;

    &:hover {
      color: #5f63f2;
    }

    span {
      line-height: 1;
    }
  }

  .header-search-col,
  .header-content-col {
    @media (max-width: 991px) {
      display: none !important;
    }
  }

  .mobile-action-col {
    display: none !important;

    @media (max-width: 991px) {
      display: flex !important;
      justify-content: flex-end;
      align-items: center;
    }
  }

  .mobile-action {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    height: 100%;

    a {
      display: inline-flex;
      color: #9299b8;
      padding: 0 10px;
      height: 100%;
      align-items: center;

      &:hover {
        color: #5f63f2;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .ant-layout-sider {
    box-shadow: 0 0 30px rgba(146, 153, 184, 0.1);
    background: #fff;

    @media (max-width: 991px) {
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    .ant-layout-sider-children {
      padding-bottom: 15px;

      > .sidebar-nav-title {
        margin-top: 40px;
      }

      .sidebar-nav-title {
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        color: #9299b8;
        padding: 0 15px;
        margin-top: 8px;
        margin-bottom: 24px;
        display: flex;

        &:first-child {
          margin-top: 40px;
        }
      }

      .ant-menu {
        overflow-x: hidden;
        text-align: left;
        border-right: 0 none;

        .ant-menu-item,
        .ant-menu-submenu-title {
          .feather,
          img,
          svg {
            width: 16px !important;
            height: 16px !important;
            min-width: 16px;
            min-height: 16px;
            font-size: 16px;
            color: #868eae;
          }

          span {
            display: inline-block;
            color: #272b41;
            transition: 0.3s ease;
          }

          .ant-menu-item-icon {
            width: 16px !important;
            height: 16px !important;
            padding: 0 !important;
            min-width: 16px;
            min-height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;

            svg,
            .feather,
            img {
              width: 16px !important;
              height: 16px !important;
              min-width: 16px;
              min-height: 16px;
            }
          }

          .ant-menu-item-icon + span {
            margin-left: 8px;
          }

          > span {
            width: 100%;
          }
        }

        .ant-menu-item {
          height: 40px !important;
          padding: 0 15px !important;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-direction: row;
          margin: 0;

          .ant-menu-title-content {
            margin-inline-start: 20px !important;
            margin-inline-end: 0 !important;

            a {
              padding: 0 !important;
            }
          }

          a {
            width: 100%;
            display: flex !important;
            align-items: center;
            justify-content: flex-start;
            flex-direction: row;
            color: #272b41;
            text-decoration: none;

            .feather,
            svg {
              width: 16px !important;
              height: 16px !important;
              min-width: 16px;
              min-height: 16px;
              color: #868eae;
            }

            span {
              padding-left: 0;
              display: inline-block;
              color: #272b41;
            }
          }

          &.ant-menu-item-active {
            border-radius: 4px;
          }

          &.ant-menu-item-selected {
            border-radius: 4px;
            background-color: rgba(95, 99, 242, 0.1);

            a {
              color: #5f63f2;
            }

            svg,
            i,
            .feather {
              color: #5f63f2;
            }

            &:after {
              content: none;
            }
          }
        }
      }
    }

    &.ant-layout-sider-collapsed {
      padding: 15px 0px 55px !important;

      .sidebar-nav-title {
        display: none;
      }

      & + .atbd-main-layout {
        margin-left: 80px;
      }

      .ant-menu-item {
        color: #333;

        .badge {
          display: none;
        }
      }
    }
  }

  .sidebar-nav-title {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    color: #9299b8;
    padding: 0 15px;
    display: flex;
  }

  .admin-content {
    padding: 30px;
    min-height: calc(100vh - 64px);
  }

  .atbd-main-layout {
    transition: margin-left 0.3s ease;
    background: #f4f5f7;

    .ant-pro-page-container {
      background: #f4f5f7;
    }

    .ant-pro-page-container-children-container {
      padding: 0;
    }

    .ant-page-header {
      background: #f4f5f7;
      padding: 20px 30px;
      margin-bottom: 0;
      position: relative;
      width: 100%;

      .ant-page-header-heading {
        margin-top: 0;
        margin-bottom: 0;

        .ant-page-header-heading-title {
          font-size: 20px;
          font-weight: 600;
          color: #272b41;
          margin-bottom: 4px;
          line-height: 28px;
        }

        .ant-page-header-heading-sub-title {
          font-size: 14px;
          color: #868eae;
          margin-top: 0;
          line-height: 22px;
        }
      }

      .ant-page-header-breadcrumb {
        margin-bottom: 16px;

        .ant-breadcrumb {
          font-size: 14px;
          line-height: 22px;

          .ant-breadcrumb-link {
            color: #868eae;

            a {
              color: #868eae;
              transition: color 0.3s;

              &:hover {
                color: #5f63f2;
              }
            }
          }

          .ant-breadcrumb-separator {
            color: #868eae;
            margin: 0 8px;
          }

          .ant-breadcrumb-link:last-child {
            color: #272b41;
          }
        }
      }

      .ant-page-header-extra {
        margin-left: auto;
      }
    }
  }

  .admin-footer {
    .admin-footer__copyright {
      display: inline-block;
      width: 100%;
      color: #9299b8;
    }

    .admin-footer__links {
      text-align: right;

      a {
        color: #9299b8;
        text-decoration: none;
        margin-left: 15px;

        &:hover {
          color: #5f63f2;
        }
      }
    }
  }

  .custom-scrollbar {
    .view {
      margin-right: auto;
    }
  }

  header {
    .head-example {
      text-decoration: none;
      color: #5a5f7d;
      box-shadow: none;
      padding: 0 8px;
      cursor: pointer;
      display: inline-block;
      line-height: normal;
      transition: color 0.3s;

      &:hover {
        color: #5f63f2;
      }

      svg {
        width: 20px;
        height: 20px;
        color: inherit;
      }
    }

    .message,
    .notification,
    .settings,
    .support,
    .nav-author {
      display: flex;
      align-items: center;

      span,
      a {
        display: block;
        line-height: normal;
        margin: 0 3px;
      }
    }

    .message .ant-badge-dot {
      background: #20c997 !important;
    }

    .ant-badge {
      .ant-badge-dot {
        right: 50% !important;
      }
    }
  }

  @media (max-width: 991px) {
    header {
      .navbar-brand {
        padding-left: 10px;

        .ant-btn-link {
          padding: 0 15px 0 10px;
        }

        .striking-logo {
          font-size: 18px;
          padding-left: 5px;
        }
      }
    }
  }

  @media (max-width: 767px) {
    header {
      .navbar-brand {
        .striking-logo {
          font-size: 16px;
        }
      }
    }

    .admin-footer__copyright,
    .admin-footer__links {
      text-align: center;
    }

    .admin-footer__copyright {
      margin-bottom: 10px;
    }
  }

  /* Ant Design Table Styles */
  .ant-table {
    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
      color: #272b41;
      border-bottom: 1px solid #f0f0f0;
    }

    .ant-table-tbody > tr > td {
      border-bottom: 1px solid #f0f0f0;
    }

    .ant-table-tbody > tr:hover > td {
      background: #fafafa;
    }
  }

  /* Ant Design Card Styles */
  .ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(146, 153, 184, 0.08);

    .ant-card-head {
      border-bottom: 1px solid #f0f0f0;
      padding: 16px 24px;

      .ant-card-head-title {
        font-size: 16px;
        font-weight: 600;
        color: #272b41;
      }
    }

    .ant-card-body {
      padding: 24px;
    }
  }

  /* Ant Design Select Styles */
  .ant-select {
    .ant-select-selector {
      border-radius: 4px;
    }
  }

  /* Ant Design Input Styles */
  .ant-input-group {
    .ant-input {
      border-radius: 4px 0 0 4px;
    }

    .ant-btn {
      border-radius: 0 4px 4px 0;
    }
  }

  .ant-space-compact {
    display: inline-flex;
    width: auto;
    align-items: center;

    .ant-input-affix-wrapper {
      height: 32px;
      border-radius: 4px 0 0 4px;
      display: inline-flex;
      align-items: center;
      vertical-align: middle;

      .ant-input-prefix {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
        line-height: 1;
      }

      .ant-input {
        height: auto;
        line-height: 1.5715;
        padding: 4px 11px;
      }
    }

    .ant-btn {
      height: 32px;
      border-radius: 0 4px 4px 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      padding: 4px 15px;
    }
  }

  .ant-input-affix-wrapper {
    height: 32px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;

    .ant-input-prefix {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      line-height: 1;
    }

    .ant-input {
      height: auto;
      line-height: 1.5715;
      padding: 4px 11px;
    }
  }

  /* Ant Design Tag Styles */
  .ant-tag {
    border-radius: 4px;
    margin: 0 4px 4px 0;
  }

  /* Ant Design Button Styles */
  .ant-btn {
    border-radius: 4px;
    font-weight: 500;
  }
`

