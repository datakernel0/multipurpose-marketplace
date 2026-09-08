import styled from "styled-components"

export const AdminHeaderContentStyled = styled.div`
  .info-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 0;
    height: 100%;

    .head-example {
      text-decoration: none;
      color: #5a5f7d;
      box-shadow: none;
      padding: 0 8px;
      cursor: pointer;
      display: inline-block;
      line-height: normal;

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

    .nav-author {
      .ant-avatar {
        width: 32px;
        height: 32px;
        cursor: pointer;
      }
    }
  }

  .user-dropdwon {
    max-width: 280px;

    .user-dropdwon__info {
      display: flex;
      align-items: flex-start;
      padding: 20px 25px;
      border-radius: 8px;
      margin-bottom: 12px;
      background: #f4f5f7;

      .ant-avatar {
        margin-right: 15px;
      }

      figcaption {
        h5 {
          font-size: 14px;
          margin-bottom: 2px;
          color: #272b41;
          font-weight: 500;
        }

        p {
          margin-bottom: 0;
          font-size: 13px;
          color: #9299b8;
        }
      }
    }

    .user-dropdwon__links {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin: 0;

        a {
          width: calc(100% + 30px);
          left: -15px;
          right: -15px;
          display: inline-flex;
          align-items: center;
          padding: 10px 12px;
          font-size: 14px;
          transition: 0.3s;
          color: #9299b8;
          text-decoration: none;

          &:hover {
            background: rgba(95, 99, 242, 0.05);
            color: #5f63f2;
            padding-left: 22px;
          }

          svg {
            width: 16px;
            margin-right: 14px;
          }
        }
      }
    }

    .user-dropdwon__bottomAction {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      position: relative;
      width: calc(100% + 30px);
      left: -15px;
      right: -15px;
      height: calc(100% + 15px);
      bottom: -15px;
      border-radius: 0 0 6px 6px;
      padding: 15px 0;
      border: none;
      background: #f8f9fb;
      color: #9299b8;
      cursor: pointer;
      transition: color 0.3s;

      &:hover:not(:disabled) {
        color: #5f63f2;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      svg {
        width: 15px;
        height: 15px;
        margin-right: 8px;
      }
    }
  }
`

