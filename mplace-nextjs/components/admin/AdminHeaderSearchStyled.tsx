import styled from "styled-components"

export const AdminHeaderSearchStyled = styled.div`
  .certain-category-search-wrapper {
    width: 100%;
    padding: 0 15px;

    input {
      max-width: 350px;
      background: transparent;
      color: #5a5f7d;
      border: none;
      box-shadow: none;
      padding-left: 5px;

      &:focus {
        border: none;
        box-shadow: none;
        outline: none;
      }

      &::placeholder {
        color: #9299b8;
      }
    }

    .certain-category-icon {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      color: #9299b8;
      padding-right: 10px;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    .ant-row-middle {
      align-items: center;
    }
  }
`

